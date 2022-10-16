'use strict';

/**
 * The onSession hook is called for every new session in a site. For performance reasons the hook function should be kept short.
 *
 */

var Status = require('dw/system/Status');
var Encoding = require('dw/crypto/Encoding');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var URLParameter = require('dw/web/URLParameter');
var sessionHelper = require('*/cartridge/scripts/helpers/sessionHelper');
var Logger = require('dw/system/Logger').getLogger('session-bridge');

/**
 * Puts together the SEO URL from the httpPath and httpQueryString of a request
 *
 * The httpPath will look like /on/demandware.store/Sites-RefArch-Site/en_US/Login-Show
 *
 * @param {string} httpPath - the http path from the request url. This is the relative non SEO-optimized path
 * @param {string} queryString - the query string from the request url
 * @returns {dw.web.URL} url - the SEO optimized url path for the current page
 */
function getSEOUrl(httpPath, queryString) {
    var pathParts = httpPath.substr(1).split('/');

    // If there are 3 or less parts to the httpPath there is probably no specified controller so we direct to the home page
    if (pathParts.length <= 3) {
        return URLUtils.httpsHome();
    }

    // The action (aka the controller start node) is always the final part of the httpPath
    var action = new URLAction(pathParts[pathParts.length - 1]);

    var urlParts = [];
    if (queryString) {
        var qsParts = queryString.split('&');
        urlParts = qsParts.map(function (qsParam) {
            var paramParts = qsParam.split('=');

            if (paramParts[1]) {
                // The query parameter is a key/value pair, e.g. `?foo=bar`

                var key = paramParts.shift();
                // if there are `=` characters in the parameter value, rejoin them
                var value = paramParts.join('=');

                return new URLParameter(key, value);
            }

            // The query parameter is not a key/value pair, e.g. `?queryparam`

            return new URLParameter(undefined, qsParam, false);
        });
    }
    urlParts.unshift(action);
    return Encoding.fromURI(URLUtils.url.apply(URLUtils, urlParts).toString());
}

/**
 * The onSession hook function
 *
 * @returns {dw/system/Status} status - return status
 */
exports.onSession = function () {
    var isStorefrontSession = session && session.customer;
    var isNotRegisteredUser = !session.customer.profile;
    var bearerToken = request.httpHeaders.authorization ? request.httpHeaders.authorization.replace('Bearer ', '') : null;
    var isRedirect = request.httpParameters.sb_redirect;

    // For now this method only works for GET calls as a redirect is involved.
    var isGET = request.httpMethod === 'GET';

    if (isStorefrontSession
        && isNotRegisteredUser
        && bearerToken
        && isGET
        && !isRedirect
    ) {
        // establish user session using the access token
        var result = sessionHelper.setUserSession(
            bearerToken,
            response,
            request
        );

        if (!result.ok) {
            Logger.error(
                'Exception: Could not establish session using session bridge, check the service response'
            );
        } else {
            Logger.debug(
                'Session bridge successfully completed!'
            );

            var redirectParameter = (request.httpQueryString ? '&' : '') + 'sb_redirect=true';

            response.redirect(getSEOUrl(request.httpPath, (request.httpQueryString || '') + redirectParameter));
        }
    } else {
        Logger.debug(
            'Could not initiate Session Bridge!'
        );
    }

    return new Status(Status.OK);
};
