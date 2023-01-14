'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

var cacheMiddleware = require('../../../../../cartridges/app_api_base/cartridge/scripts/middleware/cache');

describe('cache middleware', () => {
    var next = sinon.spy();
    var res = {
        cachePeriod: 0,
        cachePeriodUnit: '',
        personalized: false
    };

    beforeEach(() => {
        next = sinon.spy();
    });

    afterEach(() => {
        next.resetHistory();
    });

    it('Should set the page cache value to 24 hours', () => {
        cacheMiddleware.applyDefaultCache(null, res, next);
        assert.isTrue(res.cachePeriod === 24);
        assert.isTrue(res.cachePeriodUnit === 'hours');
        assert.isFalse(res.personalized);
    });
    it('Should set the page cache value to 30 minutes', () => {
        cacheMiddleware.applyInventorySensitiveCache(null, res, next);
        assert.isTrue(res.cachePeriod === 30);
        assert.isTrue(res.cachePeriodUnit === 'minutes');
        assert.isFalse(res.personalized);
    });
    it('Should set the varyby value to price_promotion', () => {
        cacheMiddleware.applyPromotionSensitiveCache(null, res, next);
        assert.isTrue(res.cachePeriod === 24);
        assert.isTrue(res.cachePeriodUnit === 'hours');
        assert.isTrue(res.personalized);
    });
    it('Should set the varyby value to price_promotion with a cache value of 1 hour', () => {
        cacheMiddleware.applyShortPromotionSensitiveCache(null, res, next);
        assert.isTrue(res.cachePeriod === 1);
        assert.isTrue(res.cachePeriodUnit === 'hours');
        assert.isTrue(res.personalized);
    });
});
