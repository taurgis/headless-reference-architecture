'use strict';

var Cookie = require('dw/web/Cookie');
var sessionBridge = require('*/cartridge/scripts/services/SessionBridgeService');

/**
 * save cookies to HTTP response
 * @param {{Array}} cookieStrings - array of set-Cookie header strings
 * @param {{dw.system.Response}} resp - response object
 */
function addCookiesToResponse(cookieStrings, resp) {
    cookieStrings.toArray().forEach(function (cookieString) {
        var cookieParts = cookieString.split(';');
        var nameValue = cookieParts.shift().split('=');
        var name = nameValue.shift();
        var value = nameValue.join('=');
        value = decodeURIComponent(value);
        var newCookie = new Cookie(name, value);
        cookieParts.forEach(function (part) {
            var sides = part.split('=');
            var key = sides.shift().trim().toLowerCase();
            value = sides.join('=');
            if (key === 'path') {
                newCookie.setPath(value);
            } else if (key === 'max-age') {
                newCookie.setMaxAge(parseInt(value, 10));
            } else if (key === 'secure') {
                newCookie.setSecure(true);
            } else if (key === 'httponly') {
                newCookie.setHttpOnly(true);
            } else if (key === 'version') {
                newCookie.setVersion(value);
            }
        });
        resp.addHttpCookie(newCookie);
    });
}

/**
 * Establish session with session bridge using the access token
 * @param {{string}}accessToken - access_token to be used to establish session
 * @param {dw.system.Response} resp - response object
 * @param {dw.system.Request} req - request object
 * @returns {{Object}} - response from session bridge API call
 */
function setUserSession(accessToken, resp, req) {
    var responseObj = {};
    var ip;
    if (req && req.httpRemoteAddress) {
        ip = req.httpRemoteAddress;
    }

    var result = sessionBridge.getSession(accessToken, ip);
    if (result && result.responseHeaders) {
        var cookies = result.responseHeaders.get('set-cookie');

        if (cookies) {
            responseObj.cookies = cookies;
            // drop the cookies in browser
            addCookiesToResponse(cookies, resp);
            responseObj.ok = true;
        } else {
            responseObj.ok = false;
        }
    } else {
        responseObj.ok = false;
    }
    return responseObj;
}

module.exports = {
    setUserSession: setUserSession
};
