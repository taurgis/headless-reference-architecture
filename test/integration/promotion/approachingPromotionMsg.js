
var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

// Test Case
// pid=799927767720M
// 1. Product PDP page contains the promotional messages
// 2. Add 2 products to Cart, should return approaching order/shipping promotion messages
// 3. shipping cost and order discount
// 4. Shipping form updates

describe('Approaching order level promotion', function () {
    this.timeout(5000);

    var mainPid = '25594767M';
    var variantPid = '799927767720M';
    var qty = 2;
    var cookieString;
    var cookieJar = request.jar();
    var UUID;
    var myShippingMethodForm = {
        methodID: '001'
    };
    var myNewShippingMethodForm = {
        methodID: '021'
    };
    var myRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    var myNewRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    var myShippingRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    var orderDiscountMsg = 'Purchase $24.00 or more and receive 20% off on your order';
    var shippingDiscountMsg = 'Purchase $24.00 or more and receive Free Shipping with USPS (7-10 Business Days)';

    it('1. should return a response containing promotional messages for the order and shipping discounts on PDP', function () {
        myRequest.url = config.baseUrl + '/Product-Variation?pid='
            + mainPid + '&dwvar_' + mainPid + '_color=BLUJEFB&quantity=1';
        return request(myRequest, function (error, response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(response.statusCode, 200, 'Expected GET Product-Variation statusCode to be 200.');
            assert.isTrue(bodyAsJson.product.promotions[0].calloutMsg === '20% off on your order');
            assert.isTrue(bodyAsJson.product.promotions[1].calloutMsg === 'Free Shipping with USPS (7-10 Business Days)');
        });
    });
    it('2. should return a response containing approaching promotional call out messages', function () {
        // add 2 product to Cart
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid,
            quantity: qty
        };
        myRequest.method = 'POST';
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'expected add variant to Cart call to return status code 200');
                var bodyAsJson = JSON.parse(response.body);
                UUID = bodyAsJson.cart.items[0].UUID;
                assert.isTrue(bodyAsJson.quantityTotal === 2, 'should have 2 items added to Cart');
                assert.isTrue(bodyAsJson.message === 'Product added to cart');
                cookieString = cookieJar.getCookieString(myRequest.url);
            })
            // select a shipping method with Form is required before going to Cart
            .then(function () {
                myRequest.form = myShippingMethodForm; // Ground Shipping method
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod';
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'expected add shipping method to return status code 200');
                var bodyAsJson = JSON.parse(response.body);
                assert.equal(bodyAsJson.approachingDiscounts[0].discountMsg, orderDiscountMsg);
                assert.equal(bodyAsJson.approachingDiscounts[1].discountMsg, shippingDiscountMsg);
            });
    });
    it('3. should return a response with Approaching Order Discount -$30.40 in Cart', function () {
        // update the quantity to 4 to trigger the order level discount
        myNewRequest.url = config.baseUrl + '/Cart-UpdateQuantity?pid=' + variantPid + '&quantity=4&uuid=' + UUID;
        return request(myNewRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'expected update quantity call to return status code 200');
                var bodyAsJson = JSON.parse(response.body);
                var discounts = bodyAsJson.totals.discounts[0];
                assert.equal(bodyAsJson.totals.orderLevelDiscountTotal.formatted, '$30.40');
                assert.equal(discounts.lineItemText, 'Approaching Order Discount Test');
                assert.equal(discounts.price, '-$30.40');
                assert.equal(discounts.type, 'promotion');
            });
    });
    it('4. should return a response with Approaching Shipping Discount -$7.99 in Cart', function () {
        // update the shipping methods to be USPS to meet the promotion requirement
        myShippingRequest.form = myNewShippingMethodForm; // Ground Shipping method
        myShippingRequest.url = config.baseUrl + '/Cart-SelectShippingMethod';
        return request(myShippingRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'expected selectShippingMethod call to return status code 200');
                var bodyAsJson = JSON.parse(response.body);
                var discounts = bodyAsJson.totals.discounts[1];
                assert.equal(bodyAsJson.totals.shippingLevelDiscountTotal.formatted, '$7.99');
                assert.equal(discounts.lineItemText, 'Approaching Shipping Discount Test');
                assert.equal(discounts.price, '-$7.99');
                assert.equal(discounts.type, 'promotion');
            });
    });
});
