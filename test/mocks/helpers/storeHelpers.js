'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var templateStub = sinon.stub();
var StoreModel = require('../models/store');

var StoresModel = proxyquire('../../../cartridges/app_storefront_base/cartridge/models/stores', {
    '*/cartridge/models/store': StoreModel,
    'dw/util/HashMap': function () {
        return {
            result: {},
            put: function (key, context) {
                this.result[key] = context;
            }
        };
    },
    'dw/value/Money': function () {},
    'dw/util/Template': function () {
        return {
            render: function () {
                return { text: 'someString' };
            }
        };
    },
    '*/cartridge/scripts/renderTemplateHelper': {
        getRenderedHtml: function () { return 'someString'; }
    },

    '*/cartridge/scripts/helpers/storeHelpers': {
        createStoresResultsHtml: function () {
            return 'someString';
        }
    }
});

var storeMgr = require('../dw/catalog/StoreMgr');

var site = {
    getCurrent: function () {
        return {
            getCustomPreferenceValue: function () {
                return 'SOME_API_KEY';
            }
        };
    }

};

var urlUtils = {
    url: function (endPointName) {
        return {
            toString: function () {
                return 'path-to-endpoint/' + endPointName;
            }
        };
    }
};

var productInventoryMgr = require('../dw/catalog/ProductInventoryMgr');

var hashMap = function () {
    return {
        result: {},
        put: function (key, context) {
            this.result[key] = context;
        }
    };
};

templateStub.returns({
    render: function () {
        return { text: 'rendered html' };
    }
});


function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/scripts/helpers/storeHelpers', {
        '*/cartridge/models/store': StoreModel,
        '*/cartridge/models/stores': StoresModel,
        'dw/catalog/StoreMgr': storeMgr,
        'dw/system/Site': site,
        'dw/web/URLUtils': urlUtils,
        'dw/catalog/ProductInventoryMgr': productInventoryMgr,
        'dw/util/HashMap': hashMap,
        'dw/util/Template': templateStub
    });
}

module.exports = proxyModel();
