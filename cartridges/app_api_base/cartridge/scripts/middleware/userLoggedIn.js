'use strict';

/**
 * Middleware validating if user logged in
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function validateLoggedIn(req, res, next) {
    if (!req.currentCustomer.profile) {
        var Resource = require('dw/web/Resource');

        res.setStatusCode(403);

        res.json({
            error: Resource.msg('global.error.forbidden', 'error', null),
            message: Resource.msg('global.error.forbidden.message', 'error', null)
        });
    }
    next();
}

module.exports = {
    validateLoggedIn: validateLoggedIn
};
