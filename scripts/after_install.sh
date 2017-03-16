#!/usr/bin/env bash

set -xeu

cd /app

chmod +x ./scripts/sql_schema.sh

./scripts/entrypoint.sh ./scripts/sql_schema.sh
