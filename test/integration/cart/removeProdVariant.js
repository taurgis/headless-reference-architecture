var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Remove product variant from line item', function () {
    this.timeout(50000);

    var variantPid1 = '701643421084M';
    var qty1 = 2;
    var variantPid2 = '701642923459M';
    var qty2 = 1;
    var variantPid3 = '029407331258M';
    var qty3 = 3;

    var prodIdUuidMap = {};

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

            // ----- adding product #2, a different variant of same product 1:
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

            // ----- adding product #3:
            .then(function () {
                myRequest.url = config.baseUrl + '/Cart-AddProduct';
                myRequest.form = {
                    pid: variantPid3,
                    quantity: qty3
                };
                return request(myRequest);
            })

            // ----- select a shipping method. Need shipping method so that shipping cost, sales tax,
            //       and grand total can be calculated.
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
                prodIdUuidMap[bodyAsJson.items[2].id] = bodyAsJson.items[2].UUID;
            });
    });

    it(' 1>. should remove line item', function () {
        // removing product variant on line item 2

        var variantUuid2 = prodIdUuidMap[variantPid2];
        var expectedItems = {
            'totals': {
                'subTotal': '$137.97',
                'totalShippingCost': '$7.99',
                'grandTotal': '$153.26',
                'totalTax': '$7.30'
            },
            'shipments': [
                {
                    'shippingMethods': [
                        {
                            'ID': '001',
                            'displayName': 'Ground',
                            'shippingCost': '$7.99',
                            'selected': true
                        }
                    ],
                    'selectedShippingMethod': '001'
                }
            ],
            'items': [
                {
                    'productName': '3/4 Sleeve V-Neck Top',
                    'price': {
                        'sales': {
                            'value': 24,
                            'currency': 'USD'
                        }
                    },
                    'variationAttributes': [
                        {
                            'displayName': 'Color',
                            'displayValue': 'Icy Mint'
                        },
                        {
                            'displayName': 'Size',
                            'displayValue': 'XS'
                        }
                    ],
                    'quantity': 2
                },
                {
                    'productName': 'Solid Silk Tie',
                    'price': {
                        'sales': {
                            'value': 29.99,
                            'currency': 'USD'
                        },
                        'list': {
                            'value': 39.5,
                            'currency': 'USD'
                        }
                    },
                    'variationAttributes': [
                        {
                            'displayName': 'Color',
                            'displayValue': 'Red'
                        }
                    ],
                    'quantity': 3
                }
            ]

        };

        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + variantPid2 + '&uuid=' + variantUuid2;

        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(removedItemResponse.body);
                assert.containSubset(bodyAsJson.basket, expectedItems, 'Actual response dose not contain expected expectedResponse.');

                // Verify path to image source
                var prodImageSrc1 = bodyAsJson.basket.items[0].images.small[0].url;
                var prodImageSrc2 = bodyAsJson.basket.items[1].images.small[0].url;
                assert.isTrue(prodImageSrc1.endsWith('/images/small/PG.10221714.JJ8UTXX.PZ.jpg'), 'product 1 item image: src not end with /images/small/PG.10221714.JJ8UTXX.PZ.jpg.');
                assert.isTrue(prodImageSrc2.endsWith('/images/small/PG.949432114S.REDSI.PZ.jpg'), 'product 2 item image: src not end with /images/small/PG.949432114S.REDSI.PZ.jpg.');
            });
    });


    it(' 2>. should return error if PID and UUID does not match', function () {
        var variantUuid3 = prodIdUuidMap[variantPid3];

        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + variantPid1 + '&uuid=' + variantUuid3;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 500, 'Expected request to fail when PID and UUID do not match.');
            })
            .catch(function (err) {
                assert.equal(err.statusCode, 500, 'Expected statusCode to be 500 for removing product item with non-matching PID and UUID.');

                var bodyAsJson = JSON.parse(err.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message from removing  product item with non-matching PID and UUID  not as expected');
            });
    });

    it(' 3>. should remove all line items', function () {
        var expectedRemoveAllResp = {
            'totals': {
                'subTotal': '$0.00',
                'grandTotal': '$0.00',
                'totalTax': '$0.00',
                'totalShippingCost': '$0.00'
            },
            'shipments': [
                {
                    'selectedShippingMethod': '001',
                    'shippingMethods': [
                        {
                            'description': 'Order received within 7-10 business days',
                            'displayName': 'Ground',
                            'ID': '001',
                            'shippingCost': '$0.00',
                            'estimatedArrivalTime': '7-10 Business Days',
                            'default': true,
                            'selected': true
                        }
                    ]
                }
            ],
            'numItems': 0,
            'resources': {
                'numberOfItems': '0 Items',
                'emptyCartMsg': 'Your Shopping Cart is Empty'
            }
        };

        var variantUuid1 = prodIdUuidMap[variantPid1];
        var variantUuid3 = prodIdUuidMap[variantPid3];

        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + variantPid1 + '&uuid=' + variantUuid1;

        return request(myRequest)
            .then(function () {
                myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + variantPid3 + '&uuid=' + variantUuid3;
                return request(myRequest);
            })

            // Handle response
            .then(function (response2) {
                assert.equal(response2.statusCode, 200, 'Expected statusCode from remove all product line item to be 200.');

                var bodyAsJson2 = JSON.parse(response2.body);
                assert.containSubset(bodyAsJson2.basket, expectedRemoveAllResp, 'Actual response from removing all items does not contain expectedRemoveAllResp.');
            });
    });

    it(' 4>. should return error if product does not exist in cart', function () {
        var variantPidNotExist = '701643421084Mabc';
        var variantUuidNotExist = '529f59ef63a0d238b8575c4f8fabc';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + variantPidNotExist + '&uuid=' + variantUuidNotExist;

        return request(myRequest)
            .then(function (response3) {
                assert.equal(response3.statusCode, 500, 'Expected request to fail when product does not exist.');
            })
            .catch(function (err) {
                assert.equal(err.statusCode, 500, 'Expected statusCode to be 500 for removing product item not in cart.');

                var bodyAsJson = JSON.parse(err.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message of removing non-existing product item not as expected');
            });
    });
});
