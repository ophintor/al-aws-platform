#!/usr/bin/env bash

set -xu

PARAMS=$(aws --region "${region}" ssm describe-parameters --query 'Parameters[*].{Name:Name}' --output text)
for param in $PARAMS ; do
	value=$(aws --region "${region}" ssm delete-parameter --name "${param}")
	[ "$?" -eq "0" ] || continue	
done