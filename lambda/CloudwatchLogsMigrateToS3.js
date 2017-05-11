//Simple Lambda Function to Migrate Logs to S3
//This Lambda is intended to be called automatically on a schedule every hour and will export all logs for the previous hour.


var AWS = require('aws-sdk');
exports.handler = function (event, context) {
    try {         
        var cloudwatchlogs = new AWS.CloudWatchLogs();       
        var now = new Date();
        var params = {
          destination: {"Fn::Sub": "${AWS::StackName}-logs"}, /* required */
          from: now.getTime() - 3600000, /* required */  /* Current Time minus One Hour in Milliseconds */
          logGroupName: {"Fn::Sub": "${AWS::StackName}-applog"}, /* required */
          to: now.getTime(), /* required */
          taskName: "LogTask_"+now.getTime().toString()
        };        
        console.log('Log Migrate Action Called with Params : ' +JSON.stringify(params));        
        cloudwatchlogs.createExportTask(params, function(err, data) {
          if (err) {
              console.log('Error : '+ err, err.stack); // an error occurred
          }
          else{
                console.log('Success : ' + data);  // successful response
          }   
        });
    }
    catch (err) {
        console.log('General Error.');
        console.log(err);                                  
    }
};