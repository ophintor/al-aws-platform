//Lambda Function to Encrypt data using KMS and store in S3

var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.lambda_handler = function (event, context) {
    try { 
        var results = {};
        var kms = new AWS.KMS();
        var s3 = new AWS.S3();
        if(event.RequestType == 'Delete') {                                    
            response.send(event, context, response.SUCCESS);
        }
        var params = {
            KeyId: event.ResourceProperties.KeyId,
            Plaintext: event.ResourceProperties.PlainText
        };
        kms.encrypt(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); 
                results.error='Error Encrypting with KMS.';
                response.send(event, context, response.FAILED, results);
            }
            else {   
                var encrypted_data = data.CiphertextBlob; 
                var base64string = new Buffer(encrypted_data).toString('base64'); 
                var s3params = {}; 
                s3params = {Bucket: event.ResourceProperties.BucketName, Key: 'variables', Body:encrypted_data };
                s3.putObject(s3params, function(err, data) {        
                    if (err) { 
                        console.log(err);
                        results.error='Error Uploading to S3.';
                        response.send(event, context, response.FAILED, results);
                    } else { 
                        console.log('Successfully uploaded data to S3');                                        
                        results.CipherText = base64string;
                        response.send(event, context, response.SUCCESS, results);
                    }
                });
            }
        });
    }
    catch (err) {
        console.log(err);  
        results.error='General Error.';
        response.send(event, context, response.FAILED, results);                        
    }
};