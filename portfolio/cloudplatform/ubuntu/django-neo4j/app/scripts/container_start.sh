#!/bin/bash

chmod u+x scripts/init_db.sh
scripts/entrypoint.sh scripts/init_db.sh
scripts/entrypoint.sh python public/django/manage.py runserver 0:8000
