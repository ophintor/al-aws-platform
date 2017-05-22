var https = require('https');
var crypto = require('crypto');
var response = require('cfn-response');
var endpoint = '${ElasticsearchAWSLogs.DomainEndpoint}';
exports.handler = function (event, context) {
    var postObject = {
      type: 's3',
      settings: {
        bucket: '${AWS::StackName}-snapshots',
        region: '${AWS::Region}',
        role_arn: '${ElasticSearchSnapshotRole.Arn}'
      }
    };
   var postData = JSON.stringify(postObject);   
   // post to the Amazon Elasticsearch Service

   if(isValidJson(postData)) {
    post(postData, function(error, success, statusCode) {
      console.log('Response: ' + JSON.stringify({
          'statusCode': statusCode
      }));

      if (error) {
          console.log('postData Error: ' + JSON.stringify(error, null, 2));
          response.send(event, context, response.FAILED);
      } else {
          console.log('Success: ' + JSON.stringify(success));
          response.send(event, context, response.SUCCESS);
      }
    });
   }else{
     Console.log('Error: Invalid JSON Body');
     response.send(event, context, response.FAILED);
   }
};

function post(body, callback) {
    console.log('endpoint:', endpoint);
    var requestParams = buildRequest(endpoint, body);
    console.log('requestParams:', requestParams);
    var request = https.request(requestParams, function(response) {
        var responseBody = '';
        response.on('data', function(chunk) {
            responseBody += chunk;
        });
        response.on('end', function() {
            var info = JSON.parse(responseBody);            
            var success;
            console.log('post info:', info);
            var error = response.statusCode !== 200 || info.errors === true ? {
                'statusCode': response.statusCode,
                'responseBody': responseBody
            } : null;

            console.log('post error:', error);

            callback(error, success, response.statusCode);
        });
    }).on('error', function(e) {
        callback(e);
    });
    request.end(requestParams.body);
};

function buildRequest(endpoint, body) {
    var endpointParts = endpoint.match(/^([^\.]+)\.?([^\.]*)\.?([^\.]*)\.amazonaws\.com$/);
    var region = endpointParts[2];
    var service = endpointParts[3];
    var datetime = (new Date()).toISOString().replace(/[:\-]|\.\d{3}/g, '');
    var date = datetime.substr(0, 8);
    var kDate = hmac('AWS4' + process.env.AWS_SECRET_ACCESS_KEY, date);
    var kRegion = hmac(kDate, region);
    var kService = hmac(kRegion, service);
    var kSigning = hmac(kService, 'aws4_request');

    var request = {
        host: endpoint,
        method: 'POST',
        path: '/_snapshot/backups',
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Host': endpoint,
            'Content-Length': Buffer.byteLength(body),
            'X-Amz-Security-Token': process.env.AWS_SESSION_TOKEN,
            'X-Amz-Date': datetime
        }
    };

    var canonicalHeaders = Object.keys(request.headers)
        .sort(function(a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; })
        .map(function(k) { return k.toLowerCase() + ':' + request.headers[k]; })
        .join('\n');

    var signedHeaders = Object.keys(request.headers)
        .map(function(k) { return k.toLowerCase(); })
        .sort()
        .join(';');

    var canonicalString = [
        request.method,
        request.path, '',
        canonicalHeaders, '',
        signedHeaders,
        hash(request.body, 'hex'),
    ].join('\n');

    var credentialString = [ date, region, service, 'aws4_request' ].join('/');

    var stringToSign = [
        'AWS4-HMAC-SHA256',
        datetime,
        credentialString,
        hash(canonicalString, 'hex')
    ] .join('\n');

    request.headers.Authorization = [
        'AWS4-HMAC-SHA256 Credential=' + process.env.AWS_ACCESS_KEY_ID + '/' + credentialString,
        'SignedHeaders=' + signedHeaders,
        'Signature=' + hmac(kSigning, stringToSign, 'hex')
    ].join(', ');

    return request;
};

function hmac(key, str, encoding) {
    return crypto.createHmac('sha256', key).update(str, 'utf8').digest(encoding);
};

function hash(str, encoding) {
    return crypto.createHash('sha256').update(str, 'utf8').digest(encoding);
};

function isValidJson(message) {
    try {
        JSON.parse(message);
    } catch (e) { return false; }
    return true;
};