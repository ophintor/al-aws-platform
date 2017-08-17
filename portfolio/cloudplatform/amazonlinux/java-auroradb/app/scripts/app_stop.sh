#!/usr/bin/env bash

set -x

for pid in $(pgrep java); do
  kill -9 "${pid}"
done

echo "[WebApp] App stopped"
