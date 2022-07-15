'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var QueryString;
var logSpy;

describe('querystring', function () {
    beforeEach(function () {
        logSpy = sinon.spy();
        QueryString = proxyquire('../../../../cartridges/modules/server/queryString', {
            'dw/system/Logger': {
                warn: logSpy
            }
        });
    });

    describe('handling special characters', function () {
        it('should handle the \'+\' with a \'%20\' which leads to a \' \'', function () {
            var params = '?trackOrderNumber=01&trackOrderPostal=EC1A+1BB';
            var result = new QueryString(params);

            assert.equal(result.trackOrderPostal, 'EC1A 1BB');
        });
    });

    describe('handling url encoding of querystring', function () {
        it('should handle encoding properly', function () {
            var params = '?maat=37%2B&pid=P12345';
            var result = new QueryString(params);
            assert.equal(result.toString(), 'maat=37%2B&pid=P12345');
        });
    });

    describe('handling duplicate parameters in querystring', function () {
        it('should return an array', function () {
            var params = '?one=uno&cheese=1&cheese=2&cheese=3&brand=sony&brand=samsung&cheese=4';
            var result = new QueryString(params);
            assert.deepEqual(result.one, 'uno');
            assert.deepEqual(result.cheese, ['4', '3', '2', '1']);
            assert.deepEqual(result.brand, ['samsung', 'sony']);
        });
    });
});
