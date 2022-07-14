var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var cheerio = require('cheerio');

/**
 * Test Case :
 * Verify 'SearchServices-GetSuggestions?q=tops' call submitted successful and the response contains the following :
 * - Do you mean? Tops
 * - Products : Log Sleeve Turtleneck Top; Cowl Neck Top; Paisley Turtleneck Top
 * - Categories : Tops; Top Sellers
 * - Content : FAQs
 */

describe('Search As You Type - general product', function () {
    this.timeout(5000);

    var product = 'Tops';
    var myRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should remove line item', function (done) {
        myRequest.url = config.baseUrl + '/SearchServices-GetSuggestions?q=' + product;
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected GET SearchServices-GetSuggestions call statusCode to be 200.');
            var $ = cheerio.load(response.body);

            var prod = $('.container a img');
            assert.isTrue(prod.get(0).attribs.alt.endsWith('Top'));
            assert.isTrue(prod.get(1).attribs.alt.endsWith('Top'));
            assert.isTrue(prod.get(2).attribs.alt.endsWith('Top'));
            done();
        });
    });
});
