'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var Response = proxyquire('../../../../cartridges/modules/server/response', {
    '*/cartridge/config/httpHeadersConf': [{ 'id': 'testId', 'value': 'testValue' }]
});
var Route = require('../../../../cartridges/modules/server/route');

var sinon = require('sinon');
var assert = require('chai').assert;
var mockReq = {
    path: '',
    querystring: {},
    locale: ''
};
var mockRes = {
    setViewData: function () {}
};

describe('route', function () {
    it('should create a new route with a given number of steps', function () {
        function tempFunc(req, res, next) { next(); }
        var route = new Route('test', [tempFunc, tempFunc], mockReq, mockRes);
        assert.equal(route.name, 'test');
        assert.equal(route.chain.length, 2);
    });
    it('should update response after last step', function (done) {
        function tempFunc(req, res, next) {
            res.test = 'Hello'; // eslint-disable-line no-param-reassign
            next();
        }
        var route = new Route('test', [tempFunc], mockReq, mockRes);
        route.on('route:Complete', function (req, res) {
            assert.equal(res.test, 'Hello');
            done();
        });
        route.getRoute()();
    });
    it('should execute two middleware steps', function (done) {
        var i = 0;

        function tempFunc(req, res, next) {
            i += 1;
            next();
        }
        var route = new Route('test', [tempFunc, tempFunc], mockReq, mockRes);
        route.on('route:Complete', function () {
            assert.equal(i, 2);
            done();
        });
        route.getRoute()();
    });
    it('should verify that response keeps redirect variable', function (done) {
        function tempFunc(req, res, next) {
            res.redirect('test');
            next();
        }
        var response = new Response({ redirect: function () {}, setHttpHeader: function () {} });
        var route = new Route('test', [tempFunc], mockReq, response);
        route.on('route:Redirect', function (req, res) {
            assert.equal(res.redirectUrl, 'test');
            done();
        });
        route.getRoute()();
    });
    it('should verify that redirect with implicit (not set) redirect status works', function (done) {
        var baseResponseRedirectMock = sinon.spy();
        function tempFunc(req, res, next) {
            res.redirect('test');
            next();
        }
        var response = new Response({ redirect: baseResponseRedirectMock, setHttpHeader: function () {} });
        var route = new Route('test', [tempFunc], mockReq, response);
        route.getRoute()();
        assert.isTrue(baseResponseRedirectMock.calledOnce);
        assert.isTrue(baseResponseRedirectMock.firstCall.calledWithExactly('test'));
        done();
    });
    it('should verify that redirect with explicit redirect status works', function (done) {
        var baseResponseRedirectMock = sinon.spy();
        function tempFunc(req, res, next) {
            res.setRedirectStatus(301);
            res.redirect('test');
            next();
        }
        var response = new Response({ redirect: baseResponseRedirectMock, setHttpHeader: function () {} });
        var route = new Route('test', [tempFunc], mockReq, response);
        route.getRoute()();
        assert.isTrue(baseResponseRedirectMock.calledOnce);
        assert.isTrue(baseResponseRedirectMock.firstCall.calledWithExactly('test', 301));
        done();
    });
    it('should throw an error', function () {
        function tempFunc(req, res, next) {
            next(new Error());
        }
        var res = {
            log: function () {},
            setViewData: mockRes.setViewData };
        var route = new Route('test', [tempFunc], mockReq, res);
        assert.throws(function () { route.getRoute()(); });
    });
    it('should correct append a step to the route', function () {
        function tempFunc(req, res, next) {
            next();
        }
        var route = new Route('test', [tempFunc, tempFunc], mockReq, mockRes);
        assert.equal(route.chain.length, 2);
        route.append(tempFunc);
        assert.equal(route.chain.length, 3);
    });
    it('should set error object on the response', function () {
        var RouteStaging = proxyquire('../../../../cartridges/modules/server/route', {
            'dw/system/System': {
                getInstanceType: function () {
                    return false;
                },
                'PRODUCTION_SYSTEM': true
            }
        });

        function tempFunc(req, res, next) {
            next();
        }
        var req = {
            path: mockReq.path,
            querystring: mockReq.querystring,
            locale: mockReq.locale
        };
        var route = new RouteStaging('test', [tempFunc], req, mockRes);
        route.getRoute()({
            ErrorText: 'hello',
            ControllerName: 'Foo',
            CurrentStartNodeName: 'Bar'
        });
        assert.isNotNull(req.error);
        assert.equal(req.error.errorText, 'hello');
        assert.equal(req.error.controllerName, 'Foo');
        assert.equal(req.error.startNodeName, 'Bar');
    });
    it('should set error object on the response to empty string if on production', function () {
        var RouteProduction = proxyquire('../../../../cartridges/modules/server/route', {
            'dw/system/System': {
                getInstanceType: function () {
                    return true;
                },
                'PRODUCTION_SYSTEM': true
            }
        });

        function tempFunc(req, res, next) {
            next();
        }
        var req = {
            path: mockReq.path,
            querystring: mockReq.querystring,
            locale: mockReq.locale
        };
        var route = new RouteProduction('test', [tempFunc], req, mockRes);
        route.getRoute()({
            ErrorText: 'hello',
            ControllerName: 'Foo',
            CurrentStartNodeName: 'Bar'
        });
        assert.isNotNull(req.error);
        assert.equal(req.error.errorText, '');
        assert.equal(req.error.controllerName, '');
        assert.equal(req.error.startNodeName, '');
    });
});
