'use strict';

/**
 * @namespace Default
 */

var server = require('server');
var { applyDefaultCache } = require('*/cartridge/scripts/middleware/cache');
var { msg } = require('dw/web/Resource');

/**
 * Default-Start : This end point is the root of the site, when opening from the BM this is the end point executed
 * @name Base/Default-Start
 * @function
 * @memberof Default
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('Start', applyDefaultCache, (req, res, next) => {
    res.json({
        site: msg('global.site.name', 'version', null),
        version: msg('global.version.number', 'version', null)
    });

    next();
});

/**
 * Default-Offline : Renders the maintenance page when a site has been set to "Maintenance mode"
 * @name Base/Default-Offline
 * @function
 * @memberof Default
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('Offline', applyDefaultCache, (req, res, next) => {
    res.json({
        error: msg('global.error.general', 'error', null),
        message: msg('global.error.offline', 'error', null)
    });

    next();
});

module.exports = server.exports();
