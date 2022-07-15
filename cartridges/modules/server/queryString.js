'use strict';

/**
* Detect duplicate parameters and be sure to set object[key] as an array of those parameter values
*
* @param {Object} object The object to check for existing values.
* @param {string} key The key to set on object for the new value.
* @param {string} value The new value to be added to object[key].
* @return {Object} Value or array of values if object[key] has already exists.
*/
function parameterToArray(object, key, value) {
    var result = value;
    if (object[key]) {
        result = object[key];
        if (!(result instanceof Array)) {
            result = [object[key]];
        }
        result.push(value);
    }

    return result;
}

var querystring = function (raw) {
    var pair;
    var left;

    if (raw && raw.length > 0) {
        var qs = raw.substring(raw.indexOf('?') + 1).replace(/\+/g, '%20').split('&');
        for (var i = qs.length - 1; i >= 0; i--) {
            pair = qs[i].split('=');
            left = decodeURIComponent(pair[0]);

            this[left] = parameterToArray(this, left, decodeURIComponent(pair[1]));
        }
    }
};

querystring.prototype.toString = function () {
    var result = [];

    Object.keys(this).forEach(function (key) {
        result.push(encodeURIComponent(key) + '=' + encodeURIComponent(this[key]));
    }, this);

    return result.sort().join('&');
};

module.exports = querystring;
