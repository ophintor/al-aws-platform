#!/usr/bin/env bash

set -xeu

cd /app

sudo chmod +x ./scripts/*
sudo ./scripts/entrypoint.sh ./scripts/init_db.sh
