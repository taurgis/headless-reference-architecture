'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockCookies = ['__cq_dnt=1; Path=/; Secure; SameSite=None; version=2', 'dw_dnt=1; Path=/; Secure; httponly; max-age=5; SameSite=None'];
var ipResult = null;
var mockResponseHeaders = {
    get: () => {
        if (mockCookies === null) {
            return null;
        }

        return {
            toArray: () => mockCookies
        };
    }
}

var mockGetSession = function (token, ip) {
    ipResult = ip;

    return {
        responseHeaders: mockResponseHeaders
    };
};

var sessionHelper = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/sessionHelper', {
    'dw/web/Cookie': function (name, cookieValue) {
        return {
            name: name,
            value: cookieValue,
            setPath: function (value) { this.path = value; },
            setMaxAge: function (value) { this.maxAge = value; },
            setSecure: function (value) { this.secure = value; },
            setHttpOnly: function (value) { this.httponly = value; },
            setVersion: function (value) { this.version = value; }
        };
    },
    '*/cartridge/scripts/services/SessionBridgeService': {
        getSession: mockGetSession
    }
});

describe('middleware', function () {
    this.beforeEach(() => {
        ipResult = null;
    });

    it('Should process all cookies', function () {
        var response = {
            cookies: [],
            addHttpCookie: function (cookie) {
                this.cookies.push(cookie);
            }
        };

        var result = sessionHelper.setUserSession('12345', response);

        assert.equal(response.cookies.length, 2);
        assert.isTrue(result.ok);

        const firstCookie = response.cookies[0];
        const secondCookie = response.cookies[1];

        assert.equal(firstCookie.name, '__cq_dnt');
        assert.equal(secondCookie.name, 'dw_dnt');
        assert.equal(firstCookie.value, '1');
        assert.equal(secondCookie.value, '1');
        assert.equal(firstCookie.path, '/');
        assert.equal(secondCookie.path, '/');
        assert.isTrue(firstCookie.secure);
        assert.isTrue(secondCookie.secure);
        assert.equal(firstCookie.version, 2);
        assert.equal(secondCookie.maxAge, 5);
        assert.isTrue(secondCookie.httponly);
    });

    it('Should return a negative response if there are no cookies', function () {
        mockCookies = null;

        var response = { cookies: [] };

        var result = sessionHelper.setUserSession('12345', response);

        assert.equal(response.cookies.length, 0);
        assert.isFalse(result.ok);
    });

    it('Should add originating IP to the session bridge call', function () {
        mockCookies = null;

        var response = { cookies: [] };

        sessionHelper.setUserSession('12345', response, { httpRemoteAddress: '123' });

        assert.equal(ipResult, '123');
    });

    it('Should return a negative response if there are no response headers', function () {
        mockCookies = null;
        mockResponseHeaders = null;

        var response = { cookies: [] };

        var result = sessionHelper.setUserSession('12345', response);

        assert.equal(response.cookies.length, 0);
        assert.isFalse(result.ok);
    });
});
