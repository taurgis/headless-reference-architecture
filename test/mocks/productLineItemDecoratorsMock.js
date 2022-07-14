'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var stubGift = sinon.stub();
var stubBonusProductLineItem = sinon.stub();
var stubAppliedPromotions = sinon.stub();
var stubRenderedPromotions = sinon.stub();
var stubUuid = sinon.stub();
var stubOrderable = sinon.stub();
var stubShipment = sinon.stub();
var stubPriceTotal = sinon.stub();
var stubQuantityOptions = sinon.stub();
var stubOptions = sinon.stub();
var stubQuantity = sinon.stub();
var stubBundledProductLineItems = sinon.stub();
var stubBonusProductLineItemUUID = sinon.stub();
var stubDiscountBonusLineItems = sinon.stub();
var stubBonusUnitPrice = sinon.stub();
var stubPreOrderUUID = sinon.stub();

function proxyModel() {
    return {
        mocks: proxyquire('../../cartridges/app_storefront_base/cartridge/models/productLineItem/decorators/index', {
            '*/cartridge/models/productLineItem/decorators/gift': stubGift,
            '*/cartridge/models/productLineItem/decorators/bonusProductLineItem': stubBonusProductLineItem,
            '*/cartridge/models/productLineItem/decorators/appliedPromotions': stubAppliedPromotions,
            '*/cartridge/models/productLineItem/decorators/renderedPromotions': stubRenderedPromotions,
            '*/cartridge/models/productLineItem/decorators/uuid': stubUuid,
            '*/cartridge/models/productLineItem/decorators/orderable': stubOrderable,
            '*/cartridge/models/productLineItem/decorators/shipment': stubShipment,
            '*/cartridge/models/productLineItem/decorators/priceTotal': stubPriceTotal,
            '*/cartridge/models/productLineItem/decorators/quantityOptions': stubQuantityOptions,
            '*/cartridge/models/productLineItem/decorators/options': stubOptions,
            '*/cartridge/models/productLineItem/decorators/quantity': stubQuantity,
            '*/cartridge/models/productLineItem/decorators/bundledProductLineItems': stubBundledProductLineItems,
            '*/cartridge/models/productLineItem/decorators/bonusProductLineItemUUID': stubBonusProductLineItemUUID,
            '*/cartridge/models/productLineItem/decorators/discountBonusLineItems': stubDiscountBonusLineItems,
            '*/cartridge/models/productLineItem/decorators/bonusUnitPrice': stubBonusUnitPrice,
            '*/cartridge/models/productLineItem/decorators/preOrderUUID': stubPreOrderUUID
        }),
        stubs: {
            stubGift: stubGift,
            stubBonusProductLineItem: stubBonusProductLineItem,
            stubAppliedPromotions: stubAppliedPromotions,
            stubRenderedPromotions: stubRenderedPromotions,
            stubUuid: stubUuid,
            stubOrderable: stubOrderable,
            stubShipment: stubShipment,
            stubPriceTotal: stubPriceTotal,
            stubQuantityOptions: stubQuantityOptions,
            stubOptions: stubOptions,
            stubQuantity: stubQuantity,
            stubBundledProductLineItems: stubBundledProductLineItems,
            stubDiscountBonusLineItems: stubDiscountBonusLineItems,
            stubBonusProductLineItemUUID: stubBonusProductLineItemUUID,
            stubBonusUnitPrice: stubBonusUnitPrice,
            stubPreOrderUUID: stubPreOrderUUID
        }
    };
}

module.exports = proxyModel();
