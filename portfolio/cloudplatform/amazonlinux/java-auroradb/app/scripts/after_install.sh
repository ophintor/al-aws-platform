#!/usr/bin/env bash

set -xeu

cd /app

chmod +x ./scripts/sql_schema.sh
chmod +x ./scripts/entrypoint.sh

./scripts/entrypoint.sh ./scripts/sql_schema.sh
