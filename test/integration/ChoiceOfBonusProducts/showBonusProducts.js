var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Choice Of Bonus Products: Show Bonus Products', function () {
    this.timeout(45000);

    var variantPid1 = '701642842675M';   // Long Center Seam Skirt

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
    var showBonusProductsParams;

    before(function () {
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            quantity: 1
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                cookieString = cookieJar.getCookieString(myRequest.url);
                var bodyAsJson = JSON.parse(response.body);
                showBonusProductsParams = bodyAsJson.newBonusDiscountLineItem.showProductsUrlRuleBased.split('?')[1];
            });
    });

    it('should get information on choice of bonus product', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Product-ShowBonusProducts?' + showBonusProductsParams;

        var cookie = request.cookie(cookieString);
        cookieJar.setCookie(cookie, myRequest.url);

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isNotNull(bodyAsJson.renderedTemplate);
                assert.isString(bodyAsJson.closeButtonText);
                assert.isString(bodyAsJson.enterDialogMessage);
            });
    });
});
