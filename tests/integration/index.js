'use strict';

const fs = require('fs')
const path = require('path')

const Mysql = require('mysql')
const request = require('request')
const should = require('should')

const TodoApp = require('../../lib/todo.js');

should.config.checkProtoEql = false;

describe('TodoApp', () => {
	const PORT = process.env.PORT || 3000;
	const BASE_URL = process.env.API_URL || 'http://localhost:${PORT}/api';

	describe('get', () => {
		it('List all', (done) => {
			request(`${BASE_URL}/todos`, (err, response, body) => {
				should.not.exist(err)
					response.statusCode.should.be.equal(200)
					const data = JSON.parse(body);
				data.should.be.an.Array();
				done();
			})
		});
	});

	describe('add', () => {
		it('Add one task', (done) => {
			request({
				uri: `${BASE_URL}/todos`,
				method: 'POST',
				json: {
					text: 'task 3',
				},
			}, (err, response, body) => {
				should.not.exist(err)
					response.statusCode.should.be.equal(200)
					body.should.be.an.Array();

				request(`${BASE_URL}/todos`, (err, response, body) => {
					should.not.exist(err)
						response.statusCode.should.be.equal(200)
						const data = JSON.parse(body);
					data.should.be.an.Array();
					done();
				})
			})
		});
	});

	describe('delete', () => {
		it('Delete one task', (done) => {
			request({
				uri: `${BASE_URL}/todos/1`,
				method: 'DELETE',
			}, (err, response, body) => {
				should.not.exist(err)
					response.statusCode.should.be.equal(200)
					const data = JSON.parse(body)
					data.should.be.an.Array();

				request(`${BASE_URL}/todos`, (err, response, body) => {
					should.not.exist(err)
						response.statusCode.should.be.equal(200)
						const data = JSON.parse(body);
					data.should.be.an.Array();
					done();
				})
			})
		});
	});

});
