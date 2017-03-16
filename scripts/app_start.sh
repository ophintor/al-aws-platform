#!/usr/bin/env bash

set -xe

cd /app

echo "[WebApp] Starting App"
nohup ./scripts/entrypoint.sh node server.js 1>/tmp/server.log 2>/tmp/server.err &

echo "[WebApp] App started"
