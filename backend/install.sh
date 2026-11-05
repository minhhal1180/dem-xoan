#!/usr/bin/env bash
set -eu
# Run as student from this checkout; does not replace the existing VPS website.
cd "$(dirname "$0")/.."
test "$(id -un)" = student
test "$PWD" = /home/student/projects/dem-xoan
mkdir -p /home/student/.local/share/dem-xoan
chmod 700 /home/student/.local/share/dem-xoan
if ! test -f backend/api.env; then
  umask 077
  cat > backend/api.env <<'ENV'
PORT=8107
DATABASE_PATH=/home/student/.local/share/dem-xoan/progress.sqlite3
ALLOWED_ORIGINS=https://minhhal1180.github.io,http://127.0.0.1:4173,http://localhost:4173,http://127.0.0.1:5173,http://localhost:5173
ENV
fi
python3 -m unittest discover -s backend -p 'test_*.py'
sudo -n install -m 644 backend/dem-xoan-api.service /etc/systemd/system/dem-xoan-api.service
sudo -n install -m 644 backend/nginx-api.conf /etc/nginx/snippets/dem-xoan-api.conf
sudo -n python3 - <<'PY'
from pathlib import Path
import shutil
path = Path('/etc/nginx/sites-available/default')
text = path.read_text()
include = 'include /etc/nginx/snippets/dem-xoan-api.conf;'
backup = path.with_name('default.before-dem-xoan')
if include not in text:
    if 'location / {' not in text:
        raise SystemExit('Existing Nginx layout differs; inspect before editing')
    if backup.exists():
        raise SystemExit('A prior backup exists but include is missing; inspect before editing')
    shutil.copy2(path, backup)
    path.write_text(text.replace('location / {', include + '\n\n\tlocation / {', 1))
PY
if ! sudo -n nginx -t; then
  sudo -n cp /etc/nginx/sites-available/default.before-dem-xoan /etc/nginx/sites-available/default
  exit 1
fi
sudo -n systemctl daemon-reload
sudo -n systemctl enable --now dem-xoan-api
sudo -n systemctl restart dem-xoan-api
sudo -n systemctl reload nginx
sleep 1
curl --fail --silent http://127.0.0.1:8107/v1/health
printf '\n'
