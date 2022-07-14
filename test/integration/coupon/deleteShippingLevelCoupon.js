var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Shipping Level Coupon -  remove coupon', function () {
    this.timeout(25000);

    var variantId = '740357377119M';
    var quantity = 5;
    var couponCode = 'shipping';
    var cookieJar = request.jar();
    var cookieString;
    var UUID;

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
        pid: variantId,
        quantity: quantity
    };

    before(function () {
        // ----- adding 5 products to Cart
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                cookieString = cookieJar.getCookieString(myRequest.url);
            })
            // ----- select a shipping method in order to get cart content
            .then(function () {
                var shipMethodId = '001';   // 001 = Ground
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                return request(myRequest);
            })

            .then(function () {
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                return request(myRequest);
            })
            // ----- apply shipping level coupon
            .then(function (csrfResponse) {
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                myRequest.method = 'GET';
                myRequest.url = config.baseUrl + '/Cart-AddCoupon?couponCode=' + couponCode +
                    '&' + csrfJsonResponse.csrf.tokenName + '=' + csrfJsonResponse.csrf.token;
                return request(myRequest);
            })
            // ----- Get UUID information
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected apply shipping level coupon request statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);
                UUID = bodyAsJson.totals.discounts[0].UUID;
            });
    });

    it('should return non-discounted total after removal of shipping coupon', function () {
        myRequest.url = config.baseUrl + '/Cart-RemoveCouponLineItem?code=' + couponCode + '&uuid=' + UUID;
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected remove shipping level coupon request statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);
                assert.equal(bodyAsJson.totals.shippingLevelDiscountTotal.value, 0, 'shippingLevelDiscountTotal value is 0');
                assert.equal(bodyAsJson.totals.grandTotal, '$594.29', 'grandTotal is $594.29');
                assert.equal(bodyAsJson.totals.totalTax, '$28.30', 'totalTax is $528.30');
            });
    });
});
