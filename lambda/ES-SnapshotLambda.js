var AWS = require('aws-sdk');
var response = require('cfn-response');

exports.handler = (event, context) => {
    console.log(event)
    console.log(context)
    const region = process.env.AWS_REGION;
    const endpoint =  new AWS.Endpoint(event.ResourceProperties.ESDomainEndpoint);
    // TODO: Handle update
    const isDelete = event.RequestType === 'Delete';

    const doc = {
      type: "s3",
      settings: {
        bucket: event.ResourceProperties.ESBackupBucket,
        region: region,
        role_arn: event.ResourceProperties.RoleArn,
      },
    };

    var creds = new AWS.EnvironmentCredentials('AWS');
    var req = new AWS.HttpRequest(endpoint);
    const now = new Date();

    req.method = isDelete ? 'DELETE' : 'POST';
    req.region = region;
    if (event.ResourceProperties.doSnap === true) {
        req.path = `/_snapshot/${event.ResourceProperties.ESSnapshotRepo}/snap-${now.getFullYear()}.${("0" + (now.getMonth() + 1)).slice(-2)}.${("0" + (now.getDate())).slice(-2)}`;
    } else {
        if (!isDelete) {
            req.body = JSON.stringify(doc);
        }
        req.path = `/_snapshot/${event.ResourceProperties.ESSnapshotRepo}`;
    }
    req.headers['presigned-expires'] = false;
    req.headers.Host = endpoint.host;

    // Sign the request (Sigv4)
    var signer = new AWS.Signers.V4(req, 'es');
    signer.addAuthorization(creds, new Date());

    // Post document to ES
    var send = new AWS.NodeHttpClient();
    send.handleRequest(req, null, (httpResp) => {
        // TODO: check httpResp.statusCode
        var body = '';
        httpResp.on('data', (chunk) => {
            body += chunk;
        });
        httpResp.on('end', (chunk) => {
            console.log('Response: ' + body);
            if (event.LogicalResourceId) {
                response.send(event, context, response.SUCCESS, {}, event.LogicalResourceId);
            } else {
                context.succeed();
            }
        });
    }, (err) => {
        console.log('Error: ' + err);
        if (event.LogicalResourceId) {
            response.send(event, context, response.FAILED, {}, event.LogicalResourceId);
        } else {
            context.fail();
        }
    });
};
