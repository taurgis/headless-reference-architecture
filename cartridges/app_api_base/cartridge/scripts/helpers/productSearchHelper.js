'use strict';

var { getCache } = require('dw/system/CacheMgr');

/**
 * Fetch all static pricing information for the given product
 *
 * @param {dw.product.Product} product - The product
 * @returns {Object} - The static pricing information
 */
function getStaticResultData(product) {
    var staticCache = getCache('ProductExtendStatic');

    // try to cache if we can
    var resultSealed = staticCache.get(product.ID + ';' + request.locale, function () {
        var priceModel = product.priceModel;

        if (!priceModel) {
            return {};
        }

        var originalPrice = priceModel.price;
        var activePriceBookId;
        var salePrice = priceModel.price;
        var parentPriceBookID;

        if (!empty(priceModel) && !empty(priceModel.priceInfo)) {
            activePriceBookId = priceModel.priceInfo.priceBook.ID;

            if (!empty(priceModel.priceInfo.priceBook.parentPriceBook)) {
                parentPriceBookID = priceModel.priceInfo.priceBook.parentPriceBook.ID;
                originalPrice = priceModel.getPriceBookPrice(parentPriceBookID);
            }
        }

        return {
            masterProductId: product.variationModel.master ? product.variationModel.master.ID : product.ID,
            id: product.ID,
            priceInfo: {
                originalPrice: {
                    value: originalPrice.value,
                    currency: originalPrice.currencyCode,
                    pricebook: parentPriceBookID || activePriceBookId
                },
                salePrice: {
                    value: salePrice.value,
                    currency: salePrice.currencyCode,
                    pricebook: activePriceBookId
                }
            }
        };
    });

    // make cache entry editable, as it is sealed otherwise

    return JSON.parse(JSON.stringify(resultSealed));
}

/**
 * Fetch all static pricing information for the given product
 *
 * @param {dw.product.Product} product - The product
 * @param {Object} result - The current result
 *
 * @returns {Object} - The result extended with promotional information
 */
function extendResultWithPromotionData(product, result) {
    var { getActiveCustomerPromotions } = require('dw/campaign/PromotionMgr');

    var modifiedResult = result;
    var customerPromotions = getActiveCustomerPromotions();
    var promos = customerPromotions.getProductPromotions(product).iterator();

    if (promos.hasNext()) {
        var promo = promos.next();

        // add personalized information to cache entry
        var dynamicCache = getCache('ProductExtendDynamic');
        var promotionPrice = dynamicCache.get(product.ID + ';' + promo.ID + ';' + request.locale, function () {
            var promoPrice = promo.getPromotionalPrice(product);

            return {
                value: promoPrice.value,
                currency: promoPrice.currencyCode,
                promoDetails: {
                    id: promo.ID,
                    name: promo.name ? promo.name.toString() : null,
                    callOut: promo.calloutMsg ? promo.calloutMsg.toString() : null,
                    details: promo.details ? promo.details.toString() : null,
                    image: promo.image ? promo.image.absURL : null
                }
            };
        });

        modifiedResult.priceInfo.promotionPrice = promotionPrice;
    }

    return modifiedResult;
}

/**
 * Converts a product into a extended object
 *
 * @param {string} productId - The SKU of the product
 * @returns {Object} - The extended attributes
 */
exports.createExtendedProduct = (productId) => {
    var { getProduct } = require('dw/catalog/ProductMgr');

    var product = getProduct(productId);

    if (!product) {
        return null;
    }

    var result = getStaticResultData(product);
    result = extendResultWithPromotionData(product, result);

    return result;
};

/**
 * Get the redirect information for a search query.
 *
 * @param {string} query - The search query
 * @returns {string|null} - The redirect information
 */
exports.getSearchRedirectInformation = (query) => {
    if (!query) {
        return null;
    }

    var searchDrivenRedirectCache = getCache('SearchDrivenRedirect');

    var result = searchDrivenRedirectCache.get(query + ';' + request.locale, function () {
        var ProductSearchModel = require('dw/catalog/ProductSearchModel');
        var apiProductSearch = new ProductSearchModel();

        /**
         * @type {dw.web.URLRedirect}
         */
        var searchRedirect = apiProductSearch.getSearchRedirect(query);

        if (searchRedirect) {
            return searchRedirect.getLocation();
        }

        return null;
    });

    return result;
};

/**
 * Retrieve Custom Page Meta Tag Rules configured in the Business Manager for search
 *
 * @param {string} query - The search query
 * @returns {Array<{ID: string, content:string, name:boolean, property:boolean, title:boolean}>|null} - The configured rules
 */
exports.getSearchMetaData = (query) => {
    if (!query) {
        return null;
    }

    var metaDataCache = getCache('MetaData');

    var result = metaDataCache.get(query + ';' + request.locale, function () {
        var ProductSearchModel = require('dw/catalog/ProductSearchModel');
        var { getPageMetaTags } = require('*/cartridge/scripts/helpers/seoHelper');

        var apiProductSearch = new ProductSearchModel();

        return getPageMetaTags(apiProductSearch);
    });

    return result;
};

/**
 * Retrieve Custom Page Meta Tag Rules configured in the Business Manager for a category
 *
 * @param {string} category - The category
 * @returns {Array<{ID: string, content:string, name:boolean, property:boolean, title:boolean}>|null} - The configured rules
 */
exports.getCategoryMetaData = (category) => {
    if (!category) {
        return null;
    }

    var metaDataCache = getCache('MetaData');

    var result = metaDataCache.get(category.ID + ';' + request.locale, function () {
        var ProductSearchModel = require('dw/catalog/ProductSearchModel');
        var { getPageMetaTags } = require('*/cartridge/scripts/helpers/seoHelper');

        var apiProductSearch = new ProductSearchModel();
        apiProductSearch.setCategoryID(category.ID);

        return getPageMetaTags(apiProductSearch);
    });

    return result;
};
