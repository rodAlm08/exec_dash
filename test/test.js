//write a moch test to test the get request to the dashboard route

const request = require('supertest');
const app = require('../index');
const  {removeColumn}  = require('../index');

const assert = require('assert')

beforeEach(() => {
    var access_token = process.env.API_SECRET_KEY
    
});

// test the #removeColumn function from index.js
describe('removeColumnXXX', () => {
    it('should remove the column from the data', () => {
        var data = [
            {
                a: 1, b: 2, c: 3
            }, 
            {
                a: 4, b: 5, c: 6
            }, 
            {
                a: 7, b: 8, c: 9
            }
        ];
        console.log('removeColumn ------------------------', removeColumn);
        removeColumn(data, 'a');
        // assert that column 'a' doesn't exist anymore
        assert.equal(Object.keys(data[0]).length, 2);
        assert.equal(Object.keys(data[1]).length, 2);
        assert.equal(Object.keys(data[2]).length, 2);       

    }
    )
}
);


