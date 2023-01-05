'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const productSearchHelper = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/productSearchHelper', {
    'dw/system/CacheMgr': {
        getCache: () => {
            return {
                get: (key, callbackFunction) => {
                    return callbackFunction();
                }
            };
        }
    },
    '*/cartridge/scripts/helpers/seoHelper': require('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/seoHelper'),
    'dw/catalog/ProductSearchModel': function () {
        return {
            pageMetaTags: [{
                ID: 'id',
                content: 'content',
                name: false,
                property: true,
                title: false
            }],
            getSearchRedirect: function (query) {
                if (query === 'my_query_with_redirect') {
                    return {
                        getLocation: () => {
                            return 'https://www.rhino-inquisitor.com';
                        }
                    };
                }

                return null;
            }
        };
    },
    'dw/catalog/ProductMgr': {
        getProduct: function (sku) {
            if (sku === 'existing_sku_no_pricebook') {
                return {
                    ID: 'existing_sku_no_pricebook',
                    priceModel: {
                        price: {
                            value: 100,
                            currency: 'EUR'
                        }
                    },
                    variationModel: {
                        master: null
                    }
                };
            }

            if (sku === 'existing_sku_no_priceinfo') {
                return {
                    ID: 'existing_sku_no_priceinfo',
                    priceModel: null,
                    variationModel: {
                        master: null
                    }
                };
            }

            if (sku === 'existing_sku_with_pricebook') {
                return {
                    ID: 'existing_sku_with_pricebook',
                    priceModel: {
                        getPriceBookPrice: () => {
                            return {
                                value: 25,
                                currency: 'EUR'
                            };
                        },
                        price: {
                            value: 100,
                            currency: 'EUR'
                        },
                        priceInfo: {
                            priceBook: {
                                ID: 'activePricebookId',
                                parentPriceBook: {
                                    ID: 'parentPriceBookId'
                                }
                            }
                        }
                    },
                    variationModel: {
                        master: null
                    }
                };
            }

            return null;
        }
    },
    'dw/campaign/PromotionMgr': {
        getActiveCustomerPromotions: function () {
            return {
                getProductPromotions: function (product) {
                    if (product.ID === 'existing_sku_no_pricebook') {
                        return {
                            iterator: function () {
                                return {
                                    promotions: [
                                        {
                                            ID: 'promo_id',
                                            name: 'my_promotion',
                                            calloutMsg: 'promo message',
                                            details: 'details',
                                            image: {
                                                absURL: 'http://image.jpg'
                                            },
                                            getPromotionalPrice: () => {
                                                return {
                                                    value: 50,
                                                    currencyCode: 'EUR'
                                                };
                                            }
                                        }
                                    ],
                                    next: function () {
                                        return this.promotions.shift();
                                    },
                                    hasNext: function () {
                                        return this.promotions.length > 0;
                                    }
                                };
                            }
                        };
                    }

                    return {
                        iterator: function () {
                            return {
                                hasNext: () => false
                            };
                        }
                    };
                }
            };
        }
    }
});

describe('createExtendedProduct', function () {
    before(() => {
        global.request = {
            locale: 'nl_BE'
        };

        global.empty = function (value) {
            return value === null || value === undefined || value.length === 0;
        };
    });

    it('should return price and master product information when a valid product is passed with no pricebook info', function () {
        const result = productSearchHelper.createExtendedProduct('existing_sku_no_pricebook');

        assert.deepEqual(result, {
            'id': 'existing_sku_no_pricebook',
            'masterProductId': 'existing_sku_no_pricebook',
            'priceInfo': {
                'originalPrice': {
                    'value': 100
                },
                'promotionPrice': {
                    'currency': 'EUR',
                    'promoDetails': {
                        'callOut': 'promo message',
                        'details': 'details',
                        'id': 'promo_id',
                        'image': 'http://image.jpg',
                        'name': 'my_promotion'
                    },
                    'value': 50
                },
                'salePrice': {
                    'value': 100
                }
            }
        });
    });

    it('should return price and master product information when a valid product is passed with pricebook info', function () {
        const result = productSearchHelper.createExtendedProduct('existing_sku_with_pricebook');

        assert.deepEqual(result, {
            'id': 'existing_sku_with_pricebook',
            'masterProductId': 'existing_sku_with_pricebook',
            'priceInfo': {
                'originalPrice': {
                    'pricebook': 'parentPriceBookId',
                    'value': 25
                },
                'salePrice': {
                    'pricebook': 'activePricebookId',
                    'value': 100
                }
            }
        });
    });

    it('should return no price and master product information when a valid product is passed with no priceInfo info', function () {
        const result = productSearchHelper.createExtendedProduct('existing_sku_no_priceinfo');

        assert.deepEqual(result, {});
    });

    it('should return no price and master product information when the product does not exist', function () {
        const result = productSearchHelper.createExtendedProduct('non_existing_sku');
        assert.isNull(result);
    });
});

describe('getSearchRedirectInformation', function () {
    before(() => {
        global.request = {
            locale: 'nl_BE'
        };
    });

    it('should return the search redirect information', function () {
        const result = productSearchHelper.getSearchRedirectInformation('my_query_with_redirect');

        assert.equal(result, 'https://www.rhino-inquisitor.com');
    });

    it('It should return null if there is no search redirect configured for the given query', function () {
        const result = productSearchHelper.getSearchRedirectInformation('my_query_without_redirect');

        assert.isNull(result);
    });

    it('It should return null if no query is passed', function () {
        const result = productSearchHelper.getSearchRedirectInformation();

        assert.isNull(result);
    });
});

describe('getSearchMetaData', function () {
    it('should return a list of tags', function () {
        const result = productSearchHelper.getSearchMetaData('test');

        assert.deepEqual(result, [
            {
                'ID': 'id',
                'content': 'content',
                'name': false,
                'property': true,
                'title': false
            }
        ]);
    });

    it('should return null if no query is passed', function () {
        const result = productSearchHelper.getSearchMetaData();

        assert.isNull(result);
    });
});
