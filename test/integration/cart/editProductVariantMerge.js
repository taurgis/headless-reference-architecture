var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Edit product variant for merging products', function () {
    this.timeout(45000);

    var variantPid1 = '701643421084M';   // 3/4 Sleeve V-Neck Top: icy mint, XS
    var qty1 = 1;
    var variantPid2 = '701643421060M';   // 3/4 Sleeve V-Neck Top: yellow, XS
    var qty2 = 1;

    var newQty1;

    var prodIdUuidMap = {};
    var variantUuid1;

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
            });
    });

    it('should merge product line items into 1 with the new variant and quantity value', function () {
        // edit attributes of product variant 1

        newQty1 = 4;
        var newTotalQty = newQty1 + qty2;

        var newVariantPid1 = '701643421060M';   // 3/4 Sleeve V-Neck Top: Yellow, S

        var expectedUpdateRep = {
            'action': 'Cart-EditProductLineItem',
            'cartModel': {
                'totals': {
                    'subTotal': '$120.00',
                    'grandTotal': '$134.39',
                    'totalTax': '$6.40',
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
                                    'alt': '3/4 Sleeve V-Neck Top, Butter, small',
                                    'title': '3/4 Sleeve V-Neck Top, Butter',
                                    'url': '/on/demandware.static/-/Sites-apparel-m-catalog/default/dwdd28bd60/images/small/PG.10221714.JJ370XX.PZ.jpg'
                                }
                            ]
                        },
                        'variationAttributes': [
                            {
                                'displayName': 'Color',
                                'displayValue': 'Butter',
                                'attributeId': 'color'
                            },
                            {
                                'displayName': 'Size',
                                'displayValue': 'XS',
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
                        'quantity': 5,
                        'priceTotal': {
                            'price': '$120.00'
                        }
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
                assert.equal(bodyAsJson.cartModel.items[0].id, variantPid2);
                assert.equal(bodyAsJson.cartModel.items[0].productName, '3/4 Sleeve V-Neck Top');
                assert.equal(bodyAsJson.cartModel.items[0].productType, 'variant');

                // Verify path to image source
                var prodImageSrc1 = bodyAsJson.cartModel.items[0].images.small[0].url;
                assert.isTrue(prodImageSrc1.endsWith('/images/small/PG.10221714.JJ370XX.PZ.jpg'));
                assert.equal(bodyAsJson.newProductId, expectedUpdateRep.newProductId);
            });
    });
});

