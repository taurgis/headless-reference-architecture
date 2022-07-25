'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var userLoggedInMiddleware = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/middleware/userLoggedIn', {
    'dw/web/URLUtils': {
        url: function () {
            return 'some url';
        }
    },
    'dw/web/Resource': {
        msg: function (key) {
            return 'translation ' + key;
        }
    }
});

describe('userLoggedInMiddleware', function () {
    var next = sinon.spy();
    var req = {
        currentCustomer: {
            raw: 'something'
        },
        querystring: {}
    };
    var res = {
        json: sinon.spy(),
        setStatusCode: sinon.spy()
    };

    afterEach(function () {
        next.reset();
        res.json.reset();
        res.setStatusCode.reset();
        req.querystring = {};
    });

    it('Should respond with an error if a user is not logged in', function () {
        userLoggedInMiddleware.validateLoggedIn(req, res, next);
        assert.isTrue(res.json.calledOnce);
        assert.isTrue(res.setStatusCode.calledOnce);
        assert.isTrue(res.setStatusCode.calledWith(403));
        assert.isTrue(next.calledOnce);
    });

    it('Should just call next if user is logged in', function () {
        req.currentCustomer.profile = 'profile';
        userLoggedInMiddleware.validateLoggedIn(req, res, next);
        assert.isTrue(res.setStatusCode.notCalled);
        assert.isTrue(res.json.notCalled);
        assert.isTrue(next.calledOnce);
    });
});
