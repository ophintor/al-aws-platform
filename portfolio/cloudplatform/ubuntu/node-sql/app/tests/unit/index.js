'use strict'

const Mysql = require('mysql')
const sinon = require('sinon');
const should = require('should')

const TodoApp = require('../../lib/todo.js');

describe('TodoApp', () => {
    const mysqlConnection = Mysql.createConnection({host: 'localhost'});

    var todo = TodoApp(mysqlConnection);
    mysqlConnection.query = sinon.stub()

    describe('get', () => {
        it('List all', (done) => {
            var rows = [
                {
                    text: "task 1",
                },
                {
                    text: "task 2",
                },
            ];

            mysqlConnection.query.withArgs('SELECT * FROM todo')
                .callsArgWith(1, null, rows)

            todo.list((err, data) => {
                should.not.exist(err)
                data.should.be.deepEqual([
                    {
                        text: 'task 1',
                    },
                    {
                        text: 'task 2',
                    },
                ]);

                done();
            })
        });
    });

    describe('add', () => {
        it('Add one task', (done) => {
            var task = {
                text: 'new task',
            };

            mysqlConnection.query.withArgs('INSERT INTO todo SET ?')
                .callsArgWith(2, null, null)

            todo.add(task, (err, data) => {
                should.not.exist(err)
                should.not.exist(data)

                done()
            })
        });
    });

    describe('delete', () => {
        it('Delete one task', (done) => {
            var task = {
                _id: 1,
            };

            mysqlConnection.query.withArgs('DELETE FROM todo WHERE ?', {_id: 1})
                .callsArgWith(2, null, null)

            todo.delete(task, (err, data) => {
                should.not.exist(err)
                should.not.exist(data)

                done()
            })
        });
    });

});
