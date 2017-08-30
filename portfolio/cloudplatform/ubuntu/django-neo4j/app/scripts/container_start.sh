#!/bin/bash

bash /app/scripts/init_db.sh
python /app/public/django/manage.py runserver 0.0.0.0:"${PORT}"
