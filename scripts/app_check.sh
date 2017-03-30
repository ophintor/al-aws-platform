#!/usr/bin/env bash

set -xu

PORT=3000

for i in {1..10} ; do
	STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "localhost:${PORT}")

	if [ ${STATUS_CODE} -eq 200 ]; then
		echo "OK Application is heathy!"
		exit 0
	fi

	sleep 1
done

echo "ERROR: Application is not heathy!"
exit 1
