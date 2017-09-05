import boto3
import cfnresponse
from botocore.exceptions import ClientError


accepted_requests = {'Create'}


def handler(event, context):
    if event['RequestType'] not in accepted_requests:
        # Send a successful response to CloudFormation and exit
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
        return 0

    client = boto3.client('cloudtrail')
    s3client = boto3.client('s3')

    try:
        cloudtrail_response = client.put_event_selectors(
            TrailName=event['ResourceProperties']['Trail'],
            EventSelectors=[
                {
                    'ReadWriteType': 'All',
                    'IncludeManagementEvents': True,
                    'DataResources': [
                        {
                            'Type': 'AWS::S3::Object',
                            'Values': [
                                event['ResourceProperties']['BucketArn']+'/AWS'
                            ]
                        },
                    ]
                },
            ]
        )
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
        return 0
    except ClientError as e:
        response_data = {'Reason': str(e)}
        cfnresponse.send(event, context, cfnresponse.FAILED, response_data)
        return 1
