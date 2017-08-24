#!/usr/bin/env bash

set -xeu

cd /app
bundle install

chmod +x scripts/entrypoint.sh
