'use strict'

var path = require('path');
var fs = require('fs');

var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;

var accessLogStream = (process.env.USE_LOG_FILE && process.env.USE_LOG_FILE.toLowerCase() === 'true') ? fs.createWriteStream(path.join('/tmp/', 'server.log'), {flags: 'a'}) : process.stdout;

app.use(morgan(':remote-addr [:date[clf]] :method :url :status :res[content-length] :response-time ":user-agent"', {stream: accessLogStream}));
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.DB_CONNECTIONSTRING || 'localhost',
  user     : process.env.DB_USERNAME || 'admin',
  password : process.env.DB_PASSWORD || 'password',
  database : process.env.DB_NAME || 'todo'
});

var AppRouter = require('./lib/api')

app.use('/api/', AppRouter(connection))

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT);
console.log("App listening on port " + PORT);
