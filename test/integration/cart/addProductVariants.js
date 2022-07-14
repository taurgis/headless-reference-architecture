var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Add Product variants to cart', function () {
    this.timeout(5000);

    it('should add variants of different and same products, returns total quantity of added items', function () {
        var cookieJar = request.jar();

        // The myRequest object will be reused through out this file. The 'jar' property will be set once.
        // The 'url' property will be updated on every request to set the product ID (pid) and quantity.
        // All other properties remained unchanged.
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

        var totalQty;

        var variantPid1 = '701643421084M';
        var qty1 = 2;
        var variantPid2 = '701642923459M';
        var qty2 = 1;
        var variantPid3 = '013742000252M';
        var qty3 = 11;
        var variantPid4 = '029407331258M';
        var qty4 = 3;

        var action = 'Cart-AddProduct';
        var message = 'Product added to cart';
        var addProd = '/Cart-AddProduct';

        // ----- adding product #1:
        totalQty = qty1;
        myRequest.url = config.baseUrl + addProd;
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var expectedResBody = {
                    'quantityTotal': totalQty,
                    'action': action,
                    'message': message
                };

                var bodyAsJson = JSON.parse(response.body);
                assert.equal(bodyAsJson.quantityTotal, expectedResBody.quantityTotal);

                cookieString = cookieJar.getCookieString(myRequest.url);
            })

            // ----- adding product #2, a different variant of same product 1:
            .then(function () {
                totalQty += qty2;
                myRequest.url = config.baseUrl + addProd;
                myRequest.form = {
                    pid: variantPid2,
                    quantity: qty2
                };

                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);

                return request(myRequest);
            })

            // Handle response from request #2
            .then(function (response2) {
                assert.equal(response2.statusCode, 200);

                var expectedResBody2 = {
                    'action': action,
                    'quantityTotal': totalQty,
                    'message': message

                };

                var bodyAsJson2 = JSON.parse(response2.body);
                assert.equal(bodyAsJson2.quantityTotal, expectedResBody2.quantityTotal);
            })

            // ----- adding product #3:
            .then(function () {
                totalQty += qty3;
                myRequest.url = config.baseUrl + addProd;
                myRequest.form = {
                    pid: variantPid3,
                    quantity: qty3
                };
                return request(myRequest);
            })

            // Handle response from request #3
            .then(function (response3) {
                assert.equal(response3.statusCode, 200);

                var expectedResBody3 = {
                    'action': action,
                    'quantityTotal': totalQty,
                    'message': message
                };

                var bodyAsJson3 = JSON.parse(response3.body);
                assert.equal(bodyAsJson3.quantityTotal, expectedResBody3.quantityTotal);
            })

            // ----- adding product #4:
            .then(function () {
                totalQty += qty4;
                myRequest.url = config.baseUrl + addProd;
                myRequest.form = {
                    pid: variantPid4,
                    quantity: qty4
                };
                return request(myRequest);
            })

            // Handle response from request #4
            .then(function (response4) {
                assert.equal(response4.statusCode, 200);

                var bodyAsJson = JSON.parse(response4.body);
                var expectedTotal = {
                    'subTotal': '$381.97',
                    'grandTotal': '$527.06',
                    'totalTax': '$25.10',
                    'totalShippingCost': '$119.99'
                };

                var expectedShippingMethod = {
                    'selectedShippingMethod': '001',
                    'shippingMethods': [
                        {
                            'displayName': 'Ground',
                            'ID': '001',
                            'estimatedArrivalTime': '7-10 Business Days',
                            'default': true,
                            'selected': true,
                            'shippingCost': '$9.99'
                        }
                    ]
                };

                var expectedItems0 = {
                    'id': variantPid1,
                    'price': {
                        'sales': {
                            'currency': 'USD',
                            'value': 24
                        }
                    },
                    'productType': 'variant',
                    'variationAttributes': [
                        {
                            'attributeId': 'color',
                            'id': 'color'
                        },
                        {
                            'attributeId': 'size',
                            'id': 'size'
                        }
                    ],
                    'quantity': qty1
                };

                var expectedItems1 = {
                    'id': variantPid2,
                    'price': {
                        'sales': {
                            'currency': 'USD',
                            'value': 24
                        }
                    },
                    'productType': 'variant',
                    'variationAttributes': [
                        {
                            'attributeId': 'color',
                            'id': 'color'
                        },
                        {
                            'attributeId': 'size',
                            'id': 'size'
                        }
                    ],
                    'quantity': qty2
                };

                var expectedItems2 = {
                    'id': variantPid3,
                    'price': {
                        'sales': {
                            'currency': 'USD',
                            'value': 20
                        }
                    },
                    'productType': 'variant',
                    'variationAttributes': [
                        {
                            'attributeId': 'color',
                            'id': 'color'
                        }
                    ],
                    'quantity': qty3
                };

                var expectedItems3 = {
                    'id': variantPid4,
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
                    'productType': 'variant',
                    'variationAttributes': [
                        {
                            'attributeId': 'color',
                            'id': 'color'
                        }
                    ],
                    'quantity': qty4
                };

                // ----- Verify quantityTotal, message, action
                assert.equal(bodyAsJson.quantityTotal, totalQty);
                assert.equal(bodyAsJson.message, message);
                assert.equal(bodyAsJson.action, action);

                // ----- Verify totals
                assert.containSubset(bodyAsJson.cart.totals, expectedTotal);

                // ----- Verify Shipments
                assert.containSubset(bodyAsJson.cart.shipments[0], expectedShippingMethod);

                // ----- Verify product line items in cart
                assert.lengthOf(bodyAsJson.cart.items, 4);

                // ----- Verify Product id, quantity and name in Cart
                assert.containSubset(bodyAsJson.cart.items[0], expectedItems0);
                assert.containSubset(bodyAsJson.cart.items[1], expectedItems1);
                assert.containSubset(bodyAsJson.cart.items[2], expectedItems2);
                assert.containSubset(bodyAsJson.cart.items[3], expectedItems3);
            });
    });
});
