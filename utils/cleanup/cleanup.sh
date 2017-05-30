#!/usr/bin/env bash

set -xu

STACK_NAME="${STACK_NAME:-presentation}"
REGION="${REGION:-eu-west-1}"

aws ecr delete-repository \
	--region "${REGION}" \
	--repository-name "${STACK_NAME}-myapp" \
	--force

aws cloudformation delete-stack \
	--region "${REGION}" \
    --stack-name "${STACK_NAME}-MyApp-Service"

aws cloudformation wait stack-delete-complete \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}-MyApp-Service"

aws cloudformation delete-stack \
	--region "${REGION}" \
    --stack-name "${STACK_NAME}"

aws cloudformation wait stack-delete-complete \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}"

# Cleanup ACM Certificates
CERT_ARN=$(\
	aws acm list-certificates \
		--region "${REGION}" \
		--query "CertificateSummaryList[?ends_with(DomainName,\`${STACK_NAME}.al-labs.co.uk\`)].CertificateArn" \
		--output text \
)

for arn in ${CERT_ARN} ; do
	aws acm delete-certificate \
		--region "${REGION}" \
		--certificate-arn "${arn}"
done

# Cleanup Los Groups
declare -a LOG_GROUPS=(
	"/aws/codebuild/${STACK_NAME}-myapp"
	"/aws/codebuild/${STACK_NAME}-myapp-image"
	"/aws/codebuild/${STACK_NAME}-application"
	"/aws/codebuild/${STACK_NAME}-kibana"
	"/aws/lambda/${STACK_NAME}-es-snapshots"
	"/aws/lambda/${STACK_NAME}-set-param-store"
	"/aws/lambda/${STACK_NAME}-LogMigrationLambda"
	"/aws/lambda/${STACK_NAME}-LogStreamer"
	"/aws/lambda/${STACK_NAME}-ParameterStoreLambda"
	"/aws/lambda/${STACK_NAME}-SnapshotCreateLambda"
	"/aws/lambda/${STACK_NAME}-SnapshotRepoCreateLambda"
	"/aws/lambda/${STACK_NAME}-ELBLogsToCWLambda"
	"${STACK_NAME}-ecs"
	"${STACK_NAME}-apperr"
	"${STACK_NAME}-applog"
	"${STACK_NAME}-cloudinitoutput"
	"${STACK_NAME}-cloudtrail"
	"${STACK_NAME}-elblog"
	"${STACK_NAME}-syslog"  
)

LOG_GROUPS+=(
	$(aws --region "${REGION}" logs describe-log-groups --query "logGroups[?starts_with(logGroupName, \`${STACK_NAME}-TrailLogGroup\`)].logGroupName" --output text)
)
for groupName in "${LOG_GROUPS[@]}" ; do
	aws logs delete-log-group \
		--region "${REGION}" \
		--log-group-name "${groupName}"
done

# Cleanup CloudTrail S3 objects
declare -a S3_BUCKETS=(
	"${STACK_NAME}-codepipeline-artifacts"
	"${STACK_NAME}-artifacts"
	"${STACK_NAME}-elb-logs"
	"${STACK_NAME}-es-snapshots"
	"${STACK_NAME}-logs"
	"${STACK_NAME}-snapshots"
)

S3_BUCKETS+=(
	$(aws s3api list-buckets \
		--region "${REGION}" \
		--query "Buckets[?starts_with(Name, \`${STACK_NAME}-trailbucket\`)].Name" \
		--output text
	)
)
for bucketName in "${S3_BUCKETS[@]}"; do
	aws s3 rb \
		--region "${REGION}" \
		"s3://${bucketName}" \
		--force
done

# Cleanup Parameter Store
# NOTE: parameter "namespace" are splited using ',' (dot) and so we use it to
# delimit the <STACK_NAME>
SSM_PARAMS=$(aws ssm describe-parameters \
	--region "${REGION}" \
	--query "Parameters[?starts_with(Name, \`${STACK_NAME}.\`)].{Name:Name}" \
	--output text
)
for param in ${SSM_PARAMS} ; do
	aws ssm delete-parameter \
		--region "${REGION}" \
		--name "${param}"
done
