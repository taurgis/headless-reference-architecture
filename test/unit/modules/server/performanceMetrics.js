'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var PerformanceMetrics = proxyquire('../../../../cartridges/modules/server/performanceMetrics', {
    '*/cartridge/config/performanceMetricsConf': {
        enabled: true
    }
});

describe('performanceMetrics', function () {
    beforeEach(function () {
        PerformanceMetrics.reset();
    });

    describe('constructor', function () {
        it('should set starting variables', function () {
            var performanceMetrics = new PerformanceMetrics();

            assert.equal(performanceMetrics.scriptPerformance, 0);
            assert.equal(performanceMetrics.renderPerformance, 0);
            assert.isNotNull(performanceMetrics.scriptPerfStartTime);
            assert.deepEqual(performanceMetrics.route, {});
        });
    });

    describe('getInstance', function () {
        it('should return a singleton object', function () {
            var instance1 = PerformanceMetrics.getInstance();
            var instance2 = PerformanceMetrics.getInstance();

            assert.equal(instance1, instance2);
            assert.deepEqual(instance1, instance2);
        });
    });

    describe('stopScriptPerformanceTimer', function () {
        it('should set the script performance in MS', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.scriptPerformance, 0);

            performanceMetrics.stopScriptPerformanceTimer({
                cachePeriod: null
            });

            assert.notEqual(performanceMetrics.scriptPerformance, 0);
        });

        it('should set the script performance to 0 if the response is configured to be cached', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.scriptPerformance, 0);

            performanceMetrics.stopScriptPerformanceTimer({
                cachePeriod: 5
            });

            assert.equal(performanceMetrics.scriptPerformance, 0);
        });
    });

    describe('startRoutePerformanceTimer', function () {
        it('should add a step to the route', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);

            assert.equal(Object.keys(performanceMetrics.route).length, 1);
        });

        it('should support multiple steps', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);
            performanceMetrics.startRoutePerformanceTimer(2);

            assert.equal(Object.keys(performanceMetrics.route).length, 2);
        });

        it('should set the current time as start for the passed step', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);

            assert.equal(performanceMetrics.route[1].start, Date.now());
        });

        it('should set the duration to 0', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);

            assert.equal(performanceMetrics.route[1].duration, 0);
        });
    });

    describe('stopRoutePerformanceTimer', function () {
        beforeEach(function () {
            PerformanceMetrics.getInstance().startRoutePerformanceTimer(1);
        });

        it('should set the route step performance in MS', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.route[1].duration, 0);

            for (var i = 0; i < 50000; i += 1) { /* Do nothing */ }

            performanceMetrics.stopRoutePerformanceTimer(1, {
                cachePeriod: null
            });

            assert.notEqual(performanceMetrics.route[1].duration, 0);
        });

        it('should set the route step performance to 0 if the response is configured to be cached', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.route[1].duration, 0);

            performanceMetrics.stopRoutePerformanceTimer(1, {
                cachePeriod: 5
            });

            assert.equal(performanceMetrics.route[1].duration, 0);
        });

        it('should not crash if a step that does not excist is passed', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.stopRoutePerformanceTimer(10, {
                cachePeriod: 5
            });
        });
    });

    describe('startRenderPerformanceTimer', function () {
        it('should set the start time', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRenderPerformanceTimer();

            assert.equal(performanceMetrics.renderPerfStartTime, Date.now());
        });
    });

    describe('stopRenderPerformanceTimer', function () {
        beforeEach(function () {
            PerformanceMetrics.getInstance().startRenderPerformanceTimer();
        });

        it('should set the render performance in MS', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.renderPerformance, 0);

            for (var i = 0; i < 50000; i += 1) { /* Do nothing */ }

            performanceMetrics.stopRenderPerformanceTimer({
                cachePeriod: null
            });

            assert.notEqual(performanceMetrics.renderPerformance, 0);
        });

        it('should set the render performance to 0 if the response is configured to be cached', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            assert.equal(performanceMetrics.renderPerformance, 0);

            performanceMetrics.stopRenderPerformanceTimer({
                cachePeriod: 5
            });

            assert.equal(performanceMetrics.renderPerformance, 0);
        });
    });

    describe('setServerTimingResponseHeader', function () {
        it('should use the correct header name', function () {
            var headerResult = '';
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.setServerTimingResponseHeader({
                setHttpHeader: (key) => {
                    headerResult = key;
                }
            });

            assert.equal(headerResult, 'X-SF-CC-Server-Timing');
        });

        it('should set the header on the response', function () {
            var headerResult = '';
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.setServerTimingResponseHeader({
                setHttpHeader: (key, value) => {
                    headerResult = value;
                }
            });

            assert.equal(headerResult, 'script;dur=0, render;dur=0');
        });

        it('should set the header on the response containing route information', function () {
            var headerResult = '';
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);
            performanceMetrics.stopRoutePerformanceTimer(1, {
                cachePeriod: null
            });

            performanceMetrics.setServerTimingResponseHeader({
                setHttpHeader: (key, value) => {
                    headerResult = value;
                }
            });

            assert.equal(headerResult, 'script;dur=0, Route-Step-1;dur=0, render;dur=0');
        });

        it('should set the header on the response containing route information that has multiple steps', function () {
            var headerResult = '';
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);
            performanceMetrics.stopRoutePerformanceTimer(1, {
                cachePeriod: null
            });

            performanceMetrics.startRoutePerformanceTimer(2);
            performanceMetrics.stopRoutePerformanceTimer(2, {
                cachePeriod: null
            });

            performanceMetrics.setServerTimingResponseHeader({
                setHttpHeader: (key, value) => {
                    headerResult = value;
                }
            });

            assert.equal(headerResult, 'script;dur=0, Route-Step-1;dur=0, Route-Step-2;dur=0, render;dur=0');
        });
    });

    describe('config disabled', function () {
        before(function () {
            PerformanceMetrics = proxyquire('../../../../cartridges/modules/server/performanceMetrics', {
                '*/cartridge/config/performanceMetricsConf': {
                    enabled: false
                }
            });
        });

        it('should not execute stopScriptPerformanceTimer if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.stopScriptPerformanceTimer();

            assert.equal(performanceMetrics.scriptPerformance, 0);
        });

        it('should not execute startRoutePerformanceTimer if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRoutePerformanceTimer(1);

            assert.equal(Object.keys(performanceMetrics.route).length, 0);
        });

        it('should not execute stopRoutePerformanceTimer if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.stopRoutePerformanceTimer(1);

            assert.equal(Object.keys(performanceMetrics.route).length, 0);
        });

        it('should not execute startRenderPerformanceTimer if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.startRenderPerformanceTimer();

            assert.isUndefined(performanceMetrics.renderPerfStartTime);
        });

        it('should not execute stopRenderPerformanceTimer if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();

            performanceMetrics.stopRenderPerformanceTimer();

            assert.equal(performanceMetrics.renderPerformance, 0);
        });

        it('should not execute setServerTimingResponseHeader if Performance Metrics are disabled', function () {
            var performanceMetrics = PerformanceMetrics.getInstance();
            var headerResult = null;

            performanceMetrics.setServerTimingResponseHeader({
                setHttpHeader: (key, value) => {
                    headerResult = value;
                }
            });

            assert.isNull(headerResult);
        });
    });
});
