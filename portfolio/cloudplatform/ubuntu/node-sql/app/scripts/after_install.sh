#!/usr/bin/env bash

set -xeu

cd /app

chmod +x ./scripts/sql_schema.sh
chmod +x ./scripts/entrypoint.sh

./scripts/entrypoint.sh ./scripts/sql_schema.sh

echo "Install Todo list SystemD service"
install -v -C \
	--owner root \
	--group root \
	--mode 0400 \
	scripts/systemd/todolist.service /etc/systemd/system/todolist.service

echo "Reload systemctl to read new systemd service"
systemctl daemon-reload
