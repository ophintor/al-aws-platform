#!/usr/bin/env bash

set -xe

for pid in $(pgrep rails | awk '{print $2}') ; do
    kill -9 "${pid}"
done

echo "[WebApp] App stoped"
