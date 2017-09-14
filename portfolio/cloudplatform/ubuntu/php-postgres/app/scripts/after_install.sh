#!/usr/bin/env bash

set -xeu

cd /app
chmod +x ./scripts/*.sh

# Copy file over the apache html folder
cp -rv ./public/* /var/www/html/
# Amend the apache config to use main.php as the default index file
sed -i 's/DirectoryIndex/DirectoryIndex main.php/g' /etc/apache2/mods-enabled/dir.conf

# Not implemented: customized port - using port 80 by default
#apache_port=$(/app/scripts/entrypoint.sh env | grep PORT | cut -d= -f2)
#sed -i "s/^Listen 80$/Listen ${apache_port}/g" /etc/apache2/ports.conf

# Update database and connection settings
./scripts/entrypoint.sh ./scripts/sql_schema.sh
# Reload apache configuration or restart the service if required
service apache2 reload || true
