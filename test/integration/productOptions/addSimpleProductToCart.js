var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Add one Simple Product with Options to Cart', function () {
    this.timeout(5000);

    it('should add a simple product with options to Cart', function () {
        var pid = 'mitsubishi-wd-73736M';
        var quantity = '1';
        var options = [{ 'optionId': 'tvWarranty', 'selectedValueId': '001' }];
        var optionsString = JSON.stringify(options);

        var myRequest = {
            url: config.baseUrl + '/Cart-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            form: {
                pid: pid,
                childProducts: [],
                quantity: quantity,
                options: optionsString
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest, function (error, response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(response.statusCode, 200, 'Cart-AddProduct call should return statusCode of 200');
            assert.equal(bodyAsJson.message, 'Product added to cart');
            assert.equal(bodyAsJson.cart.items[0].options[0].displayName, 'Extended Warranty: 1 Year Warranty');
            assert.equal(bodyAsJson.cart.totals.subTotal, '$2,299.98');
        });
    });
});
