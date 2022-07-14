'use strict';

function Money(isAvailable) {
    return {
        available: isAvailable,
        value: '10.99',
        getDecimalValue: function () { return '10.99'; },
        getCurrencyCode: function () { return 'USD'; },
        subtract: function () { return new Money(isAvailable); }
    };
}

module.exports = Money;
