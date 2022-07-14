'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var collections = require('../util/collections');

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/models/productLineItems', {
        '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/scripts/factories/product': {
            get: function () {
                return { bonusProducts: null, bonusProductLineItemUUID: null };
            }
        },
        'dw/web/URLUtils': {
            staticURL: function () {
                return '/images/noimagelarge.png';
            }
        },
        'dw/web/Resource': {
            msgf: function (param1) {
                return param1;
            }
        }
    });
}

module.exports = proxyModel();
