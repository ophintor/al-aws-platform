#!/usr/bin/env bash

set -xu

STACK_NAME="${STACK_NAME:-presentation}"
REGION="${REGION:-eu-west-1}"

aws s3 rb \
	--region "${REGION}" \
	s3://${STACK_NAME}-codepipeline-artifacts \
	--force || true

aws ecr delete-repository \
	--region "${REGION}" \
	--repository-name "${STACK_NAME}-myapp" \
	--force || true

aws cloudformation delete-stack \
	--region "${REGION}" \
    --stack-name "${STACK_NAME}-MyApp-Service" || true

aws cloudformation wait stack-delete-complete \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}-MyApp-Service"

aws cloudformation delete-stack \
	--region "${REGION}" \
    --stack-name ${STACK_NAME} || true

aws cloudformation wait stack-delete-complete \
	--region "${REGION}" \
	--stack-name "${STACK_NAME}"

# Cleanup ACM Certificates
CERT_ARN=$(\
	aws acm list-certificates \
		--region "${REGION}" \
		--query "CertificateSummaryList[?ends_with(DomainName,\`${STACK_NAME}.al-labs.co.uk\`)].CertificateArn" \
		--output text \
)

for arn in ${CERT_ARN} ; do
	echo aws acm delete-certificate \
		--region "${REGION}" \
		--certificate-arn ${arn}
done

# Cleanup Los Groups
for groupName in "${STACK_NAME}-myapp" "${STACK_NAME}-myapp-image" "${STACK_NAME}-set-param-store" ; do
	aws logs delete-log-group \
		--region "${REGION}" \
		--log-group-name "/aws/codebuild/${groupName}"
done

# Cleanup Parameter Store
SSM_PARAMS=$(aws ssm describe-parameters --query 'Parameters[?starts_with(Name, `'${STACK_NAME}'`)].{Name:Name}' --output text)
for param in ${SSM_PARAMS} ; do
	aws ssm delete-parameter \
		--region "${REGION}" \
		--name ${param}
done
