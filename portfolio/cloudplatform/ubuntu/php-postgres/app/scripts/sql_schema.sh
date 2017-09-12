#!/usr/bin/env bash

set -xe

cd /app

echo "Configure Postgresql schema"
# --Insert inputdata into database

# PGHOST=cd1xmrhq9zu6ahh.cv4d7vig15ff.us-west-2.rds.amazonaws.com \
# PGDATABASE=adminchryseb \
# PGUSER=adminchryseb PGPASSWORD=password \
# psql -p 5432 < /app/scripts/test/inputdata.sql || true

PGHOST="${DB_CONNECTIONSTRING}" \
PGDATABASE="${DB_NAME}" \
PGUSER="${DB_USERNAME}" PGPASSWORD="${DB_PASSWORD}" \
psql -p 5432 < /app/scripts/inputdata.sql || true
