#!/usr/bin/env bash

cd /app || exit

echo "[WebApp] Starting App" || exit
nohup ./scripts/entrypoint.sh python ./public/django/manage.py runserver 0:8000 1>/tmp/server.log 2>/tmp/server.err &

echo "[WebApp] App started" || exit
