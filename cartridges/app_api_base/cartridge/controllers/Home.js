'use strict';

/**
 * @namespace Home
 */

var server = require('server');
var { applyDefaultCache } = require('*/cartridge/scripts/middleware/cache');
var { msg } = require('dw/web/Resource');

/**
 * Any customization on this endpoint, also requires update for Default-Start endpoint
 */
/**
 * Home-Show : This endpoint is called when a shopper navigates to the home page
 * @name Base/Home-Show
 * @function
 * @memberof Home
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('Show', applyDefaultCache, (req, res, next) => {
    res.json({
        site: msg('global.site.name', 'version', null),
        version: msg('global.version.number', 'version', null)
    });

    next();
});

/**
 * Home-ErrorNotFound : This endpoint is called when a shopper navigates to a non-existent page
 * @name Base/Home-ErrorNotFound
 * @function
 * @memberof Home
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('ErrorNotFound', (req, res, next) => {
    res.setStatusCode(404);

    res.json({
        error: msg('global.error.general', 'error', null),
        message: msg('global.error.notfound', 'error', null)
    });

    next();
});

module.exports = server.exports();
