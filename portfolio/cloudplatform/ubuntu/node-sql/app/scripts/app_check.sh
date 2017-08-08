#!/usr/bin/env bash

set -xu

service todolist status

# Wait a while, otherwise curl returns 000 o0
sleep 5

PORT=$(/app/scripts/entrypoint.sh env | grep PORT | cut -d= -f2)

for ((i=0; i<30; ++i )); do
	STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "localhost:${PORT}")

	if [ "${STATUS_CODE}" -eq 200 ]; then
		echo "OK Application is heathy!"
		exit 0
	fi

	sleep 1
done

echo "ERROR: Application is not heathy!"
exit 1
