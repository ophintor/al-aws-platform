#!/usr/bin/env bash

set -exu

# shellcheck disable=SC2155
declare -r BASEDIR="$(dirname "$(perl -e 'use Cwd qw/realpath/; print realpath($ARGV[0]."/../");' "$0")")"

STACK_NAME="${STACK_NAME:-presentation}"
REGION="${REGION:-eu-west-1}"

STACK_FILE="${STACK_FILE:-infrastructure.yaml}"
PARAMS_FOLDER="${PARAMS_FOLDER:-${BASEDIR}/utils/demo}"
STACK_PARAMS_FILE="${STACK_FILE%.*}.json"


declare -r CF_TEMPLATE="${BASEDIR}/cloudformation/${STACK_FILE}"
declare -r S3_BUCKET="al-cf-templates-${REGION}"
declare -r CF_S3_OBJECT="s3://${S3_BUCKET}/${STACK_FILE}"
declare -r S3_OBJECT_URL="https://s3-${REGION}.amazonaws.com/${S3_BUCKET}/${STACK_FILE}"

if ! aws s3api head-bucket --region "${REGION}" --bucket "${S3_BUCKET}"; then
	aws s3api create-bucket \
		--region "${REGION}" \
		--bucket "${S3_BUCKET}" \
		--create-bucket-configuration LocationConstraint="${REGION}"
fi

aws s3 cp \
	--region "${REGION}" \
	"${CF_TEMPLATE}" \
	"${CF_S3_OBJECT}"

STACK_STATUS=$(aws cloudformation describe-stacks \
	--region "${REGION}" \
	--query "Stacks[?StackName==\`${STACK_NAME}\`].StackStatus" \
	--output text \
)

case "${STACK_STATUS}" in
	# Supported states
	# CREATE_IN_PROGRESS | CREATE_FAILED | CREATE_COMPLETE | ROLLBACK_IN_PROGRESS | ROLLBACK_FAILED | ROLLBACK_COMPLETE |
	# DELETE_IN_PROGRESS | DELETE_FAILED | DELETE_COMPLETE | UPDATE_IN_PROGRESS | UPDATE_COMPLETE_CLEANUP_IN_PROGRESS |
	# UPDATE_COMPLETE | UPDATE_ROLLBACK_IN_PROGRESS | UPDATE_ROLLBACK_FAILED |
	# UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS | UPDATE_ROLLBACK_COMPLETE | REVIEW_IN_PROGRESS

	*_COMPLETE)
		declare -r action="update-stack"
		declare -r wait_action="stack-update-complete"
	;;
	"")
		declare -r action="create-stack"
		declare -r wait_action="stack-create-complete"
	;;
	*)
		echo "Stack is in an unsuported status [${STACK_STATUS}]"
		exit 1
	;;
esac

aws cloudformation "${action}" \
	--region "${REGION}" \
	--template-url "${S3_OBJECT_URL}" \
	--stack-name "${STACK_NAME}" \
	--capabilities "CAPABILITY_NAMED_IAM" \
	--parameters "$(tr '\n\r\t' ' ' < "${PARAMS_FOLDER}/${STACK_PARAMS_FILE}")"

aws cloudformation wait ${wait_action} \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}"

# Wait input from user
read -s -n 1 -r -p "Press [Enter] key to push code..." ; echo

# Upload code to codecommit
GIT_REMOTE=$(aws --region "${REGION}" cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='RepoURL'].OutputValue"  --output text)

# Close the eyes and delete, just to work multiple times
git remote rm codecommit &>/dev/null || true

git remote add codecommit "${GIT_REMOTE}"
# Push the current commit to codecommit master branch
git push codecommit HEAD:refs/heads/master

# Dump outputs from CF Stack
aws cloudformation describe-stacks \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}" \
	--query 'Stacks[0].Outputs' \
	--output table

# Deploy Kibana dashboards.
ES_URL=$(aws --region "${REGION}" cloudformation describe-stacks --stack-name "${STACK_NAME}" --query "Stacks[0].Outputs[?OutputKey=='KibanaURL'].OutputValue" --output text | cut -f 1-3 -d'/')
if [ -z "${ES_URL}" ]; then
	echo "No Kibana URL found, skipt Kibana dashboards deploy"
else
	"${BASEDIR}/kibana/load.sh" -url "$ES_URL"
fi
