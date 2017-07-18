var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.lambda_handler = function (event, context) {
  try {
    var ssm = new AWS.SSM();
    if(event.RequestType == 'Delete') {
      var params = {
        Name: event.ResourceProperties.Name
      }
      ssm.deleteParameter(params, function(err, data) {
        console.log('Delete Called');
        if (err){
          console.log("Error: ",err, err.stack); // an error occurred
        }
        else{
          console.log("Successfully Deleted Parameter: ",data);           // successful response
        }
      });
      response.send(event, context, response.SUCCESS);
    }
    else {
      var params = {
        Name: event.ResourceProperties.Name,
        Type: event.ResourceProperties.Type,
        Description: event.ResourceProperties.Description,
        Value: event.ResourceProperties.Value,
        KeyId: event.ResourceProperties.KeyId,
        Overwrite: true
      };
      ssm.putParameter(params, function(err, data) {
          if (err){
            console.log("Error: ",err, err.stack); // an error occurred
            response.send(event, context, response.FAILED);
          }
          else{
            console.log("Successfully Put Parameter: ",data);           // successful response
            response.send(event, context, response.SUCCESS);
          }
      });
    }
  }
  catch (err) {
    console.log('General Error.');
    console.log(err);
    response.send(event, context, response.FAILED);
  }
};
