'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var collections = require('../util/collections');
var ShippingModel = require('../models/shipping');
var ShippingMethodModel = require('../models/shippingMethod');
var ShippingMgr = require('../dw/order/ShippingMgr');

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/scripts/checkout/shippingHelpers', {
        '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/models/shipping': ShippingModel,
        '*/cartridge/models/shipping/shippingMethod': ShippingMethodModel,
        'dw/order/ShippingMgr': ShippingMgr
    });
}

module.exports = proxyModel();
