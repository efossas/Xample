/* eslint-env node, es6, mocha */
/* eslint dot-location: "off" */

var chai = require('chai');
var chaihttp = require('chai-http');
var should = chai.should();
chai.use(chaihttp);

var server = require('../server.js')('local','2020');

var assert = require('assert');
describe('Users',function() {

    before(function() {
        // runs before all tests in this block
    });

    after(function() {
        // runs after all tests in this block
    });

    beforeEach(function() {
        // runs before each test in this block
    });

    afterEach(function() {
        // runs after each test in this block
    });

    describe('#signup',function() {
        it('should return json with closed msg',function(done) {
            chai.request(server)
            .post('/signup')
            .send("username=test&email=&password=testpass")
            .end(function(err,res) {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('msg');
                res.body.msg.should.equal('closed');
                done();
            });
        });
    });
});
