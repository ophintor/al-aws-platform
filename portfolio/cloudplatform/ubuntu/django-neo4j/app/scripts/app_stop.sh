#!/usr/bin/env bash

for pid in $(pidof python | awk '{print $1,$2}') ; do
    kill -9 "${pid}"
done

echo "[WebApp] App stopped"
