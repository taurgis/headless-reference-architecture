var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Remove bundle from product line item', function () {
    this.timeout(50000);
    var cookieJar = request.jar();
    var UUID;
    var bundlePid = 'womens-jewelry-bundleM';
    var qty = 1;
    var childProducts = [
        { pid: '013742002836M' },
        { pid: '013742002805M' },
        { pid: '013742002799M' }
    ];

    var myRequest = {
        url: config.baseUrl + '/Cart-AddProduct',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        form: {
            pid: bundlePid,
            childProducts: childProducts,
            quantity: qty,
            options: []
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    before(function () {
        return request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected Cart-AddProduct bundles statusCode to be 200.');
            var bodyAsJson = JSON.parse(response.body);
            UUID = bodyAsJson.cart.items[0].UUID;
        });
    });

    it('1. should be able to remove a bundle from product line item', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bundlePid + '&uuid=' + UUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 200, 'Expected removeProductLineItem call statusCode to be 200.');
                var bodyAsJson = JSON.parse(removedItemResponse.body);
                assert.equal(bodyAsJson.basket.resources.emptyCartMsg, 'Your Shopping Cart is Empty', 'actual response from removing bundles not are expected');
                assert.equal(bodyAsJson.basket.resources.numberOfItems, '0 Items', 'should return 0 items in basket');
            });
    });

    it('2. should return error if UUID does not match', function () {
        var bogusUUID = UUID + '3';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bundlePid + '&uuid=' + bogusUUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 500, 'Expected removeProductLineItem request to fail when UUID is incorrect.');
            })
            .catch(function (error) {
                assert.equal(error.statusCode, 500, 'Expected statusCode to be 500 for removing product item with bogus UUID.');

                var bodyAsJson = JSON.parse(error.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message from removing  product item with non-matching PID and UUID  not as expected');
            });
    });
    it('3. should return error if bundle does not exist in Cart', function () {
        var bogusBundleId = 'mens-jewelry-bundle';
        myRequest.url = config.baseUrl + '/Cart-RemoveProductLineItem?pid=' + bogusBundleId + '&uuid=' + UUID;
        return request(myRequest)
            .then(function (removedItemResponse) {
                assert.equal(removedItemResponse.statusCode, 500, 'Expected removeProductLineItem call to fail when UUID is incorrect.');
            })
            .catch(function (error) {
                assert.equal(error.statusCode, 500, 'Expected statusCode to be 500 for removing product item with bogus pid.');

                var bodyAsJson = JSON.parse(error.response.body);

                assert.equal(bodyAsJson.errorMessage,
                    'Unable to remove item from the cart. Please try again! If the issue continues please contact customer service.',
                    'Actual error message from removing  product item with non-matching PID and UUID  not as expected');
            });
    });
});
