'use strict';
const AWS = require('aws-sdk');
const url = require('url');
const https = require('https');

// The base-64 encoded, encrypted key (CiphertextBlob) stored in the kmsEncryptedHookUrl environment variable
const kmsEncryptedHookUrl = process.env.kmsEncryptedHookUrl;
// The Slack channel to send a message to stored in the slackChannel environment variable
const slackChannel = process.env.slackChannel;
let hookUrl;


function postMessage(message, callback) {
  const body = JSON.stringify(message);
  const options = url.parse(hookUrl);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };

  const postReq = https.request(options, (res) => {
    const chunks = [];
    res.setEncoding('utf8');
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      if (callback) {
        callback({
          body: chunks.join(''),
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
        });
      }
    });
    return res;
  });

  postReq.write(body);
  postReq.end();
}

function processEvent(event, callback) {
  const message = JSON.parse(event.Records[0].Sns.Message);

  const alarmName = message.AlarmName;
  //var oldState = message.OldStateValue;
  const newState = message.NewStateValue;
  const reason = message.NewStateReason;

  const slackMessage = {
    "text": `Pipeline "${message.approval.pipelineName}" approval required, action "${message.approval.actionName}"`,
    "attachments": [
    {
      "author_name": "Cloud Platform AWS approval",
      "author_icon": "https://i0.wp.com/reillytop10.com/wp-content/uploads/2016/12/Screen-Shot-2016-12-12-at-3.42.49-PM.png",
      "image_url": [
        "https://media.giphy.com/media/3o7abrH8o4HMgEAV9e/giphy.gif",
        "https://media.giphy.com/media/UsmcxQeK7BRBK/giphy.gif",
        "https://media.giphy.com/media/QynHhYJiwfoJO/giphy.gif",
        "https://media.giphy.com/media/Dih5LeyxL8fny/giphy.gif",
      ][Math.floor((Math.random() * 4))]
    },
    {
      "text": `${message.approval.customData}`,
      "fields": [
      {
        "title": "Approval link",
        "value": `${message.approval.approvalReviewLink}`,
        "short": true,
      },
      ]
    },
    {
      "fields": [
      {
        "title": "Pipeline",
        "value": `${message.consoleLink}`,
        "short": true,
      },
      ]
    }
    ]
  }

  postMessage(slackMessage, (response) => {
    if (response.statusCode < 400) {
      console.info('Message posted successfully');
      callback(null);
    } else if (response.statusCode < 500) {
      console.error(`Error posting message to Slack API: ${response.statusCode} - ${response.statusMessage}`);
      callback(null);  // Don't retry because the error is due to a problem with the request
    } else {
      // Let Lambda retry
      callback(`Server error when processing message: ${response.statusCode} - ${response.statusMessage}`);
    }
  });
}

exports.handler = (event, context, callback) => {
  return new Promise((resolve, reject) => {
    if (hookUrl) {
      return resolve(hookUrl)
    }

    const ssm = new AWS.SSM()
    return ssm.getParameters({
      Names: ['pm.slack.webhooks'],
      WithDecryption: true
    }).promise()
    .then((data) => {
      hookUrl = data.Parameters[0].Value;
    })
    .then(resolve)
  })
  .then(() => {
    processEvent(event, callback);
  })
  .catch(callback)
};
