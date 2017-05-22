var https = require('https');
exports.handler = function (event, context) {
    var now = new Date();
    var postData = {};
    var options = {
        hostname: '${ElasticsearchAWSLogs.DomainEndpoint}',
        path: '/_snapshot/backups/'+now.getUTCFullYear().toString()+"-"+ (now.getUTCMonth() + 1).toString()+ "-"+now.getUTCDate().toString(),
        method: 'POST'
    };
    options.headers= {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(postData))
        };
    
    console.log("Attempting to Submit Request : ");                
                  
    var postreq = https.request(options, (postres) => {
      postres.setEncoding('utf8');
      var responsecontent = '';
      postres.on('data', (chunk) => {
          responsecontent += chunk;
      });
      postres.on('end', () => {                        
          console.log("Returned: "+ JSON.stringify(responsecontent));
      });
    });  
    
    postreq.on('error', (e) => {
      console.log('problem with POST request:'+e.message);
    });                            
    // write data to request body
    postreq.write(JSON.stringify(postData));
    postreq.end();
};