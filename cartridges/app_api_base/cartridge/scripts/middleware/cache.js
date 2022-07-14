'use strict';

/**
 * Applies the default expiration value for the page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyDefaultCache(req, res, next) {
    res.cachePeriod = 24; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    next();
}

/**
 * Applies the default price promotion page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyPromotionSensitiveCache(req, res, next) {
    res.cachePeriod = 24; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    res.personalized = true; // eslint-disable-line no-param-reassign
    next();
}

/**
 * Applies the default price promotion page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function applyShortPromotionSensitiveCache(req, res, next) {
    res.cachePeriod = 1; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    res.personalized = true; // eslint-disable-line no-param-reassign
    next();
}

/**
 * Applies the inventory sensitive page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyInventorySensitiveCache(req, res, next) {
    res.cachePeriod = 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    next();
}

module.exports = {
    applyDefaultCache: applyDefaultCache,
    applyPromotionSensitiveCache: applyPromotionSensitiveCache,
    applyInventorySensitiveCache: applyInventorySensitiveCache,
    applyShortPromotionSensitiveCache: applyShortPromotionSensitiveCache
};
