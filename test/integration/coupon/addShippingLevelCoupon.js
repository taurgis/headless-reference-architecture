var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Shipping Level Coupon - add coupon', function () {
    this.timeout(25000);

    var variantId = '740357377119M';
    var quantity = 5;
    var couponCode = 'shipping';
    var cookieJar = request.jar();
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
        pid: variantId,
        quantity: quantity
    };

    before(function () {
        // adding 5 products to Cart
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                cookieString = cookieJar.getCookieString(myRequest.url);
            })
            // select a shipping method in order to get cart content
            .then(function () {
                var shipMethodId = '001';   // 001 = Ground
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/Cart-SelectShippingMethod?methodID=' + shipMethodId;
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                return request(myRequest);
            })
            // get CSRF token
            .then(function () {
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                return request(myRequest)
                    .then(function (csrfResponse) {
                        var csrfJsonResponse = JSON.parse(csrfResponse.body);
                        myRequest.method = 'GET';
                        myRequest.url = config.baseUrl + '/Cart-AddCoupon?couponCode=' +
                            couponCode + '&' + csrfJsonResponse.csrf.tokenName + '=' +
                            csrfJsonResponse.csrf.token;
                    });
            });
    });

    it('should return discounted total for shipping cost', function () {
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add coupon request statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);
                assert.equal(bodyAsJson.totals.shippingLevelDiscountTotal.value, 8, 'shippingLevelDiscountTotal.value should be 8');
                assert.equal(bodyAsJson.totals.shippingLevelDiscountTotal.formatted, '$8.00', 'shippingLevelDiscountTotal.formatted should be $8.00');
                assert.equal(bodyAsJson.totals.discounts[0].type, 'coupon', 'actual totals discounts type should be coupon');
                assert.isTrue(bodyAsJson.totals.discounts[0].applied, 'actual totals discounts applied should be true');
                assert.include(bodyAsJson.totals.discountsHtml, 'Spend 500 and receive 50% off shipping', 'actual promotion call out message is correct');
            });
    });
});
