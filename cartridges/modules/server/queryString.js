'use strict';

/**
 * Zips the pref[n|v] http query params
 *
 * The Platform allows the use of multiple preference names and values to filter search results,
 * eg.: http://<sandbox>.com/../Search-Show?prefn1=refinementColor&prefv1=Blue&prefn2=size&prefv2=16
 *
 * @param {Object} preferences - HTTP query parameters map specific to selected refinement values
 * @return {Object} Map of provided preference name/value pairs
 */
function parsePreferences(preferences) {
    var params = {};
    var count = Math.floor(Object.keys(preferences).length / 2);
    var key = '';
    var value = '';

    for (var i = 1; i < count + 1; i++) {
        key = preferences['prefn' + i];
        if (preferences['prefmin' + i]) {
            value = {
                min: preferences['prefmin' + i],
                max: preferences['prefmax' + i]
            };
        } else {
            value = preferences['prefv' + i];
        }
        params[key] = value;
    }

    return params;
}

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
    var preferences = {};

    if (raw && raw.length > 0) {
        var qs = raw.substring(raw.indexOf('?') + 1).replace(/\+/g, '%20').split('&');
        for (var i = qs.length - 1; i >= 0; i--) {
            pair = qs[i].split('=');
            left = decodeURIComponent(pair[0]);
            if (left.indexOf('dwvar_') === 0) {
                left = left.replace(/__/g, '++');
                var variableParts = left.split('_');
                if (variableParts.length >= 3) {
                    if (!this.variables) {
                        this.variables = {};
                    }
                    this.variables[variableParts.slice(2).join('_')] = {
                        id: variableParts[1].replace(/\+\+/g, '_'),
                        value: decodeURIComponent(pair[1])
                    };
                    continue; // eslint-disable-line no-continue
                }
            } else if (left.indexOf('dwopt_') === 0) {
                left = left.replace(/__/g, '++');
                var optionParts = left.split('_');
                var productId = optionParts[1].replace(/\+\+/g, '_');
                var optionId = optionParts.slice(2).join('_');
                var selectedOptionValueId = decodeURIComponent(pair[1]);
                if (optionParts.length >= 3) {
                    if (!this.options) {
                        this.options = [];
                    }
                    this.options.push({
                        optionId: optionId,
                        selectedValueId: selectedOptionValueId,
                        productId: productId
                    });
                    continue; // eslint-disable-line no-continue
                }
            } else if (left.indexOf('pref') === 0) {
                preferences[left] = decodeURIComponent(pair[1]);
                continue; // eslint-disable-line no-continue
            }

            this[left] = parameterToArray(this, left, decodeURIComponent(pair[1]));
        }
    }

    if (Object.keys(preferences).length) {
        this.preferences = parsePreferences(preferences);
    }
};

querystring.prototype.toString = function () {
    var result = [];
    var prefKeyIdx = 1;
    var preferences = {};

    Object.keys(this).forEach(function (key) {
        if (key === 'variables' && this.variables instanceof Object) {
            Object.keys(this.variables).forEach(function (variable) {
                result.push('dwvar_' +
                    this.variables[variable].id.replace(/_/g, '__') + '_' +
                    variable + '=' + encodeURIComponent(this.variables[variable].value));
            }, this);
        } else if (key === 'options' && this.options instanceof Array) {
            this.options.forEach(function (option) {
                result.push('dwopt_' +
                    option.productId.replace(/_/g, '__') + '_' +
                    option.optionId + '=' + encodeURIComponent(option.selectedValueId));
            });
        } else if (key === 'preferences' && this.preferences instanceof Object) {
            preferences = this.preferences;
            Object.keys(preferences).forEach(function (prefKey) {
                // Due to the nature of what is passed to this function this may be the literal string "undefined"
                if (prefKey !== 'undefined' && preferences[prefKey]) {
                    result.push('prefn' + prefKeyIdx + '=' + encodeURIComponent(prefKey));
                    if (preferences[prefKey].min) {
                        result.push('prefmin' + prefKeyIdx + '=' + encodeURIComponent(preferences[prefKey].min));
                        result.push('prefmax' + prefKeyIdx + '=' + encodeURIComponent(preferences[prefKey].max));
                    } else {
                        result.push('prefv' + prefKeyIdx + '=' + encodeURIComponent(preferences[prefKey]));
                    }
                } else {
                    var Logger = require('dw/system/Logger');
                    Logger.warn('We were passed a key "undefined in the preferences object in queryString.js');
                }
                prefKeyIdx++;
            });
        } else {
            result.push(encodeURIComponent(key) + '=' + encodeURIComponent(this[key]));
        }
    }, this);

    return result.sort().join('&');
};

module.exports = querystring;
