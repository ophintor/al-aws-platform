const request = require('supertest');
const sinon = require('sinon');
const should = require('should')

const api = require('../../lib/api');
const express = require('express');
const bodyParser = require('body-parser')

const Mysql = require('mysql')
const mysqlConnection = Mysql.createConnection({host: 'localhost'});
const app = express()
app.use(bodyParser.json())
app.use(api(mysqlConnection))

// app.use(api)
describe('TodoApp HTTP', () => {
    mysqlConnection.query = sinon.stub()

    var rows = [
        {
            text: "task 1",
        },
        {
            text: "task 2",
        },
    ];

    var task = {
        text: 'new task',
    };

    describe('List tasks', (done) => {
        it('GET /todos', (done) => {

            mysqlConnection.query.withArgs('SELECT * FROM todo')
                .callsArgWith(1, null, rows)

            request(app)
                .get('/todos')
                .expect(200)
                .end((err, res) => {
                    data = res.body;
                    data.should.be.an.Array()
                    data.should.have.length(2)
                    data[0].should.be.an.Object()
                    data[0].text.should.be.equal('task 1')
                    data[1].should.be.an.Object()
                    data[1].text.should.be.equal('task 2')

                    done();
                })
        });
    });

    describe('Add task', (done) => {
        it('POST /todos', (done) => {

            mysqlConnection.query.withArgs('INSERT INTO todo SET ?')
                .callsArgWith(2, null, null)

            mysqlConnection.query.withArgs('SELECT * FROM todo')
                .callsArgWith(1, null, rows)

            request(app)
                .post('/todos')
                .send(task)
                .expect(200)
                .end((err, res) => {
                    data = res.body;
                    data.should.be.an.Array()
                    data.should.have.length(2)
                    data[0].should.be.an.Object()
                    data[0].text.should.be.equal('task 1')
                    data[1].should.be.an.Object()
                    data[1].text.should.be.equal('task 2')

                    done();
                })
        });
    });

    describe('DETELE /todos', (done) => {
        it('Delete one task', (done) => {
            var task = {
                _id: 1,
            };

            mysqlConnection.query.withArgs('DELETE FROM todo WHERE ?', {_id: 1})
                .callsArgWith(2, null, null)

            mysqlConnection.query.withArgs('SELECT * FROM todo')
                .callsArgWith(1, null, rows)

            request(app)
                .delete('/todos/1')
                .expect(200)
                .end((err, res) => {
                    data = res.body;
                    data.should.be.an.Array()
                    data.should.have.length(2)
                    data[0].should.be.an.Object()
                    data[0].text.should.be.equal('task 1')
                    data[1].should.be.an.Object()
                    data[1].text.should.be.equal('task 2')

                    done();
                })
        });
    });
});
