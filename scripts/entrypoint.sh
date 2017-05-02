#!/usr/bin/env bash

set -u

AWS_REGION=$(curl "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep region | awk -F\" '{print $4}')

if which ec2metadata &>/dev/null ; then
STACK_NAME=$(aws ec2 describe-tags \
	--filter Name=resource-id,Values="$(ec2metadata | grep instance-id | awk '{ print $2}')" \
	--query "Tags[?Key==\`aws:cloudformation:stack-name\`].Value" \
	--output text \
	--region "${AWS_REGION}" \
)

# This version exports automatically all the parameteres that the application have access
# TODO: use NextToken to iterate parameteres
rm -f ENV_VARIABLES.sh 2> /dev/null
PARAMS=$(aws --region "${AWS_REGION}" ssm describe-parameters --max-results 50 --query 'Parameters[*].{Name:Name}' --output text)
for param in $PARAMS ; do
	value=$(aws --region "${AWS_REGION}" ssm get-parameters --names "${param}" --with-decryption --output text --query 'Parameters[0].Value' 2>/dev/null)
	# shellcheck disable=SC2181
	[ "$?" -eq "0" ] || continue
	param="$(echo "${param}" | sed "s/^${STACK_NAME}.//g" | tr '[:lower:].' '[:upper:]_')"
	echo "${param}"="${value}" >> ENV_VARIABLES.sh
	export "${param}"="${value}"
done

# This version uses Instance tags to map env vars to a parameter value using its name
TAG_PREFIX="${STACK_NAME}:exports:param:"
INSTANCE=$(ec2metadata | grep instance-id | awk '{ print $2}')
while read -r line ; do
    args=($line)
    tag=${args[0]}
    param=${args[1]}
    NEW_VAR=${tag/#${TAG_PREFIX}/}
    echo "exporting env var: ${NEW_VAR}"
    export "${NEW_VAR}"="$(aws --region "${AWS_REGION}" ssm get-parameters --names "${param}" --with-decryption --output text --query 'Parameters[0].Value')"
done < <(aws ec2 describe-tags --filter Name=resource-id,Values="${INSTANCE}" --query "Tags[?starts_with(Key, \`${TAG_PREFIX}\`)].{Key:Key,Value:Value}" --output text --region "${AWS_REGION}")
fi

# This version allows the user the specify the environemt variables using prefixed environment variables (SSM_) with the parameter name to "resolve"
for v in ${!SSM_*} ; do
	echo "Processing env var: ${v}"
	NEW_VAR=${v/#SSM_/}
	echo "exporting env var: ${NEW_VAR}"
	export "${NEW_VAR}"="$(aws --region "${AWS_REGION}" ssm get-parameters --names "${!v}" --with-decryption --output text --query 'Parameters[0].Value')"
done

# Run the command
# shellcheck disable=SC2068
$@
