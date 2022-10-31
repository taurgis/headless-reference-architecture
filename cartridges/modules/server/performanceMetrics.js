'use strict';

// Start the timer here when the script is firt parsed through the require.
var scriptPerfStartTime = Date.now();
var instance = null;

/**
 * @constructor
 * @classdesc Creates a singleton Performance Metrics object
 */
var Performance = function () {
    this.scriptPerfStartTime = scriptPerfStartTime;
    this.scriptPerformance = 0;
    this.renderPerformance = 0;
    this.route = {};
};

/**
 * Reset the singleton instance of the Performance Metrics object.
 */
Performance.reset = function () {
    instance = new Performance();
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

/**
 * Function to stop the timer for total script performance. (The entire route)
 * @param {Object} res - Response object
 */
Performance.prototype.stopScriptPerformanceTimer = function (res) {
    if (!res.cachePeriod) {
        this.scriptPerformance = Date.now() - scriptPerfStartTime;
    }
};

/**
 * Function to start the timer for script performance of a specific step in the route.
 * @param {int} position - Position of a step in the route
 */
Performance.prototype.startRoutePerformanceTimer = function (position) {
    this.route[position] = {
        start: Date.now(),
        duration: 0
    };
};

/**
 * Function to stop the timer for script performance of a specific step in the route.
 * @param {int} position - Position of a step in the route
 * @param {Object} res - Response object
 */
Performance.prototype.stopRoutePerformanceTimer = function (position, res) {
    if (this.route[position] && !res.cachePeriod) {
        this.route[position].duration = Date.now() - this.route[position].start;
    }
};

/**
 * Function to start the timer for rendering (JSON/XML) performance.
 */
Performance.prototype.startRenderPerformanceTimer = function () {
    this.renderPerfStartTime = Date.now();
};

/**
 * Function to stop the timer for rendering (JSON/XML) performance.
 * @param {Object} res - Response object
 */
Performance.prototype.stopRenderPerformanceTimer = function (res) {
    if (!res.cachePeriod) {
        this.renderPerformance = Date.now() - this.renderPerfStartTime;
    }
};

/**
 * Function to set the "Server-Timing" header on the current response.
 * @param {Object} res - Response object
 */
Performance.prototype.setServerTimingResponseHeader = function (res) {
    var route = this.route;
    var routeMetrics = '';

    Object.keys(this.route).forEach(function (key) {
        routeMetrics += ', Route-Step-' + key + ';dur=' + route[key].duration;
    });

    res.setHttpHeader('X-SF-CC-Server-Timing', 'script;dur=' + this.scriptPerformance + routeMetrics + ', render;dur=' + this.renderPerformance);
};

module.exports = Performance;
