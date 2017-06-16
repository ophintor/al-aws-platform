#!/usr/bin/env bash

# This scripts accesses the first container it finds in an ECS cluster using
# the ECS node public IP

set -eu

# Ignore ssh host fingerprint check, this changes frequently and this is only
# used for demos we should never work inside a container :)
readonly UNSAFE_SSH='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

STACK_NAME="${STACK_NAME:-presentation}"
REGION="${REGION:-eu-west-1}"

TASK_ARN=$(aws ecs list-tasks \
	--region "${REGION}" \
	--cluster "${STACK_NAME}-cluster" \
	--query 'taskArns[0]' \
	--output "text"
)
CONTAINER_INSTANCE=$(aws ecs describe-tasks \
	--region "${REGION}" \
	--tasks "${TASK_ARN}" \
	--cluster "${STACK_NAME}-cluster" \
	--query 'tasks[0].containerInstanceArn' \
	--output "text"
)
INSTANCE=$(aws ecs describe-container-instances \
	--region "${REGION}" \
	--cluster "${STACK_NAME}-cluster" \
	--container-instances "${CONTAINER_INSTANCE}" \
	--query "containerInstances[?runningTasksCount>\`0\`] | [0].ec2InstanceId" \
	--output "text"
)
PUBLIC_IP=$(aws ec2 describe-instances \
	--region "${REGION}" \
	--instance-ids "${INSTANCE}" \
	--query 'Reservations[0].Instances[0].PublicIpAddress' \
	--output "text"
)

# Initial script to to print usefull commands and open a shell inside the container
SCRIPT=$(cat <<-EOF
	CONTAINER_ID=\$(docker ps --filter \"label=com.amazonaws.ecs.task-arn=${TASK_ARN}\" --format '{{ .ID }}') ;
	export AWS_REGION=\$(curl "http://169.254.169.254/latest/dynamic/instance-identity/document" 2>/dev/null | grep region | awk -F\" '{print \$4}') ;
	echo -e "\n\e[91mCommands:\e[0m" ;
	echo -e "\e[33m"
	echo "aws --region \${AWS_REGION} ssm put-parameter  --name \"${STACK_NAME}.db.password\" --value \"password\" --type SecureString" ;
	echo "aws --region \${AWS_REGION} ssm get-parameters --name \"${STACK_NAME}.db.password\" --with-decryption" ;
	echo
	echo "aws --region \${AWS_REGION} ssm put-parameter  --name \"${STACK_NAME}.app.pass\"    --value \"password\" --type SecureString" ;
	echo "aws --region \${AWS_REGION} ssm get-parameters --name \"${STACK_NAME}.app.pass\"" ;
	echo -e "\e[0m\n" ;
	docker exec -it \${CONTAINER_ID} /bin/bash
EOF
)

${UNSAFE_SSH} -tt "ec2-user@${PUBLIC_IP}" "${SCRIPT}"
