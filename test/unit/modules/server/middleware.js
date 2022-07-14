'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var middleware = require('../../../../cartridges/modules/server/middleware');

describe('middleware', function () {
    var next = null;
    var req = {};

    beforeEach(function () {
        next = sinon.spy();
        req = {};
    });

    afterEach(function () {
        next.reset();
    });

    it('should call next for http method', function () {
        req.https = false;
        middleware.http(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for http method', function () {
        req.https = true;
        middleware.http(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });


    it('should call next for https method', function () {
        req.https = true;
        middleware.https(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for https method', function () {
        req.https = false;
        middleware.https(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for get method', function () {
        req.httpMethod = 'GET';
        middleware.get(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for get method', function () {
        req.httpMethod = 'PUT';
        middleware.get(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for post method', function () {
        req.httpMethod = 'POST';
        middleware.post(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for post method', function () {
        req.httpMethod = 'DELETE';
        middleware.get(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for include', function () {
        req.includeRequest = true;
        middleware.include(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for include', function () {
        req.includeRequest = false;
        middleware.include(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });
});
