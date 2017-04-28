/*
A Simple lambda function to generate load by randomly performing GET / PUT / POST / DELETE operations to the TODO WEB Applicaion endpoint and thereby also generate logs.

This Lambda Function is deployed and configured manually at this point.

Configuration Parameters:

    RAM: Max (1500MB)
    TIMEOUT: 5 Minutes

Test event Parameters

    {
        "ResourceProperties":{
            "count":5000,
            "hostname":"al-labs.co.uk"
        }
    }


To Run, configure the test event and press the test button from the aws lambda console.

*/

var http = require('http');
var querystring = require('querystring');
exports.handler = function (event, context) {
    if(event.RequestType == 'Delete') {                                    
        console.log("Delete Requested");
    }
    console.log(JSON.stringify(event));
    var responsecontent = "";
    var hostname = event.ResourceProperties.hostname
    var count = event.ResourceProperties.count;
    var httpverb=["POST","DELETE","PUT","GET",];
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";   

    var optionslist=[];
    for(var i=0; i<count; i++){        
        var operation = httpverb[Math.floor(Math.random() * (3 - 0) + 0)];
        var options = {
            hostname: hostname,
            path: '/api/todos',
            method: operation,
        };
        optionslist.push(options);
    };
    
    console.log("OPTIONS LIST: "+ JSON.stringify(optionslist));

    optionslist.forEach(function (opt)
    {        
        switch(opt.method) {
            case "GET":
                setTimeout(function(){
                  console.log("Attempting to GET TODOs. ");
                  var getreq = http.request(opt, function(response) {
                    var responsecontent = '';
                    response.on('data', function (chunk) {
                      responsecontent += chunk;
                    });
                    response.on('end', function () {
                      console.log("GET TODO Returned: "+ JSON.stringify(responsecontent));
                    });
                  });
                  getreq.on('error', (e) => {
                      console.log(`problem with GET request: ${e.message}`);
                  }); 
                  getreq.end(); 
                },10 );
              break;
            case "POST":
                setTimeout(function(){
                  var postObject = {
                      "text":""
                  };
                  for( var i=0; i < 5; i++ )
                      postObject.text += possible.charAt(Math.floor(Math.random() * possible.length));
                  var postData = querystring.stringify(postObject);                            
                  opt.headers= {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Content-Length': Buffer.byteLength(postData)
                      };
                  console.log("Attempting to Submit TODO : "+ postObject.text);                
                  var postreq = http.request(opt, (postres) => {
                      postres.setEncoding('utf8');
                      var responsecontent = '';
                      postres.on('data', (chunk) => {
                          responsecontent += chunk;
                      });
                      postres.on('end', () => {                        
                          console.log("POST TODO Returned: "+ JSON.stringify(responsecontent));
                      });
                  });                            
                  postreq.on('error', (e) => {
                      console.log(`problem with POST request: ${e.message}`);
                  });                            
                  // write data to request body
                  postreq.write(postData);
                  postreq.end();
                },10);                                                
              break;
            case "PUT":
                var putObject = {
                    "text":""
                };
                for( var i=0; i < 5; i++ )
                    putObject.text += possible.charAt(Math.floor(Math.random() * possible.length));
                var putData = querystring.stringify(putObject);                            
                opt.headers= {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(putData)
                    };
                console.log("Attempting to PUT TODO : "+ putObject.text);                
                var putreq = http.request(opt, (putres) => {
                    putres.setEncoding('utf8');
                    putres.on('data', (chunk) => {
                        responsecontent += chunk;
                    });
                    putres.on('end', () => {                        
                        console.log("PUT TODO Returned Status: "+ JSON.stringify(putres.statusCode));
                    });
                });                            
                putreq.on('error', (e) => {
                    console.log(`problem with PUT request: ${e.message}`);
                });                            
                // write data to request body
                putreq.write(putData);
                putreq.end();                                                
                break;                
            case "DELETE":
                setTimeout(function(){
                  //GET OBJECTs BEFORE PERFORMING DELETE
                  console.log("Attempting to GET TODOs Before DELETE. ");
                  opt.method="GET";
                  var getreq = http.request(opt, function(response) {
                    var responsecontent = '';
                    response.on('data', function (chunk) {
                      responsecontent += chunk;
                    });
                    response.on('end', function () {                      
                      console.log("GET TODO Returned: "+ JSON.stringify(responsecontent));
                      var obj = JSON.parse(responsecontent);                                                   
                      if(obj.length > 0){
                          opt.method="DELETE";
                          var randomid = Math.floor(Math.random() * (obj.length));
                          opt.path+="/"+obj[randomid]._id.toString();
                          console.log("Attempting to Delete TODO : "+ obj[randomid]._id.toString());                                                
                          var delreq = http.request(opt, function(response) {
                              var delresponsecontent = '';
                              response.on('data', function (chunk) {
                                  delresponsecontent += chunk;
                              });
                              response.on('end', function () {
                                  console.log("DELETE TODO Returned: "+ JSON.stringify(delresponsecontent));                                    
                              });
                          });
                          delreq.on('error', (e) => {
                              console.log(`problem with DELETE request: ${e.message}`);
                          }); 
                          delreq.end(); 
                      }
                    });
                  });
                  getreq.on('error', (e) => {
                      console.log(`problem with GET before DELETE request: ${e.message}`);
                  }); 
                  getreq.end();
                },10);     
              break;
        }; 
    });
};