var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.lambda_handler = function (event, context) {
  try {
    var cloudwatchevents = new AWS.CloudWatchEvents();
    if(event.RequestType == 'Delete') {
      console.log('Delete Called');
      var rmParams = {
        Rule: event.ResourceProperties.RuleName,
        Ids: [
          event.ResourceProperties.TargetId
        ]
      };
      cloudwatchevents.removeTargets(rmParams, function(err, data) {
        if (err){
          console.log(err, err.stack);
          response.send(event, context, response.FAILED);
        }
        else{
          console.log(data);
          response.send(event, context, response.SUCCESS);
        }
      });
    } else {
      var params = {
        Rule: event.ResourceProperties.RuleName,
        Targets: [
          {
            Arn: event.ResourceProperties.TargetArn,
            Id: event.ResourceProperties.TargetId,
            InputTransformer: {
              InputPathsMap: {"build-id": "$.detail.build-id","project-name": "$.detail.project-name","build-status": "$.detail.build-status"},
              InputTemplate: '"Build <build-id> for build project <project-name> has reached the build status of <build-status>."',
            }
          }
        ]
      };
      cloudwatchevents.putTargets(params, function(err, data) {
        if (err){
          console.log(err, err.stack);
          response.send(event, context, response.FAILED);
        }
        else{
          console.log(data);
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
