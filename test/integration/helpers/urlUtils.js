'use strict';

function urlUtils() {}

/**
 * Strips auth basic authentication parameters - if set - and returns the url
 *
 * @param {String} url - Url string
 * @returns {String}
 */
urlUtils.stripBasicAuth = function (url) {
    var sfIndex = url.indexOf('storefront');
    var atIndex = url.indexOf('@');
    if (sfIndex > -1 && atIndex > -1) {
        return url.slice(0, sfIndex) + url.slice(atIndex + 1, url.length);
    }
    return url;
};

module.exports = urlUtils;
