'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var collections = require('../util/collections');

var AddressModel = require('./address');
var ProductLineItemsModel = require('./productLineItems');
var ShippingMethodModel = require('./shippingMethod');

var ShippingMgr = require('../dw/order/ShippingMgr');

var shippingHelpers = {
    getApplicableShippingMethods: function (shipment, address) {
        var shippingMethods;
        if (shipment === null && address === null) {
            shippingMethods = null;
        } else {
            shippingMethods = [
                {
                    description: 'Order received within 7-10 business days',
                    displayName: 'Ground',
                    ID: '001',
                    shippingCost: '$0.00',
                    estimatedArrivalTime: '7-10 Business Days'
                },
                {
                    description: 'Order received in 2 business days',
                    displayName: '2-Day Express',
                    ID: '002',
                    shippingCost: '$9.99',
                    estimatedArrivalTime: '2 Business Days'
                }
            ];
        }
        return shippingMethods;
    }
};

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/models/shipping', {
        '*/cartridge/models/address': AddressModel,
        '*/cartridge/models/productLineItems': ProductLineItemsModel,
        '*/cartridge/models/shipping/shippingMethod': ShippingMethodModel,
        '*/cartridge/scripts/checkout/shippingHelpers': shippingHelpers,
        '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/scripts/util/formatting': {},
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formattedMoney';
            }
        },
        'dw/value/Money': require('../dw.value.Money'),
        'dw/order/ShippingMgr': ShippingMgr
    });
}

module.exports = proxyModel();
