var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Add bundles to cart', function () {
    this.timeout(5000);

    it('should be able to add a bundle to Cart', function () {
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

        var bundlePid = 'womens-jewelry-bundleM';
        var qty = 1;
        var childProducts = [
            { pid: '013742002836M' },
            { pid: '013742002805M' },
            { pid: '013742002799M' }
        ];

        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: bundlePid,
            childProducts: childProducts,
            quantity: qty
        };
        return request(myRequest, function (error, response) {
            var bodyAsJson = JSON.parse(response.body);
            var cartItems = bodyAsJson.cart.items[0];
            assert.equal(response.statusCode, 200, 'Expected Cart-AddProduct bundles statusCode to be 200.');
            assert.equal(cartItems.productName, 'Turquoise Jewelry Bundle');
            assert.equal(cartItems.productType, 'bundle');
            assert.equal(cartItems.priceTotal.price, '$113.00');
            assert.equal(cartItems.bundledProductLineItems[0].id, '013742002836M');
            assert.equal(cartItems.bundledProductLineItems[0].productName, 'Turquoise and Gold Bracelet');
            assert.equal(cartItems.bundledProductLineItems[1].id, '013742002805M');
            assert.equal(cartItems.bundledProductLineItems[1].productName, 'Turquoise and Gold Necklace');
            assert.equal(cartItems.bundledProductLineItems[2].id, '013742002799M');
            assert.equal(cartItems.bundledProductLineItems[2].productName, 'Turquoise and Gold Hoop Earring');
        });
    });
});
