var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var jsonHelpers = require('../helpers/jsonUtils');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

/**
 * Test cases :
 * 1. ProductSurchargeCost : Add Jewelery to cart with MA should show surcharge cost
 * 2. When shipping to AK state, should return 2 applicableShipping methods only
 * 3. When shipping to MA state, should return 4 applicableShipping methods
 * 3. When Cart has over $100 product, shipping cost should be more for the same shipping method as #3 case
 * 4. When State 'State' = 'AA' and 'AE' and 'AP' should output UPS as a shipping method
 */

describe('Select different State in Shipping Form', function () {
    this.timeout(5000);

    describe('productSurchargeCost with below $100 order', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 1;
            var variantPid1 = '013742000443M';
            var cookieString;

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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                .then(function (response) {
                    assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                    cookieString = cookieJar.getCookieString(myRequest.url);
                })
                .then(function () {
                    cookie = request.cookie(cookieString);
                    cookieJar.setCookie(cookie, myRequest.url);
                });
        });

        it('should add surcharge to the Ground Shipping cost for jewelery', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$38.00',
                        'grandTotal': '$56.69',
                        'totalTax': '$2.70',
                        'totalShippingCost': '$15.99',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
                                {
                                    'description': 'Order received within 7-10 business days',
                                    'displayName': 'Ground',
                                    'ID': '001',
                                    'shippingCost': '$5.99',
                                    'estimatedArrivalTime': '7-10 Business Days'
                                },
                                {
                                    'description': 'Order received in 2 business days',
                                    'displayName': '2-Day Express',
                                    'ID': '002',
                                    'shippingCost': '$9.99',
                                    'estimatedArrivalTime': '2 Business Days'
                                },
                                {
                                    'description': 'Order received the next business day',
                                    'displayName': 'Overnight',
                                    'ID': '003',
                                    'shippingCost': '$15.99',
                                    'estimatedArrivalTime': 'Next Day'
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'MA',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '001',
                                'displayName': 'Ground',
                                'description': 'Order received within 7-10 business days',
                                'estimatedArrivalTime': '7-10 Business Days',
                                'shippingCost': '$5.99'
                            }
                        }
                    ]
                }

            };

            var myRequest = {
                url: '',
                method: 'POST',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar
            };
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'MA',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                     var bodyAsJson = JSON.parse(response.body);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });

    describe('productSurchargeCost with over $100 order', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 3;
            var variantPid1 = '013742000443M';
            var cookieString;

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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     cookieString = cookieJar.getCookieString(myRequest.url);
                 })
                 .then(function () {
                     cookie = request.cookie(cookieString);
                     cookieJar.setCookie(cookie, myRequest.url);
                 });
        });

        it('should add surcharge to the Ground Shipping cost for each jewelery item', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$114.00',
                        'grandTotal': '$159.59',
                        'totalTax': '$7.60',
                        'totalShippingCost': '$37.99',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
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
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'MA',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '001',
                                'displayName': 'Ground',
                                'description': 'Order received within 7-10 business days',
                                'estimatedArrivalTime': '7-10 Business Days',
                                'shippingCost': '$7.99'
                            }
                        }
                    ]
                }
            };

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
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'MA',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                     var bodyAsJson = JSON.parse(response.body);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });

    describe('select state=AK in Shipping Form', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 1;
            var variantPid1 = '708141677371M';
            var cookieString;

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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     cookieString = cookieJar.getCookieString(myRequest.url);
                 })
                 .then(function () {
                     cookie = request.cookie(cookieString);
                     cookieJar.setCookie(cookie, myRequest.url);
                 });
        });

        it('should return 1 applicableShippingMethods for AK state', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$49.99',
                        'grandTotal': '$70.33',
                        'totalTax': '$3.35',
                        'totalShippingCost': '$16.99',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
                                {
                                    'description': 'Orders shipped outside continental US received in 2-3 business days',
                                    'displayName': 'Express',
                                    'ID': '012',
                                    'shippingCost': '$16.99',
                                    'estimatedArrivalTime': '2-3 Business Days'
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'AK',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '012',
                                'displayName': 'Express',
                                'description': 'Orders shipped outside continental US received in 2-3 business days',
                                'estimatedArrivalTime': '2-3 Business Days',
                                'shippingCost': '$16.99'
                            }
                        }
                    ]
                }
            };
            var myRequest = {
                url: '',
                method: 'POST',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar
            };
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'AK',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     var bodyAsJson = JSON.parse(response.body);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });

    describe('select state=MA in Shipping Form', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 1;
            var variantPid1 = '708141677371M';
            var cookieString;

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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     cookieString = cookieJar.getCookieString(myRequest.url);
                 })
                 .then(function () {
                     cookie = request.cookie(cookieString);
                     cookieJar.setCookie(cookie, myRequest.url);
                 });
        });

        it('should return 3 applicableShippingMethods for MA state', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$49.99',
                        'grandTotal': '$58.78',
                        'totalTax': '$2.80',
                        'totalShippingCost': '$5.99',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
                                {
                                    'description': 'Order received within 7-10 business days',
                                    'displayName': 'Ground',
                                    'ID': '001',
                                    'shippingCost': '$5.99',
                                    'estimatedArrivalTime': '7-10 Business Days'
                                },
                                {
                                    'description': 'Order received in 2 business days',
                                    'displayName': '2-Day Express',
                                    'ID': '002',
                                    'shippingCost': '$9.99',
                                    'estimatedArrivalTime': '2 Business Days'
                                },
                                {
                                    'description': 'Order received the next business day',
                                    'displayName': 'Overnight',
                                    'ID': '003',
                                    'shippingCost': '$15.99',
                                    'estimatedArrivalTime': 'Next Day'
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'MA',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '001',
                                'displayName': 'Ground',
                                'description': 'Order received within 7-10 business days',
                                'estimatedArrivalTime': '7-10 Business Days',
                                'shippingCost': '$5.99'
                            }
                        }
                    ]
                }
            };
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
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'MA',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     var bodyAsJson = JSON.parse(response.body);
                     // var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'ID']);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });

    describe('select State=MA with more than $100 order in Shipping Form', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 3;
            var variantPid1 = '708141677371M';
            var cookieString;
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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     cookieString = cookieJar.getCookieString(myRequest.url);
                 })
                 .then(function () {
                     cookie = request.cookie(cookieString);
                     cookieJar.setCookie(cookie, myRequest.url);
                 });
        });

        it('shipping cost should be increased for State=MA', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$149.97',
                        'grandTotal': '$165.86',
                        'totalTax': '$7.90',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
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
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'MA',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '001',
                                'displayName': 'Ground',
                                'description': 'Order received within 7-10 business days',
                                'estimatedArrivalTime': '7-10 Business Days',
                                'shippingCost': '$7.99'
                            }
                        }
                    ]
                }
            };
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
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'MA',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     var bodyAsJson = JSON.parse(response.body);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });

    describe('UPS as applicable shipping methods', function () {
        var cookieJar = request.jar();
        var cookie;
        before(function () {
            var qty1 = 1;
            var variantPid1 = '708141677371M';
            var cookieString;

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
            myRequest.url = config.baseUrl + '/Cart-AddProduct';
            myRequest.form = {
                pid: variantPid1,
                quantity: qty1
            };

            return request(myRequest)
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     cookieString = cookieJar.getCookieString(myRequest.url);
                 })
                 .then(function () {
                     cookie = request.cookie(cookieString);
                     cookieJar.setCookie(cookie, myRequest.url);
                 });
        });

        it('should include UPS as an applicable shipping methods for AP state', function () {
            var ExpectedResBody = {
                'order': {
                    'totals': {
                        'subTotal': '$49.99',
                        'grandTotal': '$58.78',
                        'totalTax': '$2.80',
                        'totalShippingCost': '$5.99',
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
                    },
                    'shipping': [
                        {
                            'applicableShippingMethods': [
                                {
                                    'description': 'Order shipped by USPS received within 7-10 business days',
                                    'displayName': 'USPS',
                                    'ID': '021',
                                    'shippingCost': '$5.99',
                                    'estimatedArrivalTime': '7-10 Business Days'
                                }
                            ],
                            'shippingAddress': {
                                'ID': null,
                                'postalCode': '09876',
                                'stateCode': 'AP',
                                'firstName': null,
                                'lastName': null,
                                'address1': null,
                                'address2': null,
                                'city': null,
                                'phone': null
                            },
                            'selectedShippingMethod': {
                                'ID': '021',
                                'displayName': 'USPS',
                                'description': 'Order shipped by USPS received within 7-10 business days',
                                'estimatedArrivalTime': '7-10 Business Days',
                                'shippingCost': '$5.99'
                            }
                        }
                    ]
                }
            };
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
            myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
            myRequest.form = {
                'stateCode': 'AP',
                'postalCode': '09876'
            };
            return request(myRequest)
             // Handle response from request
                 .then(function (response) {
                     assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                     var bodyAsJson = JSON.parse(response.body);
                     var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['selected', 'default', 'countryCode', 'addressId', 'jobTitle', 'postBox', 'salutation', 'secondName', 'companyName', 'suffix', 'suite', 'title']);

                     assert.containSubset(bodyAsJson.order.totals, ExpectedResBody.order.totals, 'Actual response.totals not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].applicableShippingMethods, ExpectedResBody.order.shipping[0].applicableShippingMethods, 'applicableShippingMethods not as expected.');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].shippingAddress, ExpectedResBody.order.shipping[0].shippingAddress, 'shippingAddress is not as expected');
                     assert.containSubset(actualRespBodyStripped.order.shipping[0].selectedShippingMethod, ExpectedResBody.order.shipping[0].selectedShippingMethod, 'selectedShippingMethod is not as expected');
                 });
        });
    });
});
