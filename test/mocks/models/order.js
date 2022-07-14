'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var AddressModel = require('./address');
var BillingModel = require('./billing');
var ShippingModel = require('./shipping');
var PaymentModel = require('./payment');
var TotalsModel = require('./totals');
var ProductLineItemsModel = require('./productLineItems');

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/models/order', {
        'dw/web/URLUtils': {
        },
        'dw/order/PaymentMgr': {
        },
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formatted money';
            }
        },
        'dw/web/Resource': {
            msg: function () {
                return 'someString';
            },
            msgf: function () {
                return 'someString';
            }
        },
        'dw/system/HookMgr': function () {},
        '*/cartridge/models/address': AddressModel,
        '*/cartridge/models/billing': BillingModel,
        '*/cartridge/models/shipping': ShippingModel,
        '*/cartridge/models/payment': PaymentModel,
        '*/cartridge/models/totals': TotalsModel,
        '*/cartridge/models/productLineItems': ProductLineItemsModel,
        '*/cartridge/scripts/checkout/shippingHelpers': {
            getShippingModels: function () {
                return [{ shippingAddress: {
                    firstName: 'someString',
                    lastName: null
                }
                }];
            }
        },
        '*/cartridge/scripts/checkout/checkoutHelpers': {
            isPickUpInStore: function () {
                return false;
            },
            ensureValidShipments: function () {
                return true;
            }
        },
        'dw/util/Locale': {
            getLocale: function () {
                return 'US';
            }
        }
    });
}

module.exports = proxyModel();
