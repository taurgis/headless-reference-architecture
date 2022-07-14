'use strict';

/**
 * Represents a simple key/value store
 * @param {Object} [store] - a bracket notation-compatible object
 */
function SimpleCache(store) {
    this.store = store || {};
}

/**
 * Gets a value in key/value store
 * @param {string} key - the Key
 * @returns {Object} the stored value
 */
SimpleCache.prototype.get = function (key) {
    return this.store[key];
};

/**
 * Sets a value in key/value store
 * @param {string} key - the Key
 * @param {Object} [value] - the Value to store
 */
SimpleCache.prototype.set = function (key, value) {
    this.store[key] = value;
};

/**
 * Clears values from KV store
 */
SimpleCache.prototype.clear = function () {
    var store = this.store;
    Object.keys(store).forEach(function (key) {
        store[key] = null;
    });
};

module.exports = SimpleCache;
