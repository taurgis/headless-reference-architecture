/* eslint "no-underscore-dangle": ["error", { "allow": ["__routes"] }] */

'use strict';

var Route = require('../../../../cartridges/modules/server/route');
var assert = require('chai').assert;
var middleware = require('../../../../cartridges/modules/server/middleware');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var render = {
    template: sinon.spy(),
    json: sinon.spy(),
    xml: sinon.spy(),
    applyRenderings: sinon.spy()
};
var server = null;

function request() {
    return {
        httpMethod: 'GET',
        host: 'localhost',
        path: 'test',
        querystring: '',
        locale: {
            id: ''
        },
        https: false,
        currentCustomer: {
            raw: {},
            profile: {},
            addressBook: {},
            wallet: {}
        }
    };
}

describe('server', function () {
    // this function initializes fields in the response object
    // which is created in the server.use method
    var initResponse = function (response) {
        response.cachePeriod = 0; // eslint-disable-line no-param-reassign
        response.cachePeriodUnit = null; // eslint-disable-line no-param-reassign
        response.personalized = false; // eslint-disable-line no-param-reassign
        response.base = { // eslint-disable-line no-param-reassign
            setExpires: function () {},
            setVaryBy: function () {},
            writer: {
                print: function (message) { assert.equal(message, 'test'); }
            }
        };
        response.json = function () {}; // eslint-disable-line no-param-reassign
        response.isJson = true; // eslint-disable-line no-param-reassign
        response.setViewData = function () { // eslint-disable-line no-param-reassign
            return '';
        };
        response.renderings = [{ type: 'render', subType: 'json' }]; // eslint-disable-line no-param-reassign
        return response;
    };

    beforeEach(function () {
        server = proxyquire('../../../../cartridges/modules/server/server', {
            './render': render,
            './request': request,
            './response': require('../../../mocks/modules/responseMock'),
            'dw/system/HookMgr': {
                hasHook: function (/* extension */) {
                    return true;
                },
                callHook: function (/* extensionPoint, functionName , args */) {
                }
            }
        });
    });

    it('should create a server with one route', function () {
        server.use('test', function () {});
        var exports = server.exports();
        assert.equal(typeof exports.test, 'function');
    });

    it('should apply default page cache period value', function () {
        var mockResp = null;
        server.use('test', function (req, res, next) {
            mockResp = initResponse(res);
            res.cachePeriod = 24; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
            next();
        });
        var exports = server.exports();
        var route = exports.__routes.test;
        var routeStartHit = false;
        var routeCompleteHit = false;

        route.once('route:Start', function () {
            routeStartHit = true;
        });
        route.on('route:Complete', function () {
            routeCompleteHit = true;
            assert.equal(typeof mockResp.cachePeriod, 'number');
            assert.equal(24, mockResp.cachePeriod);
            assert.equal('hours', mockResp.cachePeriodUnit);
            assert.equal(false, mockResp.personalized);
        });
        exports.test();
        assert.isTrue(routeStartHit);
        assert.isTrue(routeCompleteHit);
    });

    it('should apply default page cache period value', function () {
        var mockResp = null;
        server.use('test', function (req, res, next) {
            mockResp = initResponse(res);
            res.cachePeriod = 30; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
            res.personalized = true; // eslint-disable-line no-param-reassign
            res.renderings = [{ type: 'render', subType: 'xml' }]; // eslint-disable-line no-param-reassign
            next();
        });
        var exports = server.exports();
        var route = exports.__routes.test;
        var routeStartHit = false;
        var routeCompleteHit = false;

        route.once('route:Start', function () {
            routeStartHit = true;
        });
        route.on('route:Complete', function () {
            routeCompleteHit = true;
            assert.equal(typeof mockResp.cachePeriod, 'number');
            assert.equal(30, mockResp.cachePeriod);
            assert.equal('minutes', mockResp.cachePeriodUnit);
            assert.equal(true, mockResp.personalized);
        });
        exports.test();
        assert.isTrue(routeStartHit);
        assert.isTrue(routeCompleteHit);
    });

    it('should print', function () {
        server.use('test', function (req, res, next) {
            initResponse(res);
            res.cachePeriod = 30; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
            res.personalized = true; // eslint-disable-line no-param-reassign
            res.renderings = [{ type: 'print', message: 'test' }]; // eslint-disable-line no-param-reassign
            next();
        });
        var exports = server.exports();

        exports.test();
    });

    it('should create a server with a route of two steps', function () {
        server.get('test', function () {});
        var exports = server.exports();
        assert.equal(exports.__routes.test.chain.length, 2);
    });

    it('should create a server with two routes', function () {
        server.get('test', function () {}, function () {});
        server.post('test2', function () {});
        var exports = server.exports();
        assert.equal(typeof exports.test, 'function');
        assert.equal(typeof exports.test2, 'function');
        assert.equal(exports.__routes.test.chain.length, 3);
        assert.equal(exports.__routes.test2.chain.length, 2);
    });

    it('should extend existing chain with 2 more steps', function () {
        server.get('test', function () {});
        var exports = server.exports();
        assert.equal(exports.__routes.test.chain.length, 2);
        server.extend(exports);
        server.append('test', function () {}, function () {});
        assert.equal(exports.__routes.test.chain.length, 4);
    });

    it('The extended chain with append should be executed last.', function () {
        server.get('test', function () {});
        var exports = server.exports();
        server.extend(exports);
        server.append('test', function () {}, function () { return 'EXECUTED'; });
        assert.equal(server.getRoute('test').chain[3](), 'EXECUTED');
    });

    it('The extended chain with prepend should be executed first.', function () {
        server.get('test', function () {});
        var exports = server.exports();
        server.extend(exports);
        server.prepend('test', function () { return 'EXECUTED'; });
        assert.equal(server.getRoute('test').chain[0](), 'EXECUTED');
    });

    it('should replace existing route with a new one', function () {
        var spy = sinon.spy();
        var spy2 = sinon.spy();
        server.get('test', spy);
        var exports = server.exports();

        server.extend(exports);
        server.replace('test', spy2);
        var newExports = server.exports();
        newExports.test();
        assert.isTrue(spy.notCalled);
        assert.isTrue(spy2.called);
    });

    it('should throw when replacing non-existing route', function () {
        var testFn = function () {
            server.replace('blah', function () {});
        };
        assert.throws(testFn, 'Route with this name does not exist');
    });

    it('should throw when trying to create two routes with the same name', function () {
        server.get('test', function () {});
        assert.throws(function () { server.post('test', function () {}); });
    });

    it('should throw when route name is not provided', function () {
        assert.throws(function () { server.get(function () {}); });
    });

    it('should throw when route chain contains non-functions', function () {
        assert.throws(function () { server.get('test', {}); });
    });

    it('should throw when trying to append to non-existing route', function () {
        server.get('test', function () {});
        server.extend(server.exports());
        assert.throws(function () { server.append('foo', function () {}); });
    });

    it('should throw when extending server without routes', function () {
        assert.throws(function () { server.extend(server.exports()); });
    });

    it('should throw when extending server with an object', function () {
        assert.throws(function () { server.extend({}); });
    });

    it('should throw when middleware doesn\'t match route', function () {
        server.post('test', middleware.https, function (req, res, next) {
            req.render('test', { name: 'value' }); next();
        });
        assert.throws(function () { server.exports().test(); });
    });

    it('should verify that whole route passes', function () {
        server.get('test', middleware.http, function (req, res, next) {
            res.render('test', { name: 'value' });
            next();
        });
        var exports = server.exports();
        exports.test();
        var result = render.applyRenderings.called;
        assert.isTrue(result);
    });

    it('should verify that all events are emitted', function (done) {
        server.get('test', middleware.http, function (req, res, next) {
            res.json({ name: 'value' });
            next();
        });
        var exports = server.exports();
        var route = exports.__routes.test;
        var routeStartHit = false;
        var routeStepHits = 0;

        route.once('route:Start', function () {
            routeStartHit = true;
        });
        route.on('route:Step', function () {
            routeStepHits += 1;
        });
        route.on('route:Complete', function () {
            assert.isTrue(routeStartHit);
            assert.equal(routeStepHits, 2);
            done();
        });
        exports.test();
    });

    it('should maintain events for exported route', function () {
        var spy = sinon.spy();
        var spy2 = sinon.spy();
        server.get('test', spy);

        var exports = server.exports();
        var route = exports.__routes.test;

        route.on('route:Start', spy2);

        var exported = server.exports();
        assert.equal(exported.__routes.test.listeners('route:Start').length, 1);
    });

    it('should correctly remove event after export', function () {
        var spy = sinon.spy();
        var spy2 = sinon.spy();
        server.get('test', spy);

        var exports = server.exports();
        var route = exports.__routes.test;

        route.on('route:Start', spy2);

        var exported = server.exports();
        exported.__routes.test.off('route:Start');
        exported.test();

        assert.isTrue(spy.called);
        assert.isTrue(spy2.notCalled);
    });

    it('should verify that request is frozen', function (done) {
        server.get('test', function (req) {
            assert.isFrozen(req);
            done();
        });
        server.exports().test();
    });

    it('should retrieve a route by name', function () {
        server.get('test', function (req, res, next) {
            res.json({ name: 'value' });
            next();
        });
        var testRoute = server.getRoute('test');
        assert.isNotNull(testRoute);
    });

    it('should return a route on get call', function () {
        var route = server.get('test', function () {});
        assert.isTrue(route instanceof Route);
    });

    it('should redirect if requested in BeforeComplete', function (done) {
        server.get('test', function (req, res, next) {
            this.on('route:BeforeComplete', function (r, response) {
                response.base.redirect = function (text) { // eslint-disable-line no-param-reassign
                    assert.equal(text, 'test');
                    done();
                };
                response.redirect('test');
            });
            next();
        });
        var exports = server.exports();
        exports.test();
    });
});
