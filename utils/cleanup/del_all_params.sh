#!/usr/bin/env bash

set -xu

REGION="${REGION:-eu-west-1}"

PARAMS=$(aws --region "${REGION}" ssm describe-parameters --query 'Parameters[*].{Name:Name}' --output text)
for param in $PARAMS ; do
	aws --region "${REGION}" ssm delete-parameter --name "${param}"
done
