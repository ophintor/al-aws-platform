'use strict'

var express = require('express');

module.exports = (connection) => {
    var router = express.Router()

    var todo = require('./todo')(connection);

    function getTodos(res, next) {
        todo.list((error, data) =>{
            if (error) {
                next(error);
                return
            }

            res.json(data);
        });
    };

    router.get('/todos', (req, res, next) => {
        getTodos(res, next);
    });

    router.post('/todos', (req, res, next) => {
        var post  = {
            text: req.body.text,
        };
        todo.add(post, (error, data) =>{
            if (error) {
                next(error);
                return
            }

            getTodos(res, next);
        });
    });

    router.delete('/todos/:todo_id', (req, res, next) => {
        var post  = {
            _id: parseInt(req.params.todo_id),
        };
        todo.delete(post, (error, data) =>{
            if (error) {
                next(error);
                return
            }

            getTodos(res, next);
        });
    });

    return router;
};
