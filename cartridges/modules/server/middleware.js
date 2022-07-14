'use strict';

/**
 * Middleware filter for get requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function get(req, res, next) {
    if (req.httpMethod === 'GET') {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for post requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function post(req, res, next) {
    if (req.httpMethod === 'POST') {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for https requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function https(req, res, next) {
    if (req.https) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for http requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function http(req, res, next) {
    if (!req.https) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware to filter for remote includes
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function include(req, res, next) {
    if (req.includeRequest) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

module.exports = {
    get: get,
    post: post,
    https: https,
    http: http,
    include: include
};
