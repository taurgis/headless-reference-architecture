var _ = require('lodash');

function jsonUtils() {}

/**
 * Duplicate the source object and delete specified key(s) from the new object.
 *
 * @param {JSON} srcObj
 * @param {String[]} keys
 * @returns {Object} - A new object with key(s) removed
 */
jsonUtils.deleteProperties = function (srcObj, keys) {
    var newObj = _.cloneDeep(srcObj);
    jsonUtils.removeProps(newObj, keys);
    return newObj;
};

/**
 * Delete specified key(s) from the object.
 *
 * @param {JSON} obj
 * @param {String[]} keys
 */
jsonUtils.removeProps = function (obj, keys) {
    if (obj instanceof Array && obj[0] !== null) {
        obj.forEach(function (item) {
            jsonUtils.removeProps(item, keys);
        });
    } else if (typeof obj === 'object') {
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            if (keys.indexOf(key) !== -1) {
                delete obj[key];  // eslint-disable-line no-param-reassign
            } else if (obj[key] != null) {
                jsonUtils.removeProps(obj[key], keys);
            }
        });
    }
};

/**
 * Return pretty-print JSON string
 *
 * @param {JSON} obj
 */
jsonUtils.toPrettyString = function (obj) {
    var prettyString;

    if (obj) {
        prettyString = JSON.stringify(obj, null, '\t');
    }

    return prettyString;
};

module.exports = jsonUtils;
