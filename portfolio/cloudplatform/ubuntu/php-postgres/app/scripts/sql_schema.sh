#!/usr/bin/env bash

set -xe

cd /app

echo "Configure Postgresql schema"

PGHOST="${DB_CONNECTIONSTRING}" \
PGDATABASE="${DB_NAME}" \
PGUSER="${DB_USERNAME}" \
PGPASSWORD="${DB_PASSWORD}" \
psql -p 5432 < /app/scripts/inputdata.sql || true

# Also configure connect.php with the database details
sed -i "s/host=connectionstring/host=${DB_CONNECTIONSTRING}/" /var/www/html/includes/connect.php
sed -i "s/dbname=dbname/dbname=${DB_NAME}/" /var/www/html/includes/connect.php
sed -i "s/user=user/user=${DB_USERNAME}/" /var/www/html/includes/connect.php
sed -i "s/password=password/password=${DB_PASSWORD}/" /var/www/html/includes/connect.php
