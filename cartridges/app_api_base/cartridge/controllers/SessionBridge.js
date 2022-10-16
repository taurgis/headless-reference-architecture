'use strict';

/**
 * @namespace SessionBridge
 */

var server = require('server');

/**
 * SessionBridge-Test : This endpoint is to test the Session Bridge.
 * @name Base/SessionBridge-Test
 * @function
 * @memberof SessionBridge
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('Test', function (req, res, next) {
    var System = require('dw/system/System');

    if ((System.getInstanceType() !== System.PRODUCTION_SYSTEM)
        && (System.getInstanceType() !== System.STAGING_SYSTEM)) {
        res.json({
            customer_id: req.currentCustomer.raw.ID,
            customer_no: req.currentCustomer.profile ? req.currentCustomer.profile.customerNo : null
        });
    }

    next();
});

module.exports = server.exports();
