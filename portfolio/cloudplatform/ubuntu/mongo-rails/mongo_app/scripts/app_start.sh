#!/usr/bin/env bash

set -xe

cd /app

echo "[WebApp] Starting App"
nohup scripts/entrypoint.sh rails s -b 0.0.0.0 1>/tmp/server.log 2>/tmp/server.err &

echo "[WebApp] App started"
