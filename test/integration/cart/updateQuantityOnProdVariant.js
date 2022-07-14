var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var jsonHelpers = require('../helpers/jsonUtils');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Update quantity for product variant', function () {
    this.timeout(45000);

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
                prodIdUuidMap[bodyAsJson.items[2].id] = bodyAsJson.items[2].UUID;
            });
    });

    it('1. should update line item quantity', function () {
        // updating quantity of poduct variant 2

        var newQty2 = 5;
        var newTotal = qty1 + newQty2 + qty3;
        var expectQty1 = qty1;
        var expectQty2 = newQty2;
        var expectQty3 = qty3;

        var variantUuid1 = prodIdUuidMap[variantPid1];
        var variantUuid2 = prodIdUuidMap[variantPid2];
        var variantUuid3 = prodIdUuidMap[variantPid3];

        var expectedUpdateRep = {
            'action': 'Cart-UpdateQuantity',
            'totals': {
                'subTotal': '$257.97',
                'grandTotal': '$281.36',
                'totalTax': '$13.40',
                'totalShippingCost': '$9.99'
            },
            'items': [
                {
                    'id': variantPid1,
                    'productName': '3/4 Sleeve V-Neck Top',
                    'price': {
                        'sales': {
                            'currency': 'USD',
                            'value': 24
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
                    'UUID': variantUuid1,
                    'quantity': expectQty1
                },
                {
                    'id': variantPid2,
                    'productName': '3/4 Sleeve V-Neck Top',
                    'price': {
                        'sales': {
                            'currency': 'USD',
                            'value': 24
                        }
                    },
                    'variationAttributes': [
                        {
                            'displayName': 'Color',
                            'displayValue': 'Butter'
                        },
                        {
                            'displayName': 'Size',
                            'displayValue': 'M'
                        }
                    ],
                    'UUID': variantUuid2,
                    'quantity': expectQty2
                },
                {
                    'id': variantPid3,
                    'productName': 'Solid Silk Tie',
                    'price': {
                        'list': {
                            'currency': 'USD',
                            'value': 39.5
                        },
                        'sales': {
                            'currency': 'USD',
                            'value': 29.99
                        }
                    },
                    'variationAttributes': [
                        {
                            'displayName': 'Color',
                            'displayValue': 'Red'
                        }
                    ],
                    'UUID': variantUuid3,
                    'quantity': expectQty3
                }
            ],
            'numItems': newTotal,
            'locale': 'en_US',
            'resources': {
                'numberOfItems': newTotal + ' Items',
                'emptyCartMsg': 'Your Shopping Cart is Empty'
            }
        };

        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-UpdateQuantity?pid=' + variantPid2 + '&uuid=' + variantUuid2 + '&quantity=' + newQty2;

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = jsonHelpers.deleteProperties(JSON.parse(updateRsp.body), ['queryString']);

                assert.containSubset(bodyAsJson, expectedUpdateRep, 'Actual response does not contain expectedUpdateRep.');

                // Verify path to image source
                var prodImageSrc1 = bodyAsJson.items[0].images.small[0].url;
                var prodImageSrc2 = bodyAsJson.items[1].images.small[0].url;
                var prodImageSrc3 = bodyAsJson.items[2].images.small[0].url;
                assert.isTrue(prodImageSrc1.endsWith('/images/small/PG.10221714.JJ8UTXX.PZ.jpg'), 'product 1 item image: src not end with /images/small/PG.10221714.JJ8UTXX.PZ.jpg.');
                assert.isTrue(prodImageSrc2.endsWith('/images/small/PG.10221714.JJ370XX.PZ.jpg'), 'product 2 item image: src not end with /images/small/PG.10221714.JJ370XX.PZ.jpg.');
                assert.isTrue(prodImageSrc3.endsWith('/images/small/PG.949432114S.REDSI.PZ.jpg'), 'product 3 item image: src not end with /images/small/PG.949432114S.REDSI.PZ.jpg.');
            });
    });

    it('2. should return error if update line item quantity is 0', function () {
        var variantUuid1 = prodIdUuidMap[variantPid1];

        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-UpdateQuantity?pid=' + variantPid1 + '&uuid=' + variantUuid1 + '&quantity=0';

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 500, 'Expected request to fail for quantity = 0.');
            })
            .catch(function (err) {
                assert.equal(err.statusCode, 500, 'Expected statusCode to be 500 for 0 quantity.');
            });
    });

    it('3. should return error if update line item quantity is negative', function () {
        var variantUuid1 = prodIdUuidMap[variantPid1];

        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-UpdateQuantity?pid=' + variantPid1 + '&uuid=' + variantUuid1 + '&quantity=-1';

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 500, 'Expected request to fail for negative quantity.');
            })
            .catch(function (err) {
                assert.equal(err.statusCode, 500, 'Expected statusCode to be 500 for 0 quantity.');
            });
    });
});
