#!/usr/bin/env bash

set -xe

cd /app

echo "Configure MySQL schema"
# If MySQL client is not installed, fail!
MYSQL=$(which mysql)
${MYSQL} -h "${DB_CONNECTIONSTRING}" -p"${DB_PASSWORD}" -u "${DB_USERNAME}" "${DB_NAME}" < schema.sql || true
