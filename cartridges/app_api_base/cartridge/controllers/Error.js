'use strict';

/**
 * @namespace Error
 */

var server = require('server');
var { msg } = require('dw/web/Resource');

/**
 * Error-Start : This endpoint is called when there is a server error
 * @name Base/Error-Start
 * @function
 * @memberof Error
 * @param {httpparameter} - error - message to be displayed
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get/post
 */
server.use('Start', (req, res, next) => {
    var System = require('dw/system/System');

    res.setStatusCode(500);

    var showError = System.getInstanceType() !== System.PRODUCTION_SYSTEM
        && System.getInstanceType() !== System.STAGING_SYSTEM;

    res.json({
        error: showError ? req.error || {} : {},
        message: msg('global.error.general', 'error', null)
    });

    next();
});

/**
 * Error-ErrorCode : This endpoint can be called to display an error from a resource file
 * @name Base/Error-ErrorCode
 * @function
 * @memberof Error
 * @param {httpparameter} - err - e.g 01 (Error Code mapped in the resource file appended with 'message.error.')
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get/post
 */
server.use('ErrorCode', (req, res, next) => {
    res.setStatusCode(500);
    var errorMessage = 'message.error.' + req.querystring.err;

    res.json({
        error: req.error,
        message: msg(errorMessage, 'error', null)
    });

    next();
});

/**
 * Error-Forbidden : This endpoint is called when a shopper tries to access a forbidden content. The shopper is logged out and an error is returned
 * @name Base/Error-Forbidden
 * @function
 * @memberof Error
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Forbidden', (req, res, next) => {
    var { logoutCustomer } = require('dw/customer/CustomerMgr');

    logoutCustomer(true);

    res.json({
        error: msg('global.error.forbidden', 'error', null),
        message: msg('global.error.forbidden.message', 'error', null)
    });

    next();
});

module.exports = server.exports();
