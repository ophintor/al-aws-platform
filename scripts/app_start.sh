#!/usr/bin/env bash

set -xe

apt install awscli

cd /app

for host in $(aws rds describe-db-instances --region eu-west-1 --query 'DBInstances[].Endpoint.Address' --output text) ; do
    nc -vz -w 5 $host 3306 && {
        RDS_CONNECTION_STRING=$host
        break
    } || continue
done

sed -i "s/localhost/${RDS_CONNECTION_STRING}/" server.js

echo "[WebApp] Starting App 'service :D' like a boss"
nohup node server.js 1>/tmp/server.log  2>/tmp/server.err &

echo "[WebApp] App started"