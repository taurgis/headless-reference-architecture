'use strict';

var assert = require('chai').assert;
var SimpleCache = require('../../../../cartridges/modules/server/simpleCache');

describe('simpleCache', function () {
    beforeEach(function () {
    });

    afterEach(function () {
    });

    it('should handle null argument for constructor', function () {
        var cache = new SimpleCache(null);

        assert.isTrue(cache !== null);
    });

    it('should accept a pre-filled KV store', function () {
        var cache = new SimpleCache({ 'foo': 'bar' });
        var value = cache.get('foo');

        assert.isTrue(value === 'bar');
    });

    it('should get a value previously set', function () {
        var cache = new SimpleCache({});
        cache.set('foo', 'bar');
        var value = cache.get('foo');

        assert.isTrue(value === 'bar');
    });

    it('should correctly clear() values previously set', function () {
        var cache = new SimpleCache({});
        cache.set('foo', 'bar');
        cache.clear();
        var value = cache.get('foo');

        assert.isTrue(value === null);
    });
});
