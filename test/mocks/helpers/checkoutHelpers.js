'use strict';


var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var collections = require('../util/collections');
var addressModel = require('../models/address');
var orderModel = require('../models/order');

var renderTemplateHelper = require('./renderTemplateHelper');
var shippingHelpers = require('./shippingHelpers');
var basketMgr = require('../dw/order/BasketMgr');


var server = {
    forms: {
        getForm: function (formName) {
            return {
                formName: formName,
                clear: function () {}
            };
        }
    }
};

var transaction = {
    wrap: function (callBack) {
        return callBack.call();
    },
    begin: function () {},
    commit: function () {}
};

var hookMgr = {
    callHook: function () {}
};

var resource = {
    msg: function (param1) {
        return param1;
    }
};

var status = {
    OK: 0,
    ERROR: 1
};

var orderMgr = {
    createOrder: function () {
        return { order: 'new order' };
    },
    placeOrder: function () {
        return status.OK;
    },
    failOrder: function () {
        return { order: 'failed order' };
    }
};

var order = {
    CONFIRMATION_STATUS_NOTCONFIRMED: 'ONFIRMATION_STATUS_NOTCONFIRMED',
    CONFIRMATION_STATUS_CONFIRMED: 'CONFIRMATION_STATUS_CONFIRMED',
    EXPORT_STATUS_READY: 'order export status is ready'
};

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/scripts/checkout/checkoutHelpers', {
        'server': server,
        '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/scripts/helpers/basketCalculationHelpers': { calculateTotals: function () {} },

        'dw/order/BasketMgr': basketMgr,
        'dw/util/HashMap': {},
        'dw/system/HookMgr': hookMgr,
        'dw/net/Mail': {},
        'dw/order/OrderMgr': orderMgr,
        'dw/order/PaymentInstrument': {},
        'dw/order/PaymentMgr': {},
        'dw/order/Order': order,
        'dw/system/Status': status,
        'dw/web/Resource': resource,
        'dw/system/Site': {},
        'dw/util/Template': {},
        'dw/system/Transaction': transaction,

        '*/cartridge/models/address': addressModel,
        '*/cartridge/models/order': orderModel,

        '*/cartridge/scripts/renderTemplateHelper': renderTemplateHelper,
        '*/cartridge/scripts/checkout/shippingHelpers': shippingHelpers,
        '*/cartridge/scripts/formErrors': require('../../../cartridges/app_storefront_base/cartridge/scripts/formErrors')
    });
}

module.exports = proxyModel();
