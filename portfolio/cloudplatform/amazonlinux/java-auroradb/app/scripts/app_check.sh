#!/usr/bin/env bash

set -xu

PORT=$(/app/scripts/entrypoint.sh env | grep PORT | cut -d= -f2)

for ((i=0; i<30; ++i )); do
	STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "localhost:${PORT}")

	if [ "${STATUS_CODE}" -eq 200 ]; then
		echo "OK Application is healthy!"
		exit 0
	fi

	sleep 1
done

echo "ERROR: Application is not healthy!"
exit 1
