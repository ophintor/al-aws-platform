import boto3
import base64
import uuid
import httplib
import urlparse
import json
import cfnresponse

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
  bucketList = []
  
  for item in body["Buckets"][:]:
    bucketList.append(item["Name"])
  bucketList = ["arn:aws:s3:::"+x+"/AWS" for x in bucketList if "logs" in x and "elb" not in x]

  response = client.put_event_selectors(
    TrailName = event['ResourceProperties']['Trail'],
    EventSelectors=[
      {
        'ReadWriteType': 'All',
        'IncludeManagementEvents': True,
        'DataResources': [
          {
            'Type': 'AWS::S3::Object',
            'Values': bucketList
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
  return send_response(event, response, context)
