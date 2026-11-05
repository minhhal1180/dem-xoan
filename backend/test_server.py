import json
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
import uuid
from pathlib import Path
from server import create_server

class APITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.server = create_server(str(Path(cls.temp.name) / 'test.sqlite3'), {'https://example.github.io'}, port=0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/v1'
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown(); cls.server.server_close(); cls.thread.join(); cls.temp.cleanup()
    def call(self, method, path, body=None, token=None, origin=None):
        headers = {'Content-Type': 'application/json'}
        if token: headers['Authorization'] = 'Bearer ' + token
        if origin: headers['Origin'] = origin
        req = urllib.request.Request(self.url + path, json.dumps(body).encode() if body is not None else None, headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.loads(response.read() or b'null'), response.headers
        except urllib.error.HTTPError as response:
            return response.code, json.loads(response.read() or b'null'), response.headers
    def test_auth_isolation_idempotence_delete_and_no_raw_audio(self):
        _, a, _ = self.call('POST', '/identity', {})
        _, b, _ = self.call('POST', '/identity', {})
        sid, aid = str(uuid.uuid4()), str(uuid.uuid4())
        session = {'id': sid, 'role': 'kep', 'mode': 'screen', 'createdAt': '2026-11-05T08:00:00Z', 'endedAt': None, 'ownerId': b['id']}
        self.assertEqual(self.call('PUT', '/sessions/' + sid, session, a['token'])[0], 200)
        attempt = {'id': aid, 'sessionId': sid, 'exerciseId': 'bon-nhip', 'exerciseVersion': 1, 'algorithmVersion': 'demo-1.0', 'voice': 'low', 'createdAt': session['createdAt'], 'rhythm': 80, 'pitch': None, 'confidence': .5, 'feedback': ['Test'], 'onsetOffsetMs': 10, 'medianCents': None, 'samples': [1,2,3]}
        for _ in range(2): self.assertEqual(self.call('PUT', '/attempts/' + aid, attempt, a['token'])[0], 200)
        self.assertEqual(self.call('PUT', '/sessions/' + sid, session, b['token'])[0], 403)
        self.assertEqual(self.call('PUT', '/attempts/' + aid, attempt, b['token'])[0], 403)
        self.assertEqual(self.call('GET', '/progress')[0], 401)
        _, own, _ = self.call('GET', '/progress', token=a['token'])
        self.assertEqual(len(own['attempts']), 1)
        self.assertNotIn('samples', own['attempts'][0])
        self.assertEqual(own['sessions'][0]['ownerId'], a['id'])
        self.assertEqual(self.call('GET', '/progress', token=b['token'])[1]['attempts'], [])
        self.assertEqual(self.call('DELETE', '/progress', token=b['token'])[0], 204)
        self.assertEqual(len(self.call('GET', '/progress', token=a['token'])[1]['attempts']), 1)
        self.assertEqual(self.call('DELETE', '/progress', token=a['token'])[0], 204)
        self.assertEqual(self.call('GET', '/progress', token=a['token'])[1], {'sessions': [], 'attempts': []})
    def test_cors_and_invalid_measurements(self):
        self.assertEqual(self.call('GET', '/health', origin='https://evil.invalid')[0], 403)
        status, _, headers = self.call('OPTIONS', '/progress', origin='https://example.github.io')
        self.assertEqual(status, 204)
        self.assertEqual(headers['Access-Control-Allow-Origin'], 'https://example.github.io')
        _, owner, _ = self.call('POST', '/identity', {})
        self.assertEqual(self.call('PUT', '/sessions/not-a-uuid', {}, owner['token'])[0], 404)
        self.assertEqual(self.call('PUT', '/attempts/' + str(uuid.uuid4()), {'rhythm': float('nan')}, owner['token'])[0], 400)

if __name__ == '__main__': unittest.main()
