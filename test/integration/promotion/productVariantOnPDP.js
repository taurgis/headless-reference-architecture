var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

/**
 * Test Case:
 * Verify promotion enabled product variant id = 793775370033 should contain
 * The promotion text message as well as the price adjustment
 */

describe('Product Variant Promotion on Product Details Page', function () {
    this.timeout(5000);

    var mainPid = '25752986M';
    var myGetRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should return a response containing promotion message and sale price ', function (done) {
        myGetRequest.url = config.baseUrl + '/Product-Variation?pid='
            + mainPid + '&dwvar_' + mainPid + '_color=TURQUSI&quantity=1';

        var expectedSalesPrice = { value: 23.99, currency: 'USD', formatted: '$23.99', 'decimalPrice': '23.99' };
        var expectedListPrice = { value: 39.5, currency: 'USD', formatted: '$39.50', 'decimalPrice': '39.50' };

        var expectedPromotion = {
            'promotions': [
                {
                    'calloutMsg': 'Get 20% off of this tie.',
                    'details': 'Buy a tie with 20% percent off.',
                    'enabled': true,
                    'id': 'PromotionTest_WithoutQualifying',
                    'name': 'PromotionTest_WithoutQualifying',
                    'promotionClass': 'PRODUCT',
                    'rank': null
                }
            ]
        };
        request(myGetRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected GET Product-Variation statusCode to be 200.');
            var bodyAsJson = JSON.parse(response.body);
            assert.deepEqual(bodyAsJson.product.promotions[0], expectedPromotion.promotions[0]);
            assert.deepEqual(bodyAsJson.product.price.sales, expectedSalesPrice);
            assert.deepEqual(bodyAsJson.product.price.list, expectedListPrice);
            done();
        });
    });
});
