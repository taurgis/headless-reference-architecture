'use strict';

var ArrayList = require('./mocks/dw.util.Collection');

module.exports = function toProductMock(mock) {
    if (!mock || typeof mock === 'function' || mock instanceof ArrayList) {
        return mock;
    }

    var result = {};
    if (typeof mock === 'object') {
        Object.keys(mock).forEach(function (item) {
            if (typeof mock[item] === 'object') {
                if (mock[item] && mock[item].type === 'function') {
                    var innerMock = typeof mock[item].return !== 'undefined'
                        ? toProductMock(mock[item].return)
                        : toProductMock(mock[item]);
                    result[item] = function () { return innerMock; };
                } else {
                    result[item] = toProductMock(mock[item]);
                }
            } else if (item !== 'function' || item !== 'return') {
                result[item] = mock[item];
            }
        });
    } else {
        result = mock;
    }

    return result;
};
