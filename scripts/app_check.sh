#!/usr/bin/env bash

set -xe

PORT=3000

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "localhost:${PORT}")

if [ ${STATUS_CODE} -eq 200 ]; then
    echo "OK Application is heathy!"
    exit 0
else
    echo "ERROR: Application is not heathy!"
    exit 1
fi