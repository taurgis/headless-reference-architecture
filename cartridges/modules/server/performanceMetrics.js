'use strict';

// Start the timer here when the script is firt parsed through the require.
var scriptPerfStartTime = Date.now();
var instance = null;

/**
 * @constructor
 * @classdesc Creates a singleton Performance Metrics object
 */
var Performance = function () {
    this.scriptPerformance = 0;
    this.renderPerformance = 0;
    this.route = {};
};

/**
 * Fetch the singleton instance of the Performance Metrics object
 *
 * @returns {Performance} The Performance Metrics object
 */
Performance.getInstance = function () {
    if (!instance) {
        instance = new Performance();
    }

    return instance;
};

Performance.prototype.stopScriptPerformanceTimer = function (res) {
    if (!res.cachePeriod) {
        this.scriptPerformance = Date.now() - scriptPerfStartTime;
    }
};

Performance.prototype.startRoutePerformanceTimer = function (position) {
    this.route[position] = {
        start: new Date(),
        duration: 0
    };
};

Performance.prototype.stopRoutePerformanceTimer = function (position, res) {
    if (this.route[position] && !res.cachePeriod) {
        this.route[position].duration = Date.now() - this.route[position].start;
    }
};

Performance.prototype.startRenderPerformanceTimer = function () {
    this.renderPerfStartTime = Date.now();
};

Performance.prototype.stopRenderPerformanceTimer = function (res) {
    if (!res.cachePeriod) {
        this.renderPerformance = Date.now() - this.renderPerfStartTime;
    }
};

Performance.prototype.setServerTimingResponseHeader = function (res) {
    var route = this.route;
    var routeMetrics = '';

    Object.keys(this.route).forEach(function (key) {
        routeMetrics += ', Route-Step-' + key + ';dur=' + route[key].duration;
    });

    res.setHttpHeader('X-SF-CC-Server-Timing', 'script;dur=' + this.scriptPerformance + routeMetrics + ', render;dur=' + this.renderPerformance);
};

module.exports = Performance;
