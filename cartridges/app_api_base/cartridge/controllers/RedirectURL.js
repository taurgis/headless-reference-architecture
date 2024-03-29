'use strict';

/**
 * @namespace RedirectURL
 */

var server = require('server');

/**
 * RedirectURL-Start : The RedirectURL-Start endpoint handles URL redirects
 * @name Base/RedirectURL-Start
 * @function
 * @memberof RedirectURL
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Start', function (req, res, next) {
    var URLRedirectMgr = require('dw/web/URLRedirectMgr');

    var redirect = URLRedirectMgr.redirect;
    var location = redirect ? redirect.location : null;
    var redirectStatus = redirect ? redirect.getStatus() : null;

    if (!location) {
        var Resource = require('dw/web/Resource');

        res.setStatusCode(404);
        res.json({
            error: Resource.msg('global.error.general', 'error', null),
            message: Resource.msg('global.error.notfound', 'error', null)
        });
    } else {
        if (redirectStatus) {
            res.setRedirectStatus(redirectStatus);
        }
        res.redirect(location);
    }

    next();
});

/**
 * RedirectURL-Hostname : The RedirectURL-Hostname endpoint handles Hostname-only URL redirects
 * @name Base/RedirectURL-Hostname
 * @function
 * @memberof RedirectURL
 * @param {querystringparameter} - Location - optional parameter to provide a URL to redirect to
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Hostname', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');

    var url = req.querystring.Location.stringValue;
    var hostRegExp = new RegExp('^https?://' + req.httpHost + '(?=/|$)');
    var location;

    if (!url || !hostRegExp.test(url)) {
        location = URLUtils.httpHome().toString();
    } else {
        location = url;
    }

    res.redirect(location);

    next();
});

module.exports = server.exports();
