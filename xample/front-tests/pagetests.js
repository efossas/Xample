/* eslint-env node, es6, mocha */
/* eslint dot-location: "off" */
/*
    global chai:true
*/

var should = chai.should();

describe('Class',function() {

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

    describe('#method',function() {
        it('should test',function(done) {
            done();
        });
    });
});
