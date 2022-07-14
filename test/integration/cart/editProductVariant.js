var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Edit product variant', function () {
    this.timeout(45000);

    var variantPid1 = '701643421084M';   // 3/4 Sleeve V-Neck Top: icy mint, XS
    var qty1 = 1;
    var variantPid2 = '793775362380M';   // Striped Silk Tie: red, 29.99
    var qty2 = 1;

    var newQty1;

    var prodIdUuidMap = {};
    var variantUuid1;
    var variantUuid2;

    var cookieJar = request.jar();
    var myRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var cookieString;

    before(function () {
        // ----- adding product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
            .then(function () {
                cookieString = cookieJar.getCookieString(myRequest.url);
            })

            // ----- adding product #2
            .then(function () {
                myRequest.url = config.baseUrl + '/Cart-AddProduct';
                myRequest.form = {
                    pid: variantPid2,
                    quantity: qty2
                };

                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);

                return request(myRequest);
            })

            // ----- select a shipping method. Need to have shipping method so that shipping cost, sales tax,
            //       and grand total can be calculated
            .then(function () {
                var shipMethodId = '001';   // 001 = Ground

                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;
                return request(myRequest);
            })

            // ----- Get UUID for each product line items
            .then(function (response4) {
                var bodyAsJson = JSON.parse(response4.body);

                prodIdUuidMap[bodyAsJson.items[0].id] = bodyAsJson.items[0].UUID;
                prodIdUuidMap[bodyAsJson.items[1].id] = bodyAsJson.items[1].UUID;

                variantUuid1 = prodIdUuidMap[variantPid1];
                variantUuid2 = prodIdUuidMap[variantPid2];
            });
    });

    it('should update product line item 1 with the new variant and quantity', function () {
        // edit attributes of product variant 1

        newQty1 = 3;
        var newTotalQty = newQty1 + qty2;
        var expectQty1 = newQty1;
        var expectQty2 = qty2;

        var newVariantPid1 = '701642923541M';   // 3/4 Sleeve V-Neck Top: Grey Heather, S

        var expectedUpdateRep = {
            'action': 'Cart-EditProductLineItem',
            'cartModel': {
                'totals': {
                    'subTotal': '$101.99',
                    'grandTotal': '$115.48',
                    'totalTax': '$5.50',
                    'totalShippingCost': '$7.99'
                },
                'items': [
                    {
                        'id': newVariantPid1,
                        'productName': '3/4 Sleeve V-Neck Top',
                        'price': {
                            'sales': {
                                'currency': 'USD',
                                'value': 24,
                                'formatted': '$24.00',
                                'decimalPrice': '24.00'
                            }
                        },
                        'images': {
                            'small': [
                                {
                                    'alt': '3/4 Sleeve V-Neck Top, Grey Heather, small',
                                    'title': '3/4 Sleeve V-Neck Top, Grey Heather'
                                }
                            ]
                        },
                        'variationAttributes': [
                            {
                                'displayName': 'Color',
                                'displayValue': 'Grey Heather',
                                'attributeId': 'color'
                            },
                            {
                                'displayName': 'Size',
                                'displayValue': 'S',
                                'attributeId': 'size'
                            }
                        ],
                        'availability': {
                            'messages': [
                                'In Stock'
                            ],
                            'inStockDate': null
                        },
                        'UUID': variantUuid1,
                        'quantity': expectQty1,
                        'priceTotal': {
                            'price': '$72.00'
                        }
                    },
                    {
                        'id': variantPid2,
                        'productName': 'Striped Silk Tie',
                        'price': {
                            'list': {
                                'currency': 'USD',
                                'value': 39.5,
                                'formatted': '$39.50',
                                'decimalPrice': '39.50'
                            },
                            'sales': {
                                'currency': 'USD',
                                'value': 29.99,
                                'formatted': '$29.99',
                                'decimalPrice': '29.99'
                            }
                        },
                        'images': {
                            'small': [
                                {
                                    'alt': 'Striped Silk Tie, Red, small',
                                    'title': 'Striped Silk Tie, Red'
                                }
                            ]
                        },
                        'variationAttributes': [
                            {
                                'displayName': 'Color',
                                'displayValue': 'Red',
                                'attributeId': 'color'
                            }
                        ],
                        'availability': {
                            'messages': [
                                'In Stock'
                            ],
                            'inStockDate': null
                        },
                        'UUID': variantUuid2,
                        'quantity': expectQty2
                    }
                ],
                'numItems': newTotalQty,
                'locale': 'en_US',
                'resources': {
                    'numberOfItems': newTotalQty + ' Items',
                    'emptyCartMsg': 'Your Shopping Cart is Empty'
                }
            },
            'newProductId': newVariantPid1
        };

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-EditProductLineItem';
        myRequest.form = {
            uuid: variantUuid1,
            pid: newVariantPid1,
            quantity: newQty1
        };

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(updateRsp.body);

                assert.containSubset(bodyAsJson.cartModel.totals, expectedUpdateRep.cartModel.totals);
                assert.equal(bodyAsJson.cartModel.items.length, expectedUpdateRep.cartModel.items.length);
                assert.containSubset(bodyAsJson.cartModel.items, expectedUpdateRep.cartModel.items);
                assert.equal(bodyAsJson.cartModel.numItems, expectedUpdateRep.cartModel.numItems);
                assert.containSubset(bodyAsJson.cartModel.resources, expectedUpdateRep.cartModel.resources);

                // Verify path to image source
                var prodImageSrc1 = bodyAsJson.cartModel.items[0].images.small[0].url;
                var prodImageSrc2 = bodyAsJson.cartModel.items[1].images.small[0].url;
                assert.isTrue(prodImageSrc1.endsWith('/images/small/PG.10221714.JJ908XX.PZ.jpg'));
                assert.isTrue(prodImageSrc2.endsWith('/images/small/PG.949114314S.REDSI.PZ.jpg'));

                assert.equal(bodyAsJson.newProductId, expectedUpdateRep.newProductId);
            });
    });

    // notice the product line 1 has been updated in the above test
    it('should update product line item 2 with new price', function () {
        // edit product variant 2 to have different price variant

        var expectQty2 = qty2;

        var newVariantPid2 = '793775370033M';   // Striped Silk Tie: Turquoise, 23.99

        var expectedUpdateRep = {
            'action': 'Cart-EditProductLineItem',
            'cartModel': {
                'items': [
                    {
                        'id': newVariantPid2,
                        'productName': 'Striped Silk Tie',
                        'price': {
                            'list': {
                                'currency': 'USD',
                                'value': 39.5,
                                'formatted': '$39.50',
                                'decimalPrice': '39.50'
                            },
                            'sales': {
                                'currency': 'USD',
                                'value': 23.99,
                                'formatted': '$23.99',
                                'decimalPrice': '23.99'
                            }
                        },
                        'images': {
                            'small': [
                                {
                                    'alt': 'Striped Silk Tie, Turquoise, small',
                                    'title': 'Striped Silk Tie, Turquoise'
                                }
                            ]
                        },
                        'variationAttributes': [
                            {
                                'displayName': 'Color',
                                'displayValue': 'Turquoise',
                                'attributeId': 'color'
                            }
                        ],
                        'UUID': variantUuid2,
                        'quantity': expectQty2,
                        'appliedPromotions': [
                            {
                                'callOutMsg': 'Get 20% off of this tie.'
                            }
                        ]
                    }
                ]
            },
            'newProductId': newVariantPid2
        };

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-EditProductLineItem';
        myRequest.form = {
            uuid: variantUuid2,
            pid: newVariantPid2,
            quantity: qty2
        };

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(updateRsp.body);

                assert.containSubset(bodyAsJson.cartModel.items, expectedUpdateRep.cartModel.items);
                assert.equal(bodyAsJson.newProductId, expectedUpdateRep.newProductId);
            });
    });
});

