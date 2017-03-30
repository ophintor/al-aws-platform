var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.lambda_handler = function (event, context) {
    try {         
        var ssm = new AWS.SSM();        
        if(event.RequestType == 'Delete') {                                    
            response.send(event, context, response.SUCCESS);
        }
        var params = {
            Name: event.ResourceProperties.Name,
            Type: 'SecureString',
            Value: event.ResourceProperties.Value,            
            KeyId: event.ResourceProperties.KeyId,
            Overwrite: true
        };
        ssm.putParameter(params, function(err, data) {
            if (err){
                console.log(err, err.stack); // an error occurred                
                response.send(event, context, response.FAILED);
            } 
            else{
                console.log(data);           // successful response
                response.send(event, context, response.SUCCESS);
            }     
        });
    }
    catch (err) {
        console.log('General Error.');
        console.log(err);          
        response.send(event, context, response.FAILED);                        
    }
};