'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var hasHookSpy = sinon.spy();
var callHookSpy = sinon.spy();

describe('Call hook', function () {
    var hooksHelpers = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/hooks', {
        'dw/system/HookMgr': {
            hasHook: hasHookSpy,
            callHook: callHookSpy
        }
    });

    beforeEach(function () {
        hasHookSpy.resetHistory();
        callHookSpy.resetHistory();
    });

    it('should call hook fallback with single argument', function () {
        hooksHelpers('app.test', 'test', 'argument', function (arg) {
            assert.equal(arg, 'argument');
        });
    });

    it('should call hook fallback with array argument', function () {
        hooksHelpers('app.test', 'test', ['argument', 'argument2'], function (arg, arg2) {
            assert.equal(arg, 'argument');
            assert.equal(arg2, 'argument2');
        });
    });

    it('should call hook fallback with multiple arguments', function () {
        hooksHelpers('apt.test', 'test', 'argument', 'argument2', 'argument3', function () {
            assert.equal(arguments.length, 3);
            assert.equal(arguments[0], 'argument');
            assert.equal(arguments[1], 'argument2');
            assert.equal(arguments[2], 'argument3');
        });
    });

    it('should call hook without parameter', function () {
        var definedHook = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/hooks', {
            'dw/system/HookMgr': {
                hasHook: function () {
                    return true;
                },
                callHook: function () {
                    assert.equal(arguments.length, 2);
                    assert.equal(arguments[0], 'app.test');
                    assert.equal(arguments[1], 'test');
                }
            }
        });

        var fallbackSpy = sinon.spy();

        definedHook('app.test', 'test', fallbackSpy);

        assert(fallbackSpy.notCalled);
    });

    it('should call hook with parameters', function () {
        var definedHook = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/hooks', {
            'dw/system/HookMgr': {
                hasHook: function () {
                    return true;
                },
                callHook: function () {
                    assert.equal(arguments.length, 5);
                    assert.equal(arguments[0], 'app.test');
                    assert.equal(arguments[1], 'test');
                    assert.equal(arguments[2], 'argument');
                    assert.equal(arguments[3], 'argument2');
                    assert.equal(arguments[4], 'argument3');
                }
            }
        });

        var fallbackSpy = sinon.spy();

        definedHook('app.test', 'test', 'argument', 'argument2', 'argument3', fallbackSpy);

        assert(fallbackSpy.notCalled);
    });
});
