#!/usr/bin/env bash

set -u

REGION="${REGION:-eu-west-1}"

NEXT=""
NEXT_T=""
while [ "${NEXT}" != "null" ]; do
	RESULTS=$(aws --region "${REGION}" ssm describe-parameters --output json --max-results 50 ${NEXT_T})
	NEXT=$(echo "${RESULTS}" | jq -r '.NextToken')
	PARAMS=$(echo "${RESULTS}" | jq -r '.Parameters[].Name')
	NEXT_T="--next-token ${NEXT}"

	for param in ${PARAMS}; do
		aws --region "${REGION}" ssm delete-parameter --name "${param}"
	done
done
