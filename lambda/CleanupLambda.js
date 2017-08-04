var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.handler = function (event, context) {
  try {
    var s3 = new AWS.S3();
    var cloudwatchlogs = new AWS.CloudWatchLogs();
    console.log('event ',event);
    if(event.RequestType == 'Delete') {

      rp= event.ResourceProperties.ResourcePrefix;
      isDel= event.ResourceProperties.IsDelLogs;

      var bNames = [];
      bNames.push(rp+'-codepipeline-artifacts');
      bNames.push(rp+'-logs');
      bNames.push(rp+'-elb-logs');
      bNames.push(rp+'-snapshots');
      bNames.push(rp+'-es-snapshots');

      var lgNames = [];
      lgNames.push('/aws/codebuild/' + rp + '-build');
      lgNames.push('/aws/codebuild/' + rp + '-ecs-image');
      lgNames.push('/aws/codebuild/' + rp + '-test');
      lgNames.push('/aws/codebuild/' + rp + '-integration-test');
      lgNames.push('/aws/codebuild/' + rp + '-kibana');
      lgNames.push('/aws/lambda/' + rp + '-log-migration');
      lgNames.push('/aws/lambda/' + rp + '-log-streamer');
      lgNames.push('/aws/lambda/' + rp + '-set-param-store');
      lgNames.push('/aws/lambda/' + rp + '-SnapshotLambda');
      lgNames.push('/aws/lambda/' + rp + '-elblogs-to-cw-migration');
      lgNames.push('/aws/lambda/' + rp + '-add-target-with-transform');
      lgNames.push('/aws/lambda/' + rp + '-slack-notifications');
      lgNames.push('/aws/lambda/' + rp + '-es-snapshots');
      lgNames.push('/aws/cloudtrail/' + rp);
      lgNames.push(rp + '-applog');
      lgNames.push(rp + '-cloudinitoutput');
      lgNames.push(rp + '-elblog');
      lgNames.push(rp + '-syslog');
      lgNames.push(rp + '-vpcflowlog');

      var bucketpromises = bNames.map(function(bName) {
        return new Promise(function(resolve, reject) {
          deleteBucket(bName,function() {
            console.log('Delete bucket promise completed for ' + bName);
            resolve();
          });
        });
      });

      Promise.all(bucketpromises)
      .then(function() {
        console.log('all buckets deleted');
        // Once all buckets are deleted, delete the logs if required.
        // Else return success signal.
        if(isDel=='true'){
          var logspromises = lgNames.map(function(lgName) {
            return new Promise(function(resolve, reject) {
              deleteLogGroup(lgName,function() {
                console.log('Delete Logs promise completed for ' + lgName);
                resolve();
              });
            });
          });
          Promise.all(logspromises)
          .then(function() {
            console.log('all logs deleted');
            response.send(event, context, response.SUCCESS);
          })
          .catch(console.error);
        }
        else{
          response.send(event, context, response.SUCCESS);
        }
      })
      .catch(console.error);
    }
    else{
      // In case of other request types other than Delete. Send a success signal.
      response.send(event, context, response.SUCCESS);
    }

    function deleteBucket(bName, callback){
      var params = {
        Bucket: bName
      };

      emptyBucket(bName, function(bool){
        if(bool==true){
          s3.deleteBucket(params, function(err, data) {
            if (err) console.log('Failed to Delete Bucket: ',bName,'Error: ', err, err.stack);
            else console.log('Bucket Deleted: ', bName);
            callback();
          });
        }
        else{
          console.log('cannot delete bucket',bName);
          callback();
        }
      });
    }

    function emptyBucket(bName,callback){
      var params = {
        Bucket: bName
      };

      s3.listObjectsV2(params, function(err, data) {
        if (err){
          console.log('Error Listing Objects in Bucket ',bName,' Error: ',err);
          return callback(false);
        }
        if (data.Contents.length == 0) {
          console.log('Empty Bucket ',bName);
          callback(true);
        }
        params = {Bucket: bName};
        params.Delete = {Objects:[]};
        data.Contents.forEach(function(content) {
          params.Delete.Objects.push({Key: content.Key});
        });
        s3.deleteObjects(params, function(err, deldata) {
          if (err){
            console.log('Error Deleting Objects in Bucket ',bName,' Error: ',err);
            return callback(false);
          }
          if(deldata.Deleted.length == 1000)
            emptyBucket(bName,callback);
          else callback(true);
        });
      });
    }

    function deleteLogGroup(lgName, callback){
      var params = {
        logGroupName: lgName
      };
      cloudwatchlogs.deleteLogGroup(params, function(err, data) {
        if (err) console.log('Failed to Delete Log Group: ',lgName,'Error: ', err, err.stack);
        else console.log('Log Group Deleted: ', lgName);
        callback();
      });
    }
  }
  catch (err) {
    console.log('General Error.');
    console.log(err);
    response.send(event, context, response.SUCCESS);
  }
};
