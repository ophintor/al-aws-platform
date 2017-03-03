#!/usr/bin/env bash

set -xe

DBUsername="root"
DBPassword="password"
DBName="todo"
# DBInstance.Endpoint.Address
RDS_CONNECTION_STRING=

for host in $(aws rds describe-db-instances --region eu-west-1 --query 'DBInstances[].Endpoint.Address' --output text) ; do
    nc -vz -w 5 $host 3306 && {
        RDS_CONNECTION_STRING=$host
        break
    } || continue
done

cd /app

echo "Configure MySQL schema"
# If MySQL client is not installed, fail!
MYSQL=$(which mysql)
cat schema.sql | ${MYSQL} -h ${RDS_CONNECTION_STRING} -p${DBPassword} -u ${DBUsername} ${DBName} || true