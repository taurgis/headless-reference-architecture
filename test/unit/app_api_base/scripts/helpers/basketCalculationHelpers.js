'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

describe('Helpers - Totals', function () {
    var hookMgrSpy = sinon.spy();
    var hookHelperSpy = sinon.spy();

    var basketCalculationHelpers = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/basketCalculationHelpers', {
        'dw/system/HookMgr': { callHook: hookMgrSpy },
        '*/cartridge/scripts/helpers/hooks': hookHelperSpy,
        '*/cartridge/scripts/hooks/taxes': { calculateTaxes: function () {} }
    });

    beforeEach(function () {
        hookMgrSpy.resetHistory();
        hookHelperSpy.resetHistory();
    });

    it('Should call taxes hook', function () {
        basketCalculationHelpers.calculateTaxes();

        assert.isTrue(hookHelperSpy.calledWith('app.basket.taxes', 'calculateTaxes'));
    });

    it('Should call totals hook', function () {
        basketCalculationHelpers.calculateTotals();

        assert.isTrue(hookMgrSpy.calledWith('dw.order.calculate', 'calculate'));
    });
});
