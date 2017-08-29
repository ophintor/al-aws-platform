#!/usr/bin/env bash

set -xeu

cd /app || exit

pip install neo4django py2neo httpie || exit

cat >/etc/rc.local <<EOL
#!/bin/sh
sudo nohup /app/scripts/entrypoint.sh python /app/public/django/manage.py runserver 0:8000
exit 0
EOL


sudo chmod +x ./scripts/init_db.sh
sudo chmod +x ./scripts/entrypoint.sh
sudo ./scripts/entrypoint.sh ./scripts/init_db.sh
