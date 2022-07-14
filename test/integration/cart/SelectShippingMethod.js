var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Cart: Selecting Shipping Methods', function () {
    this.timeout(5000);

    var variantPid1 = '740357440196M';
    var qty1 = '1';
    var variantPid2 = '013742335538M';
    var qty2 = '1';

    var cookieJar = request.jar();
    var myRequest = {
        url: '',
        method: 'POST',
        form: {},
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var cookieString;

    var expectedResponseCommon = {
        'action': 'Cart-SelectShippingMethod',
        'numOfShipments': 1,
        'shipments': [
            {
                'shippingMethods': [
                    {
                        'description': 'Order received within 7-10 business days',
                        'displayName': 'Ground',
                        'ID': '001',
                        'shippingCost': '$7.99',
                        'estimatedArrivalTime': '7-10 Business Days'
                    },
                    {
                        'description': 'Order received in 2 business days',
                        'displayName': '2-Day Express',
                        'ID': '002',
                        'shippingCost': '$11.99',
                        'estimatedArrivalTime': '2 Business Days'
                    },
                    {
                        'description': 'Order received the next business day',
                        'displayName': 'Overnight',
                        'ID': '003',
                        'shippingCost': '$19.99',
                        'estimatedArrivalTime': 'Next Day'
                    },
                    {
                        'description': 'Orders shipped outside continental US received in 2-3 business days',
                        'displayName': 'Express',
                        'ID': '012',
                        'shippingCost': '$22.99',
                        'estimatedArrivalTime': '2-3 Business Days'
                    },
                    {
                        'description': 'Order shipped by USPS received within 7-10 business days',
                        'displayName': 'USPS',
                        'ID': '021',
                        'shippingCost': '$7.99',
                        'estimatedArrivalTime': '7-10 Business Days'
                    }
                ]
            }
        ]
    };

    before(function () {
        // ----- adding product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            childProducts: [],
            quantity: qty1
        };

        return request(myRequest)
            .then(function () {
                cookieString = cookieJar.getCookieString(myRequest.url);
            })

            // ----- adding product #2, a different variant of same product 1:
            .then(function () {
                myRequest.form = {
                    pid: variantPid2,
                    childProducts: [],
                    quantity: qty2
                };

                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);

                return request(myRequest);
            });
    });

    it(' 1>. should set the shipping method to Overnight', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$166.94',
            'totalTax': '$7.95',
            'totalShippingCost': '$19.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '003';   // 003 = Overnight

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson, expectedResponseCommon, 'Actual response not as expected.');
                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 2>. should set the shipping method to Ground', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$164.84',
            'totalTax': '$7.85',
            'totalShippingCost': '$17.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '001';   // 001 = Ground

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 3>. should set the shipping method to 2-Day Express', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$158.54',
            'totalTax': '$7.55',
            'totalShippingCost': '$11.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '002';   // 002 = 2-Day Express

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals, 'Actual response not as expected.');
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 4>. should set to default method Ground when shipping method is set to Store Pickup', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$145.95',
            'totalTax': '$6.95',
            'totalShippingCost': '$0.00',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '005';   // 005 = Store Pickup

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 5>. should set the shipping method to Express', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$170.09',
            'totalTax': '$8.10',
            'totalShippingCost': '$22.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '012';   // 012 = Express

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 6>. should set the shipping method to USPS', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$154.34',
            'totalTax': '$7.35',
            'totalShippingCost': '$7.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '021';   // 021 = USPS

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, shipMethodId);
            });
    });

    it(' 7>. should default to default shipping method for method with excluded Products', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$164.84',
            'totalTax': '$7.85',
            'totalShippingCost': '$17.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '004';   // 004 = Super Saver, has excluded Products
        var groundShipMethodId = '001';

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, groundShipMethodId);
            });
    });

    it(' 8>. should default to default shipping method for non-exist method', function () {
        var expectTotals = {
            'subTotal': '$139.00',
            'grandTotal': '$164.84',
            'totalTax': '$7.85',
            'totalShippingCost': '$17.99',
            'orderLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'shippingLevelDiscountTotal': {
                'formatted': '$0.00',
                'value': 0
            },
            'discounts': [],
            'discountsHtml': '\n'
        };

        var shipMethodId = '9999';
        var groundShipMethodId = '001';

        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);

                assert.containSubset(bodyAsJson.totals, expectTotals);
                assert.equal(bodyAsJson.shipments[0].selectedShippingMethod, groundShipMethodId);
            });
    });
});
