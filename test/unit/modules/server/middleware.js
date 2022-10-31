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
        next.resetHistory();
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

    it('should call next for put method', function () {
        req.httpMethod = 'PUT';
        middleware.put(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for put method', function () {
        req.httpMethod = 'POST';
        middleware.put(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for patch method', function () {
        req.httpMethod = 'PATCH';
        middleware.patch(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for patch method', function () {
        req.httpMethod = 'GET';
        middleware.patch(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for post method', function () {
        req.httpMethod = 'POST';
        middleware.post(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for post method', function () {
        req.httpMethod = 'PATCH';
        middleware.post(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });

    it('should call next for delete method', function () {
        req.httpMethod = 'DELETE';
        middleware.delete(req, null, next);
        assert.isTrue(next.calledOnce);
    });

    it('should call next with error for delete method', function () {
        req.httpMethod = 'GET';
        middleware.delete(req, null, next);
        assert.instanceOf(next.firstCall.args[0], Error);
    });
});
