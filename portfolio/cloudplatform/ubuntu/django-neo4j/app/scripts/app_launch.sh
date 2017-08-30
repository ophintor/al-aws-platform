#!/usr/bin/env bash

nohup python /app/public/django/manage.py runserver 0.0.0.0:"${PORT}" 1>/tmp/server.log 2>/tmp/server.err &
