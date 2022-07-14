'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var stubBase = sinon.stub();
var stubPrice = sinon.stub();
var stubImages = sinon.stub();
var stubAvailability = sinon.stub();
var stubDescription = sinon.stub();
var stubSearchPrice = sinon.stub();
var stubPromotions = sinon.stub();
var stubQuantity = sinon.stub();
var stubQuantitySelector = sinon.stub();
var stubRatings = sinon.stub();
var stubSizeChart = sinon.stub();
var stubVariationAttributes = sinon.stub();
var stubSearchVariationAttributes = sinon.stub();
var stubAttributes = sinon.stub();
var stubOptions = sinon.stub();
var stubCurrentUrl = sinon.stub();
var stubReadyToOrder = sinon.stub();
var stubOnline = sinon.stub();
var stubSetReadyToOrder = sinon.stub();
var stubBundleReadyToOrder = sinon.stub();
var stubSetIndividualProducts = sinon.stub();
var stubSetProductsCollection = sinon.stub();
var stubBundledProducts = sinon.stub();
var stubBonusUnitPrice = sinon.stub();
var stubRaw = sinon.stub();
var stubPageMetaData = sinon.stub();
var stubTemplate = sinon.stub();

function proxyModel() {
    return {
        mocks: proxyquire('../../cartridges/app_storefront_base/cartridge/models/product/decorators/index', {
            '*/cartridge/models/product/decorators/base': stubBase,
            '*/cartridge/models/product/decorators/availability': stubAvailability,
            '*/cartridge/models/product/decorators/description': stubDescription,
            '*/cartridge/models/product/decorators/images': stubImages,
            '*/cartridge/models/product/decorators/price': stubPrice,
            '*/cartridge/models/product/decorators/searchPrice': stubSearchPrice,
            '*/cartridge/models/product/decorators/promotions': stubPromotions,
            '*/cartridge/models/product/decorators/quantity': stubQuantity,
            '*/cartridge/models/product/decorators/quantitySelector': stubQuantitySelector,
            '*/cartridge/models/product/decorators/ratings': stubRatings,
            '*/cartridge/models/product/decorators/sizeChart': stubSizeChart,
            '*/cartridge/models/product/decorators/variationAttributes': stubVariationAttributes,
            '*/cartridge/models/product/decorators/searchVariationAttributes': stubSearchVariationAttributes,
            '*/cartridge/models/product/decorators/attributes': stubAttributes,
            '*/cartridge/models/product/decorators/options': stubOptions,
            '*/cartridge/models/product/decorators/currentUrl': stubCurrentUrl,
            '*/cartridge/models/product/decorators/readyToOrder': stubReadyToOrder,
            '*/cartridge/models/product/decorators/online': stubOnline,
            '*/cartridge/models/product/decorators/setReadyToOrder': stubSetReadyToOrder,
            '*/cartridge/models/product/decorators/bundleReadyToOrder': stubBundleReadyToOrder,
            '*/cartridge/models/product/decorators/setIndividualProducts': stubSetIndividualProducts,
            '*/cartridge/models/product/decorators/setProductsCollection': stubSetProductsCollection,
            '*/cartridge/models/product/decorators/bundledProducts': stubBundledProducts,
            '*/cartridge/models/product/decorators/bonusUnitPrice': stubBonusUnitPrice,
            '*/cartridge/models/product/decorators/raw': stubRaw,
            '*/cartridge/models/product/decorators/pageMetaData': stubPageMetaData,
            '*/cartridge/models/product/decorators/template': stubTemplate
        }),
        stubs: {
            stubBase: stubBase,
            stubPrice: stubPrice,
            stubImages: stubImages,
            stubAvailability: stubAvailability,
            stubDescription: stubDescription,
            stubSearchPrice: stubSearchPrice,
            stubPromotions: stubPromotions,
            stubQuantity: stubQuantity,
            stubQuantitySelector: stubQuantitySelector,
            stubRatings: stubRatings,
            stubSizeChart: stubSizeChart,
            stubVariationAttributes: stubVariationAttributes,
            stubSearchVariationAttributes: stubSearchVariationAttributes,
            stubAttributes: stubAttributes,
            stubOptions: stubOptions,
            stubCurrentUrl: stubCurrentUrl,
            stubReadyToOrder: stubReadyToOrder,
            stubOnline: stubOnline,
            stubSetReadyToOrder: stubSetReadyToOrder,
            stubBundleReadyToOrder: stubBundleReadyToOrder,
            stubSetIndividualProducts: stubSetIndividualProducts,
            stubSetProductsCollection: stubSetProductsCollection,
            stubBundledProducts: stubBundledProducts,
            stubBonusUnitPrice: stubBonusUnitPrice,
            stubRaw: stubRaw,
            stubPageMetaData: stubPageMetaData,
            stubTemplate: stubTemplate
        }
    };
}

module.exports = proxyModel();
