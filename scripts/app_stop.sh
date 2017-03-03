#!/usr/bin/env bash

set -xe

for pid in `pidof node` ; do
    kill -9 $pid
done

echo "[WebApp] App stoped"