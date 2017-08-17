#!/usr/bin/env bash

set -xe

cd /app

echo "[WebApp] Starting App"

nohup scripts/entrypoint.sh java -jar java-application/target/demo-0.0.1-SNAPSHOT.jar 1>/tmp/server.log 2>&1 &

echo "[WebApp] App started"
