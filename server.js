'use strict'
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.MYSQL_CONNECTION_STRING || 'localhost',
  user     : process.env.MYSQL_USER || 'root',
  password : process.env.MYSQL_PASS || 'password',
  database : process.env.MYSQL_DB || 'todo'
});

function getTodos(res, next) {
    connection.query('SELECT * FROM todo', (error, results, fields) => {
        if (error) {
            next(error);
            return
        }

        res.json(results);
    });
};

app.get('/api/todos', (req, res, next) => {
    getTodos(res, next);
});

// create todo and send back all todos after creation
app.post('/api/todos', (req, res, next) => {
    var post  = {
        text: req.body.text,
    };
    var query = connection.query('INSERT INTO todo SET ?', post, (error, results, fields) => {
        if (error) {
            next(error);
            return
        }

        getTodos(res, next);
    });
});

app.delete('/api/todos/:todo_id', (req, res, next) => {
    var post  = {
        _id: req.params.todo_id,
    };
    var query = connection.query('DELETE FROM todo WHERE ?', post, (error, results, fields) => {
        if (error) {
            next(error);
            return
        }

        getTodos(res, next);
    });
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT);
console.log("App listening on port " + PORT);
