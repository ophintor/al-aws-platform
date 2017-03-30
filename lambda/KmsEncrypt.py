import base64
import uuid
import httplib
import urlparse
import json
import boto3
def send_response(request, response, status=None, reason=None):
   if status is not None:
       response['Status'] = status
   if reason is not None:
       response['Reason'] = reason
   if 'ResponseURL' in request and request['ResponseURL']:
       url = urlparse.urlparse(request['ResponseURL'])
       body = json.dumps(response)
       https = httplib.HTTPSConnection(url.hostname)
       https.request('PUT', url.path+'?'+url.query, body)
   return response
def lambda_handler(event, context):
   response = {
       'StackId': event['StackId'],
       'RequestId': event['RequestId'],
       'LogicalResourceId': event['LogicalResourceId'],
       'Status': 'SUCCESS'
   }    
   if 'PhysicalResourceId' in event:
       response['PhysicalResourceId'] = event['PhysicalResourceId']
   else:
       response['PhysicalResourceId'] = str(uuid.uuid4())    
   if event['RequestType'] == 'Delete':
       return send_response(event, response)    
   try:
       for key in ['KeyId', 'PlainText']:
           if key not in event['ResourceProperties'] or not event['ResourceProperties'][key]:
               return send_response(
                   event, response, status='FAILED',
                   reason='The properties KeyId and PlainText must not be empty'
               )
       client = boto3.client('kms')
       encrypted = client.encrypt(
           KeyId=event['ResourceProperties']['KeyId'],
           Plaintext=event['ResourceProperties']['PlainText']
       )
       response['Data'] = {
           'CipherText': base64.b64encode(encrypted['CiphertextBlob'])
       }
       response['Reason'] = 'The value was successfully encrypted'
   except Exception as E:
       response['Status'] = 'FAILED'
       response['Reason'] = 'Encryption Failed - See CloudWatch logs for the Lamba function backing the custom resource for details'
   return send_response(event, response)