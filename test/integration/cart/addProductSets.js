var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Add Product Set to cart', function () {
    this.timeout(5000);

    it('should add all products in a product set', function () {
        var cookieJar = request.jar();

        var pidsObj = [
            {
                'pid': '726819487824M',
                'qty': '1',
                options: ''
            },
            {
                'pid': '69309284M-2',
                'qty': '1',
                options: ''
            },
            {
                'pid': '799927335059M',
                'qty': '1',
                options: ''
            }
        ];

        var pidsObjString = JSON.stringify(pidsObj);

        var myRequest = {
            url: config.baseUrl + '/Cart-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pidsObj: pidsObjString
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);

                var expectedResponse = {
                    'action': 'Cart-AddProduct',
                    'queryString': '',
                    'locale': 'en_US',
                    'quantityTotal': 3,
                    'message': 'Product added to cart',
                    'cart': {
                        'actionUrls': {
                            'removeProductLineItemUrl': '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-RemoveProductLineItem',
                            'updateQuantityUrl': '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-UpdateQuantity',
                            'selectShippingUrl': '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-SelectShippingMethod',
                            'submitCouponCodeUrl': '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-AddCoupon',
                            'removeCouponLineItem': '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-RemoveCouponLineItem'
                        },
                        'numOfShipments': 1,
                        'totals': {
                            'subTotal': '$268.00',
                            'totalShippingCost': '$9.99',
                            'grandTotal': '$291.89',
                            'totalTax': '$13.90',
                            'orderLevelDiscountTotal': {
                                'value': 0,
                                'formatted': '$0.00'
                            },
                            'shippingLevelDiscountTotal': {
                                'value': 0,
                                'formatted': '$0.00'
                            },
                            'discounts': [],
                            'discountsHtml': '\n'
                        },
                        'shipments': [
                            {
                                'shippingMethods': [
                                    {
                                        'ID': '001',
                                        'displayName': 'Ground',
                                        'description': 'Order received within 7-10 business days',
                                        'estimatedArrivalTime': '7-10 Business Days',
                                        'default': true,
                                        'shippingCost': '$9.99',
                                        'selected': true
                                    },
                                    {
                                        'ID': '002',
                                        'displayName': '2-Day Express',
                                        'description': 'Order received in 2 business days',
                                        'estimatedArrivalTime': '2 Business Days',
                                        'default': false,
                                        'shippingCost': '$15.99',
                                        'selected': false
                                    },
                                    {
                                        'ID': '003',
                                        'displayName': 'Overnight',
                                        'description': 'Order received the next business day',
                                        'estimatedArrivalTime': 'Next Day',
                                        'default': false,
                                        'shippingCost': '$21.99',
                                        'selected': false
                                    },
                                    {
                                        'ID': '012',
                                        'displayName': 'Express',
                                        'description': 'Orders shipped outside continental US received in 2-3 business days',
                                        'estimatedArrivalTime': '2-3 Business Days',
                                        'default': false,
                                        'shippingCost': '$28.99',
                                        'selected': false
                                    },
                                    {
                                        'ID': '021',
                                        'displayName': 'USPS',
                                        'description': 'Order shipped by USPS received within 7-10 business days',
                                        'estimatedArrivalTime': '7-10 Business Days',
                                        'default': false,
                                        'shippingCost': '$9.99',
                                        'selected': false
                                    }
                                ],
                                'selectedShippingMethod': '001'
                            }
                        ],
                        'approachingDiscounts': [],
                        'items': [
                            {
                                'id': '726819487824M',
                                'productName': 'Platinum V Neck Suit Dress',
                                'price': {
                                    'sales': {
                                        'value': 99,
                                        'currency': 'USD',
                                        'formatted': '$99.00'
                                    },
                                    'list': null
                                },
                                'productType': 'variant',
                                'images': {
                                    'small': [
                                        {
                                            'alt': 'Platinum V Neck Suit Dress, Black, small',
                                            'url': '/on/demandware.static/-/Sites-apparel-catalog/default/dw98d73d67/images/small/PG.821301999.JJDH0XX.PZ.jpg',
                                            'title': 'Platinum V Neck Suit Dress, Black'
                                        }
                                    ]
                                },
                                'rating': 2,
                                'variationAttributes': [
                                    {
                                        'displayName': 'Color',
                                        'displayValue': 'Black',
                                        'attributeId': 'color',
                                        'id': 'color'
                                    },
                                    {
                                        'displayName': 'Size',
                                        'displayValue': '6',
                                        'attributeId': 'size',
                                        'id': 'size'
                                    }
                                ],
                                'quantityOptions': {
                                    'minOrderQuantity': 1,
                                    'maxOrderQuantity': 10
                                },
                                'priceTotal': {
                                    'price': '$99.00',
                                    'renderedPrice': '\n\n\n<div class="strike-through\nnon-adjusted-price"\n>\n    null\n</div>\n<div class="pricing line-item-total-price-amount item-total-null">$99.00</div>\n\n'
                                },
                                'isBonusProductLineItem': false,
                                'isGift': false,
                                'UUID': '609a030b33812caaf9654ddc1e',
                                'quantity': 1,
                                'isOrderable': true,
                                'promotions': null,
                                'renderedPromotions': '',
                                'attributes': null,
                                'availability': {
                                    'messages': [
                                        'In Stock'
                                    ],
                                    'inStockDate': null
                                },
                                'isAvailableForInStorePickup': false
                            },
                            {
                                'id': '69309284M-2',
                                'productName': 'Modern Striped Dress Shirt',
                                'price': {
                                    'sales': {
                                        'value': 135,
                                        'currency': 'USD',
                                        'formatted': '$135.00'
                                    },
                                    'list': null
                                },
                                'productType': 'variant',
                                'images': {
                                    'small': [
                                        {
                                            'alt': 'Modern Striped Dress Shirt, Blue, small',
                                            'url': '/on/demandware.static/-/Sites-apparel-catalog/default/dw30e81930/images/small/B0174514_GY9_0.jpg',
                                            'title': 'Modern Striped Dress Shirt, Blue'
                                        }
                                    ]
                                },
                                'rating': 0,
                                'variationAttributes': [
                                    {
                                        'displayName': 'color',
                                        'displayValue': 'Blue',
                                        'attributeId': 'color',
                                        'id': 'color'
                                    },
                                    {
                                        'displayName': 'size',
                                        'displayValue': '15L',
                                        'attributeId': 'size',
                                        'id': 'size'
                                    }
                                ],
                                'quantityOptions': {
                                    'minOrderQuantity': 1,
                                    'maxOrderQuantity': 10
                                },
                                'priceTotal': {
                                    'price': '$135.00',
                                    'renderedPrice': '\n\n\n<div class="strike-through\nnon-adjusted-price"\n>\n    null\n</div>\n<div class="pricing line-item-total-price-amount item-total-null">$135.00</div>\n\n'
                                },
                                'isBonusProductLineItem': false,
                                'isGift': false,
                                'UUID': '5f7095b9af2af2ba8a062a2586',
                                'quantity': 1,
                                'isOrderable': true,
                                'promotions': null,
                                'renderedPromotions': '',
                                'attributes': null,
                                'availability': {
                                    'messages': [
                                        'In Stock'
                                    ],
                                    'inStockDate': null
                                },
                                'isAvailableForInStorePickup': false
                            },
                            {
                                'id': '799927335059M',
                                'productName': 'Classic Wrap',
                                'price': {
                                    'sales': {
                                        'value': 34,
                                        'currency': 'USD',
                                        'formatted': '$34.00'
                                    },
                                    'list': null
                                },
                                'productType': 'variant',
                                'images': {
                                    'small': [
                                        {
                                            'alt': 'Classic Wrap, Ivory, small',
                                            'url': '/on/demandware.static/-/Sites-apparel-catalog/default/dwd7013224/images/small/PG.W20766.IVORYXX.PZ.jpg',
                                            'title': 'Classic Wrap, Ivory'
                                        }
                                    ]
                                },
                                'rating': 4,
                                'variationAttributes': [
                                    {
                                        'displayName': 'Color',
                                        'displayValue': 'Ivory',
                                        'attributeId': 'color',
                                        'id': 'color'
                                    }
                                ],
                                'quantityOptions': {
                                    'minOrderQuantity': 1,
                                    'maxOrderQuantity': 10
                                },
                                'priceTotal': {
                                    'price': '$34.00',
                                    'renderedPrice': '\n\n\n<div class="strike-through\nnon-adjusted-price"\n>\n    null\n</div>\n<div class="pricing line-item-total-price-amount item-total-null">$34.00</div>\n\n'
                                },
                                'isBonusProductLineItem': false,
                                'isGift': false,
                                'UUID': 'fdb8c0e48d32acecfa239fb2df',
                                'quantity': 1,
                                'isOrderable': true,
                                'promotions': null,
                                'renderedPromotions': '',
                                'attributes': null,
                                'availability': {
                                    'messages': [
                                        'In Stock'
                                    ],
                                    'inStockDate': null
                                },
                                'isAvailableForInStorePickup': false
                            }
                        ],
                        'numItems': 3,
                        'resources': {
                            'numberOfItems': '3 Items',
                            'emptyCartMsg': 'Your Shopping Cart is Empty'
                        }
                    },
                    'error': false
                };

                function verifyShippingMethods(shipMethod, ExpectedShipMethod) {
                    assert.equal(shipMethod.description, ExpectedShipMethod.description);
                    assert.equal(shipMethod.displayName, ExpectedShipMethod.displayName);
                    assert.equal(shipMethod.ID, ExpectedShipMethod.ID);
                    assert.equal(shipMethod.estimatedArrivalTime, ExpectedShipMethod.estimatedArrivalTime);
                    assert.equal(shipMethod.isDefault, ExpectedShipMethod.isDefault);
                    assert.equal(shipMethod.isSelected, ExpectedShipMethod.isSelected);
                    assert.equal(shipMethod.shippingCost, ExpectedShipMethod.shippingCost);
                }

                // ----- Verify quantityTotal, message, action, queryString
                assert.equal(bodyAsJson.quantityTotal, expectedResponse.quantityTotal);
                assert.equal(bodyAsJson.message, expectedResponse.message);
                assert.equal(bodyAsJson.action, expectedResponse.action);

                // ----- Verify actionUrls
                var actionUrls = bodyAsJson.cart.actionUrls;
                var expectedActionUrls = expectedResponse.cart.actionUrls;
                assert.equal(actionUrls.removeProductLineItemUrl, expectedActionUrls.removeProductLineItemUrl);
                assert.equal(actionUrls.updateQuantityUrl, expectedActionUrls.updateQuantityUrl);
                assert.equal(actionUrls.selectShippingUrl, expectedActionUrls.selectShippingUrl);
                assert.equal(actionUrls.submitCouponCodeUrl, expectedActionUrls.submitCouponCodeUrl);
                assert.equal(actionUrls.removeCouponLineItem, expectedActionUrls.removeCouponLineItem);

                // ----- Verify approaching discounts
                assert.lengthOf(bodyAsJson.cart.approachingDiscounts, 0);

                // ----- Verify numOfShipments
                assert.equal(bodyAsJson.cart.numOfShipments, expectedResponse.cart.numOfShipments);

                // ----- Verify totals
                var totals = bodyAsJson.cart.totals;
                var expectedTotals = expectedResponse.cart.totals;
                assert.equal(totals.subTotal, expectedTotals.subTotal);
                assert.equal(totals.grandTotal, expectedTotals.grandTotal);
                assert.equal(totals.totalTax, expectedTotals.totalTax);
                assert.equal(totals.totalShippingCost, expectedTotals.totalShippingCost);
                assert.equal(totals.orderLevelDiscountTotal.value, expectedTotals.orderLevelDiscountTotal.value);
                assert.equal(totals.orderLevelDiscountTotal.formatted, expectedTotals.orderLevelDiscountTotal.formatted);
                assert.equal(totals.shippingLevelDiscountTotal.value, expectedTotals.shippingLevelDiscountTotal.value);
                assert.equal(totals.shippingLevelDiscountTotal.formatted, expectedTotals.shippingLevelDiscountTotal.formatted);
                assert.lengthOf(totals.discounts, 0);

                // ----- Verify Shipments
                var shipMethods = bodyAsJson.cart.shipments[0].shippingMethods;
                var ExpectedShipMethods = expectedResponse.cart.shipments[0].shippingMethods;
                for (var i = 0; i < ExpectedShipMethods.length; i++) {
                    verifyShippingMethods(shipMethods[i], ExpectedShipMethods[i]);
                }

                assert.equal(bodyAsJson.cart.shipments[0].selectedShippingMethod, expectedResponse.cart.shipments[0].selectedShippingMethod);

                // ----- Verify product line items in cart
                assert.lengthOf(bodyAsJson.cart.items, 3);

                // Verify items in cart - item 1
                var expectedItem0 = {
                    id: '726819487824M',
                    productName: 'Platinum V Neck Suit Dress',
                    price:
                    {
                        sales: {
                            value: 99,
                            currency: 'USD',
                            formatted: '$99.00'
                        }
                    },
                    variationAttributes:
                    [{ displayName: 'Color',
                        displayValue: 'Black'
                    },
                    { displayName: 'Size',
                        displayValue: '6'
                    }
                    ]
                };

                assert.containSubset(bodyAsJson.cart.items[0], expectedItem0);

                // Verify items in cart - item 2
                var expectedItem1 = {
                    id: '69309284M-2',
                    productName: 'Modern Striped Dress Shirt',
                    price: {
                        sales: {
                            value: 135,
                            currency: 'USD'
                        }
                    },
                    variationAttributes:
                    [{
                        displayName: 'color',
                        displayValue: 'Blue'
                    },
                    { displayName: 'size',
                        displayValue: '15L'
                    }
                    ]
                };
                assert.containSubset(bodyAsJson.cart.items[1], expectedItem1);

                // Verify items in cart - item 3
                var expectedItem2 = {
                    id: '799927335059M',
                    productName: 'Classic Wrap',
                    price: {
                        sales: {
                            value: 34,
                            currency: 'USD'
                        }
                    },
                    variationAttributes:
                    [{ displayName: 'Color',
                        displayValue: 'Ivory'
                    }
                    ],
                    quantity: 1
                };
                assert.containSubset(bodyAsJson.cart.items[2], expectedItem2);

                // ----- Verify number of items
                assert.equal(bodyAsJson.cart.numItems, expectedResponse.cart.numItems);

                // ----- Verify resource
                assert.equal(bodyAsJson.cart.resources.numberOfItems, expectedResponse.cart.resources.numberOfItems);
                assert.equal(bodyAsJson.cart.resources.emptyCartMsg, expectedResponse.cart.resources.emptyCartMsg);
            });
    });
});
