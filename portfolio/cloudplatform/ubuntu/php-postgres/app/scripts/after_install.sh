#!/usr/bin/env bash

set -xeu

cd /app
chmod +x ./scripts/*.sh
su --preserve-environment ubuntu

# Copy file over the apache html folder
cp -rv ./public/* /var/www/html/
# Amend the apache config to use main.php as the default index file
sed -i 's/DirectoryIndex/DirectoryIndex main.php/g' /etc/apache2/mods-enabled/dir.conf
#apache_port=$(/app/scripts/entrypoint.sh env | grep PORT | cut -d= -f2)
#sed -i "s/^Listen 80$/Listen ${apache_port}/g" /etc/apache2/ports.conf
# Reload apache configuration
sudo service apache2 reload

AWS_REGION=$(curl "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep region | awk -F\" '{print $4}')

STACK_NAME=$(aws ec2 describe-tags \
--filter Name=resource-id,Values="$(ec2metadata | grep instance-id | awk '{ print $2}')" \
--query "Tags[?Key==\`aws:cloudformation:stack-name\`].Value" \
--output text \
--region "${AWS_REGION}" \
)

# This version exports automatically all the parameteres that the application have access
# TODO: use NextToken to iterate parameteres
PARAMS=$(aws --region "${AWS_REGION}" ssm describe-parameters --max-results 50 --query 'Parameters[*].{Name:Name}' --output text)
for param in $PARAMS ; do
  echo "${param}" | grep "${STACK_NAME}" &>/dev/null || continue
  value=$(aws --region "${AWS_REGION}" ssm get-parameters --names "${param}" --with-decryption --output text --query 'Parameters[0].Value' 2>/dev/null)
  # shellcheck disable=SC2181
  [ "$?" -eq "0" ] || continue
  param="$(echo "${param}" | sed "s/\/${STACK_NAME}\///g" | tr '[:lower:]/' '[:upper:]_')"
  case "$param" in
    DB_CONNECTIONSTRING)
    sed -i "s/host=connectionstring/host=$value/" /var/www/html/includes/connect.php
    ;;
    DB_NAME)
    sed -i "s/dbname=dbname/dbname=$value/" /var/www/html/includes/connect.php
    ;;
    DB_USERNAME)
    sed -i "s/user=user/user=$value/" /var/www/html/includes/connect.php
    ;;
    DB_PASSWORD)
    sed -i "s/password=password/password=$value/" /var/www/html/includes/connect.php
    ;;
  esac
done

./scripts/entrypoint.sh ./scripts/sql_schema.sh
