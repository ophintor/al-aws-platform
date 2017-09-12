#!/usr/bin/env bash

set -xe

cd /app

echo "[WebApp] Starting App"
nohup ./scripts/entrypoint.sh service apache2 start  1>/var/log/apache2/server.log 2>var/log/apache2/server.err &
echo "[WebApp] App started"
