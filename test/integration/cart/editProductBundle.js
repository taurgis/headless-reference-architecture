var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Edit product bundle', function () {
    this.timeout(45000);

    var variantPid1 = 'womens-jewelry-bundleM';   // womens jewelry bundle
    var qty1 = 1;

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

    before(function () {
        // ----- adding product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
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

                variantUuid1 = prodIdUuidMap[variantPid1];
            });
    });

    it('should update the bundle quantity', function () {
        newQty1 = 3;
        var newTotalQty = newQty1;
        var expectQty1 = newQty1;


        var expectedUpdateRep = {
            'action': 'Cart-EditProductLineItem',
            'cartModel': {
                'totals': {
                    'subTotal': '$339.00',
                    'grandTotal': '$397.94',
                    'totalTax': '$18.95',
                    'totalShippingCost': '$39.99'
                },
                'items': [
                    {
                        'id': variantPid1,
                        'productName': 'Turquoise Jewelry Bundle',
                        'productType': 'bundle',
                        'price': {
                            'sales': {
                                'currency': 'USD',
                                'value': 113,
                                'formatted': '$113.00',
                                'decimalPrice': '113.00'
                            },
                            'list': null
                        },
                        'availability': {
                            'messages': [
                                'In Stock'
                            ],
                            'inStockDate': null
                        },
                        'available': true,
                        'UUID': variantUuid1,
                        'quantity': expectQty1,
                        'priceTotal': {
                            'price': '$339.00'
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
            'newProductId': variantPid1
        };

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-EditProductLineItem';
        myRequest.form = {
            uuid: variantUuid1,
            pid: variantPid1,
            quantity: newQty1
        };

        return request(myRequest)
            .then(function (updateRsp) {
                assert.equal(updateRsp.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(updateRsp.body);

                assert.containSubset(bodyAsJson.cartModel.totals, expectedUpdateRep.cartModel.totals);
                assert.containSubset(bodyAsJson.cartModel.items, expectedUpdateRep.cartModel.items);
                assert.equal(bodyAsJson.cartModel.numItems, expectedUpdateRep.cartModel.numItems);
                assert.containSubset(bodyAsJson.cartModel.resources, expectedUpdateRep.cartModel.resources);
            });
    });
});
