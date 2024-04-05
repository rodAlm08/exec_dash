//write a moch test to test the get request to the dashboard route

const request = require('supertest');
const app = require('../index');

describe('GET /dashboard', function() {
    it('respond with json', function(done) {
        request(app)
        .get('https://zerofourtwo.net/api/dataset')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
});