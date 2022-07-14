'use strict';

/**
 * @namespace Default
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var Resource = require('dw/web/Resource');

/**
 * Default-Start : This end point is the root of the site, when opening from the BM this is the end point executed
 * @name Base/Default-Start
 * @function
 * @memberof Default
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Start', cache.applyDefaultCache, function (req, res, next) {
    res.json({
        site: Resource.msg('global.site.name', 'version', null),
        version: Resource.msg('global.version.number', 'version', null)
    });
    next();
});

/** Renders the maintenance page when a site has been set to "Maintenance mode" */
server.get('Offline', cache.applyDefaultCache, function (req, res, next) {
    res.json({
        error: Resource.msg('global.error.general', 'error', null),
        message: Resource.msg('global.error.offline', 'error', null)
    });
    next();
});

module.exports = server.exports();
