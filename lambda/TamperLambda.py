import boto3
import base64
import uuid
import httplib
import urlparse
import json
import cfnresponse


def getBucketName(bucket):
  return bucket["Name"]


def getLogBuckets(bucket_name):
  if "logs" in bucket_name and "elb" not in bucket_name:
    return True


def getBucketArn(bucket_name):
  return "arn:aws:s3:::" + bucket_name + "/AWS"


def send_response(request, response, context, status=None, reason=None):
  if status is not None:
    response['Status'] = status
  if reason is not None:
    response['Reason'] = reason

  try:
    if 'ResponseURL' in request and request['ResponseURL']:
      url = urlparse.urlparse(request['ResponseURL'])
      body = json.dumps(response)
      https = httplib.HTTPSConnection(url.hostname)
      https.request('PUT', url.path+'?'+url.query, body)
      cfnresponse.send(request, context, cfnresponse.SUCCESS, response, response['PhysicalResourceId'])
  except Exception as e:
    cfnresponse.send(request, context, cfnresponse.FAILED, response, response['PhysicalResourceId'])

  return response


def handler(event, context):
  client = boto3.client('cloudtrail')
  s3client = boto3.client('s3')

  body = s3client.list_buckets()
  bucket_list = map(getBucketArn, filter(getLogBuckets, map(getBucketName, body["Buckets"])))

  response = client.put_event_selectors(
    TrailName=event['ResourceProperties']['Trail'],
    EventSelectors=[
      {
        'ReadWriteType': 'All',
        'IncludeManagementEvents': True,
        'DataResources': [
          {
            'Type': 'AWS::S3::Object',
            'Values': bucket_list
          },
        ]
      },
    ]
  )
  if 'PhysicalResourceId' in event:
    response['PhysicalResourceId'] = event['PhysicalResourceId']
  else:
    response['PhysicalResourceId'] = str(uuid.uuid4())
  if event['RequestType'] == 'Delete':
    cfnresponse.send(event, context, cfnresponse.SUCCESS, response, response['PhysicalResourceId'])
    return response
  return send_response(event, response, context)
