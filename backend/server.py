"""Đêm Xoan demo API. Standard library only; put behind an HTTPS reverse proxy."""
import hashlib
import json
import math
import os
import secrets
import sqlite3
import threading
import time
import uuid
from collections import defaultdict, deque
from contextlib import contextmanager
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS identities (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS learning_sessions (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES identities(id), payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES identities(id),
 session_id TEXT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
 payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_owner ON learning_sessions(owner_id);
CREATE INDEX IF NOT EXISTS attempts_owner ON attempts(owner_id);
"""

class APIError(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message

def valid_uuid(value):
    try:
        return str(uuid.UUID(value)) == value
    except (ValueError, TypeError, AttributeError):
        return False

def timestamp(value):
    try:
        return isinstance(value, str) and len(value) < 40 and datetime.fromisoformat(value.replace('Z', '+00:00')).tzinfo is not None
    except ValueError:
        return False

def validate_session(data, item_id, owner):
    if data.get('id') != item_id or not timestamp(data.get('createdAt')) or data.get('role') not in ('kep', 'dao') or data.get('mode') not in ('screen', 'cardboard'):
        raise APIError(400, 'Invalid session')
    if data.get('endedAt') is not None and not timestamp(data['endedAt']):
        raise APIError(400, 'Invalid end time')
    return {key: data.get(key) for key in ('id', 'role', 'mode', 'createdAt', 'endedAt')} | {'ownerId': owner}

def validate_attempt(data, item_id, owner):
    if data.get('id') != item_id or not valid_uuid(data.get('sessionId')) or not timestamp(data.get('createdAt')):
        raise APIError(400, 'Invalid attempt')
    if data.get('exerciseId') not in ('bon-nhip', 'ba-not', 'doi-dap') or data.get('voice') not in ('low', 'high') or data.get('exerciseVersion') != 1 or data.get('algorithmVersion') != 'demo-1.0':
        raise APIError(400, 'Invalid exercise')
    for field, limit, nullable in [('rhythm', 100, True), ('pitch', 100, True), ('confidence', 1, False), ('onsetOffsetMs', 15000, True), ('medianCents', 12000, True)]:
        value = data.get(field)
        if value is None and nullable:
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or abs(value) > limit or (field in ('rhythm', 'pitch', 'confidence') and value < 0):
            raise APIError(400, 'Invalid measurement')
    feedback = data.get('feedback')
    if not isinstance(feedback, list) or not 1 <= len(feedback) <= 5 or any(not isinstance(s, str) or len(s) > 500 for s in feedback):
        raise APIError(400, 'Invalid feedback')
    keys = ('id', 'sessionId', 'exerciseId', 'exerciseVersion', 'algorithmVersion', 'voice', 'createdAt', 'rhythm', 'pitch', 'confidence', 'onsetOffsetMs', 'medianCents', 'feedback')
    return {key: data.get(key) for key in keys} | {'ownerId': owner, 'syncStatus': 'synced'}

def create_server(db_path, origins, host='127.0.0.1', port=8107):
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    @contextmanager
    def connect():
        conn = sqlite3.connect(db_path, timeout=10)
        conn.execute('PRAGMA foreign_keys=ON')
        try:
            with conn:
                yield conn
        finally:
            conn.close()
    with connect() as conn:
        conn.executescript(SCHEMA)
    limits, lock = defaultdict(deque), threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        server_version = 'DemXoanAPI/1'
        def setup(self):
            super().setup()
            self.connection.settimeout(15)
        def log_message(self, *_args):
            pass  # Never log authorization headers or request payloads.
        def send_json(self, status, data=None):
            body = json.dumps(data, ensure_ascii=False, allow_nan=False).encode() if data is not None else b''
            self.send_response(status)
            origin = self.headers.get('Origin')
            if origin in origins:
                self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def guard(self):
            origin = self.headers.get('Origin')
            if origin and origin not in origins:
                raise APIError(403, 'Origin not allowed')
        def rate(self, key, maximum=180, window=60):
            now = time.monotonic()
            with lock:
                if len(limits) > 10000:
                    for k in list(limits):
                        if not limits[k] or now - limits[k][-1] > 3600:
                            del limits[k]
                bucket = limits[key]
                while bucket and now - bucket[0] >= window:
                    bucket.popleft()
                if len(bucket) >= maximum:
                    raise APIError(429, 'Too many requests')
                bucket.append(now)
        def owner(self, conn):
            header = self.headers.get('Authorization', '')
            if not header.startswith('Bearer ') or len(header) > 150:
                raise APIError(401, 'Authentication required')
            digest = hashlib.sha256(header[7:].encode()).hexdigest()
            row = conn.execute('SELECT id FROM identities WHERE token_hash=?', (digest,)).fetchone()
            if not row:
                raise APIError(401, 'Invalid identity')
            self.rate(row[0])
            return row[0]
        def body(self):
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 16384:
                    raise APIError(413, 'Body size out of bounds')
                data = json.loads(self.rfile.read(size))
                if not isinstance(data, dict):
                    raise ValueError()
                return data
            except (ValueError, json.JSONDecodeError):
                raise APIError(400, 'Invalid JSON')
        def dispatch(self, method):
            try:
                self.guard()
                path = self.path.split('?')[0]
                if method == 'GET' and path == '/v1/health':
                    return self.send_json(200, {'ok': True, 'service': 'dem-xoan', 'version': 1})
                with connect() as conn:
                    if method == 'POST' and path == '/v1/identity':
                        self.rate('identity:' + self.client_address[0], 30, 3600)
                        self.body()
                        token, owner = secrets.token_urlsafe(32), str(uuid.uuid4())
                        conn.execute('INSERT INTO identities VALUES (?,?,?)', (owner, hashlib.sha256(token.encode()).hexdigest(), datetime.now().astimezone().isoformat()))
                        conn.commit()
                        return self.send_json(201, {'id': owner, 'token': token})
                    owner = self.owner(conn)
                    if path == '/v1/progress':
                        if method == 'GET':
                            sessions = [json.loads(row[0]) for row in conn.execute('SELECT payload FROM learning_sessions WHERE owner_id=?', (owner,))]
                            attempts = [json.loads(row[0]) for row in conn.execute('SELECT payload FROM attempts WHERE owner_id=?', (owner,))]
                            return self.send_json(200, {'sessions': sessions, 'attempts': attempts})
                        if method == 'DELETE':
                            conn.execute('DELETE FROM attempts WHERE owner_id=?', (owner,))
                            conn.execute('DELETE FROM learning_sessions WHERE owner_id=?', (owner,))
                            conn.commit()
                            return self.send_json(204)
                    parts = path.strip('/').split('/')
                    if method != 'PUT' or len(parts) != 3 or parts[0] != 'v1' or parts[1] not in ('sessions', 'attempts') or not valid_uuid(parts[2]):
                        raise APIError(404, 'Not found')
                    kind, item_id, data = parts[1], parts[2], self.body()
                    table = 'learning_sessions' if kind == 'sessions' else 'attempts'
                    existing = conn.execute(f'SELECT owner_id FROM {table} WHERE id=?', (item_id,)).fetchone()
                    if existing and existing[0] != owner:
                        raise APIError(403, 'Not permitted')
                    if kind == 'sessions':
                        clean = validate_session(data, item_id, owner)
                        conn.execute('INSERT INTO learning_sessions VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', (item_id, owner, json.dumps(clean, allow_nan=False)))
                    else:
                        clean = validate_attempt(data, item_id, owner)
                        parent = conn.execute('SELECT owner_id FROM learning_sessions WHERE id=?', (clean['sessionId'],)).fetchone()
                        if not parent or parent[0] != owner:
                            raise APIError(403, 'Session not permitted')
                        conn.execute('INSERT INTO attempts VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, session_id=excluded.session_id', (item_id, owner, clean['sessionId'], json.dumps(clean, allow_nan=False)))
                    conn.commit()
                    self.send_json(200, {'id': item_id, 'saved': True})
            except APIError as error:
                self.send_json(error.status, {'error': error.message})
            except (sqlite3.Error, OSError, ValueError):
                self.send_json(500, {'error': 'Storage unavailable'})
        def do_OPTIONS(self):
            try:
                self.guard()
                self.send_response(204)
                origin = self.headers.get('Origin')
                if origin in origins:
                    self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
                self.send_header('Access-Control-Max-Age', '600')
                self.end_headers()
            except APIError as error:
                self.send_json(error.status, {'error': error.message})
        def do_GET(self): self.dispatch('GET')
        def do_POST(self): self.dispatch('POST')
        def do_PUT(self): self.dispatch('PUT')
        def do_DELETE(self): self.dispatch('DELETE')
    return ThreadingHTTPServer((host, port), Handler)

if __name__ == '__main__':
    origins = set(os.environ.get('ALLOWED_ORIGINS', 'http://127.0.0.1:4173,http://localhost:4173,https://minhhal1180.github.io').split(','))
    server = create_server(os.environ.get('DATABASE_PATH', str(Path.home() / '.local/share/dem-xoan/progress.sqlite3')), origins, port=int(os.environ.get('PORT', '8107')))
    print('Dem Xoan API listening on loopback', flush=True)
    server.serve_forever()
