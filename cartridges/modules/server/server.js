/* globals request:false, response:false, customer:false, session:false */

'use strict';

var HookMgr = require('dw/system/HookMgr');
var middleware = require('./middleware');
var Request = require('./request');
var Response = require('./response');
var Route = require('./route');
var render = require('./render');

//--------------------------------------------------
// Private helpers
//--------------------------------------------------

/**
 * Validate that first item is a string and all of the following items are functions
 * @param {string} name - Arguments that were passed into function
 * @param {Array} middlewareChain - middleware chain
 * @returns {void}
 */
function checkParams(name, middlewareChain) {
    if (typeof name !== 'string') {
        throw new Error('First argument should be a string');
    }

    if (!middlewareChain.every(function (item) { return typeof item === 'function'; })) {
        throw new Error('Middleware chain can only contain functions');
    }
}

//--------------------------------------------------
// Public Interface
//--------------------------------------------------

/**
 * @constructor
 * @classdesc Server is a routing solution
 */
function Server() {
    this.routes = {};
}

Server.prototype = {
    /**
     * Creates a new route with a name and a list of middleware
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    use: function use(name) {
        var args = Array.isArray(arguments) ? arguments : Array.prototype.slice.call(arguments);
        var middlewareChain = args.slice(1);
        var rq = new Request(
            typeof request !== 'undefined' ? request : {},
            typeof customer !== 'undefined' ? customer : {},
            typeof session !== 'undefined' ? session : {});
        checkParams(args[0], middlewareChain);

        var rs = new Response(typeof response !== 'undefined' ? response : {});

        if (this.routes[name]) {
            throw new Error('Route with this name already exists');
        }

        var route = new Route(name, middlewareChain, rq, rs);
        // Add event handler for rendering out view on completion of the request chain
        route.on('route:Complete', function onRouteCompleteHandler(req, res) {
            // compute cache value and set on response when we have a non-zero number
            if (res.cachePeriod && typeof res.cachePeriod === 'number') {
                var currentTime = new Date(Date.now());
                if (res.cachePeriodUnit && res.cachePeriodUnit === 'minutes') {
                    currentTime.setMinutes(currentTime.getMinutes() + res.cachePeriod);
                } else {
                    // default to hours
                    currentTime.setHours(currentTime.getHours() + res.cachePeriod);
                }
                res.base.setExpires(currentTime);
            }
            // add vary by
            if (res.personalized) {
                res.base.setVaryBy('price_promotion');
            }

            if (res.redirectUrl) {
                // if there's a pending redirect, break the chain
                route.emit('route:Redirect', req, res);
                if (res.redirectStatus) {
                    res.base.redirect(res.redirectUrl, res.redirectStatus);
                } else {
                    res.base.redirect(res.redirectUrl);
                }
                return;
            }

            render.applyRenderings(res);
        });

        this.routes[name] = route;

        if (HookMgr.hasHook('app.server.registerRoute')) {
            // register new route, allowing route events to be registered against
            HookMgr.callHook('app.server.registerRoute', 'registerRoute', route);
        }

        return route;
    },
    /**
     * Shortcut to "use" method that adds a check for get request
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    get: function get() {
        var args = Array.prototype.slice.call(arguments);
        args.splice(1, 0, middleware.get);
        return this.use.apply(this, args);
    },
    /**
     * Shortcut to "use" method that adds a check for post request
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    post: function post() {
        var args = Array.prototype.slice.call(arguments);
        args.splice(1, 0, middleware.post);
        return this.use.apply(this, args);
    },
    /**
     * Output an object with all of the registered routes
     * @returns {Object} Object with properties that match registered routes
     */
    exports: function exports() {
        var exportStatement = {};
        Object.keys(this.routes).forEach(function (key) {
            exportStatement[key] = this.routes[key].getRoute();
            exportStatement[key].public = true;
        }, this);
        if (!exportStatement.__routes) {
            exportStatement.__routes = this.routes;
        }
        return exportStatement;
    },
    /**
     * Extend existing server object with a list of registered routes
     * @param {Object} server - Object that corresponds to the output of "exports" function
     * @returns {void}
     */
    extend: function (server) {
        var newRoutes = {};
        if (!server.__routes) {
            throw new Error('Cannot extend non-valid server object');
        }
        if (Object.keys(server.__routes).length === 0) {
            throw new Error('Cannot extend server without routes');
        }

        Object.keys(server.__routes).forEach(function (key) {
            newRoutes[key] = server.__routes[key];
        });

        this.routes = newRoutes;
    },
    /**
     * Modify a given route by prepending additional middleware to it
     * @param {string} name - Name of the route to modify
     * @param {Function[]} arguments - List of functions to be appended
     * @returns {void}
     */
    prepend: function prepend(name) {
        var args = Array.prototype.slice.call(arguments);
        var middlewareChain = Array.prototype.slice.call(arguments, 1);

        checkParams(args[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        this.routes[name].chain = middlewareChain.concat(this.routes[name].chain);
    }, /**
    * Modify a given route by appending additional middleware to it
    * @param {string} name - Name of the route to modify
    * @param {Function[]} arguments - List of functions to be appended
    * @returns {void}
    */
    append: function append(name) {
        var args = Array.prototype.slice.call(arguments);
        var middlewareChain = Array.prototype.slice.call(arguments, 1);

        checkParams(args[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        this.routes[name].chain = this.routes[name].chain.concat(middlewareChain);
    },

    /**
     * Replace a given route with the new one
     * @param {string} name - Name of the route to replace
     * @param {Function[]} arguments - List of functions for the route
     * @returns {void}
     */
    replace: function replace(name) {
        var args = Array.prototype.slice.call(arguments);
        var middlewareChain = Array.prototype.slice.call(arguments, 1);
        checkParams(args[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        delete this.routes[name];

        this.use.apply(this, arguments);
    },

    /**
     * Returns a given route from the server
     * @param {string} name - Name of the route
     * @returns {Object} Route that matches the name that was passed in
     */
    getRoute: function getRoute(name) {
        return this.routes[name];
    }
};

module.exports = new Server();
