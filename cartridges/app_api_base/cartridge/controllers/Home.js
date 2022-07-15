'use strict';

/**
 * @namespace Home
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var Resource = require('dw/web/Resource');

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
server.get('Show', cache.applyDefaultCache, function (req, res, next) {
    res.json({
        site: Resource.msg('global.site.name', 'version', null),
        version: Resource.msg('global.version.number', 'version', null)
    });
    next();
});

server.get('ErrorNotFound', function (req, res, next) {
    res.setStatusCode(404);
    res.json({
        error: Resource.msg('global.error.general', 'error', null),
        message: Resource.msg('global.error.notfound', 'error', null)
    });
    next();
});

module.exports = server.exports();
