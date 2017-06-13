// source:
// https://github.com/awslabs/cloudwatch-logs-centralize-logs

'use strict';
const aws = require('aws-sdk');
var zlib = require('zlib');
const readline = require('readline');
const stream = require('stream');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const cloudWatchLogs = new aws.CloudWatchLogs({apiVersion: '2014-03-28'});

exports.handler = (event, context, cb) => {
  console.log('S3 object is:', event.Records[0].s3);
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const params = {
    Bucket: bucket,
    Key: key,
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      return cb(err);
    }

    //uncompressing the S3 data
    zlib.gunzip(data.Body, function(err, buffer){
      if (err) {
        console.log('Error uncompressing data', err);
        return cb(err);
      }

      var logData = buffer.toString('ascii');
      manageLogStreams(logData);
      
      cb(null, data.ContentType);
    });
  });

//Manage the log stream and get the sequenceToken
  function manageLogStreams (logData) {
    var describeLogStreamsParams = {
      logGroupName: process.env.LOG_GROUP,  //Name of the log group goes here;
      logStreamNamePrefix: process.env.LOG_STREAM //Name of the log stream goes here;
    }
//check if the log stream already exists and get the sequenceToken
    cloudWatchLogs.describeLogStreams (describeLogStreamsParams, (err, data) => {
      if (err) {
        return cb(err);
      }

      if (!data.logStreams[0]) {
        //create log stream
        createLogStream(logData);
      } else {
        putLogEvents(data.logStreams[0].uploadSeqToken, logData);
      }
    });
  }
    //Create Log Stream
  function createLogStream (logData) {
    var logStreamParams = {
      logGroupName: process.env.LOG_GROUP,
      logStreamName: process.env.LOG_STREAM
    };

    cloudWatchLogs.createLogStream(logStreamParams, (err, data) => {
      if (err) {
        return cb(err);
      }

      putLogEvents(null, logData);
    });
  }

  function putLogEvents(seqToken, logData) {
    //From http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
    const MAX_BATCH_SIZE = 1048576; // maximum size in bytes of Log Events (with overhead) per invocation of PutLogEvents
    const MAX_BATCH_COUNT = 10000; // maximum number of Log Events per invocation of PutLogEvents
    const LOG_EVENT_OVERHEAD = 26;  // bytes of overhead per Log Event

    // holds a list of batches
    var batches = [];
    // holds the list of events in current batch
    var batch = [];
    // size of events in the current batch
    var batch_size = 0;

    var bufferStream = new stream.PassThrough();
    bufferStream.end(logData);

    var rl = readline.createInterface({
      input: bufferStream
    });

    var line_count = 0;

    rl.on('line', (line) => {
      ++line_count;

      var ts = line.split(' ', 2)[1];
      var tval = Date.parse(ts);

      var event_size = line.length + LOG_EVENT_OVERHEAD;

      batch_size += event_size;

      if(batch_size >= MAX_BATCH_SIZE || batch.length >= MAX_BATCH_COUNT) {
        // start a new batch
        batches.push(batch);
        batch = [];
        batch_size = event_size;
      }

      batch.push({
        message: line,
        timestamp: tval
      });
    });

    rl.on('close', () => {
      // add the final batch
      batches.push(batch);
      sendBatches(seqToken, batches);
    });
  }

  function sendBatches(seqToken, batches) {
    var count = 0;
    var batch_count = 0;

    function sendNextBatch(nextSeqToken) {
      var batch = batches.shift();
      if(batch) {
        // send this batch
        ++batch_count;
        count += batch.length;
        sendBatch(nextSeqToken, batch, sendNextBatch);
      } else {
        // we are done
        let msg = `Successfully put ${count} events in ${batch_count} batches`;
        console.log(msg);
        cb(null, msg);
      }
    }

    sendNextBatch(seqToken);
  }

  function sendBatch(seqToken, batch, next) {
    var params = {
      logEvents: batch,
      logGroupName: process.env.LOG_GROUP,
      logStreamName: process.env.LOG_STREAM
    }
    if (seqToken) {
      params['seqToken'] = seqToken;
    }
// sort the events in ascending order by timestamp as required by PutLogEvents
    params.logEvents.sort((a, b) => a.timestamp - b.timestamp);

    cloudWatchLogs.putLogEvents(params, (err, data) => {
      if (err) {
        console.log('Error during put log events:', err, err.stack);
        return cb(err, null);
      }

      console.log(`Success in putting ${params.logEvents.length} events`);
      next(data.nextSeqToken);
    });
  }
};