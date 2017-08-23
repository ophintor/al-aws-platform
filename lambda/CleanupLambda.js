var AWS = require('aws-sdk');
var response = require('cfn-response');
exports.handler = function (event, context) {
try {
var s3 = new AWS.S3();
var cloudwatchlogs = new AWS.CloudWatchLogs();
var ecr = new AWS.ECR();
var cloudformation = new AWS.CloudFormation();
console.log('event ',JSON.stringify(event));
if(event.RequestType == 'Delete') {

var bNames = event.ResourceProperties.BucketNames ? event.ResourceProperties.BucketNames : [];
var lgNames = event.ResourceProperties.LogGroupNames ? event.ResourceProperties.LogGroupNames : [];
var ecrNames = event.ResourceProperties.ECRNames ? event.ResourceProperties.ECRNames : [];
var stackNames = event.ResourceProperties.StackNames ? event.ResourceProperties.StackNames : [];

var promiseCollection = [];
// Delete the Buckets if required.
if(bNames.length > 0){
bNames.forEach(function(bName) {
promiseCollection.push(new Promise(function(resolve, reject) {
deleteBucket(bName,function() {
console.log('Del Bucket completed ' + bName);
resolve();
});
}));
});
}
// Delete the log Groups if required.
if(lgNames.length > 0){
lgNames.forEach(function(lgName) {
promiseCollection.push(new Promise(function(resolve, reject) {
deleteLogGroup(lgName,function() {
console.log('Del Logs completed ' + lgName);
resolve();
});
}));
});
}
//Delete Elastic Container Repository for ECS if required
if(ecrNames.length > 0){
ecrNames.forEach(function(ecrName) {
promiseCollection.push(new Promise(function(resolve, reject) {
deleteECR(ecrName,function() {
console.log('Del ECR completed ' + ecrName);
resolve();
});
}));
});
}
//Delete Sub Stacks if required
if(stackNames.length > 0){
stackNames.forEach(function(stackName) {
promiseCollection.push(new Promise(function(resolve, reject) {
deleteStack(stackName,function() {
console.log('Del Stack completed ' + stackName);
resolve();
});
}));
});
}

console.log(JSON.stringify(promiseCollection));

//Call all the promises
Promise.all(promiseCollection)
.then(function() {
console.log("All Operations Completed.");
response.send(event, context, response.SUCCESS);
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
if (err) console.log('Delete Bucket Failed: ',bName,'Error: ', err, err.stack);
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
if (err) console.log('Delete Logs Failed: ',lgName,'Error: ', err, err.stack);
else console.log('Logs Deleted: ', lgName);
callback();
});
}

function deleteECR(ecrName, callback){
var params = {
force: true,
repositoryName: ecrName
};
ecr.deleteRepository(params, function(err, data) {
if (err) console.log('Delete ECR Failed: ',ecrName,'Error: ', err, err.stack);
else console.log('ECR Deleted: ', ecrName);
callback();
});
}

function deleteStack(stackName, callback){
var params = {
StackName: stackName,
RoleARN: process.env.CF_CLEANUP_ROLE_ARN
};
cloudformation.deleteStack(params, function(err, data) {
if (err) console.log('Delete Stack Failed: ',stackName,'Error: ', err, err.stack);
else console.log('Stack Deleted: ', stackName);
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
