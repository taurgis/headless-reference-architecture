var assert = require('chai').assert;
var request = require('request');
var _ = require('lodash');
var config = require('../it.config');
var jsonHelpers = require('../helpers/jsonUtils');
var urlHelpers = require('../helpers/urlUtils');

describe('ProductVariation - Get product variation with main product ID and partial variation attributes', function () {
    this.timeout(5000);

    var mainPid = '25604455M';
    var myGetRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should returns main product details and variant attributes', function (done) {
        var urlEndPoint = config.baseUrl + '/Product-Variation';
        var urlWithMpid = urlEndPoint + '?pid=' + mainPid;
        myGetRequest.url = urlWithMpid + '&dwvar_25604455M_color=SLABLFB&dwvar_25604455M_size=155';

        request(myGetRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

            var bodyAsJson = JSON.parse(response.body);

            // strip out all "url" properties from the actual response
            var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['url', 'resetUrl', 'selectedProductUrl', 'raw', 'absURL']);

            // Verify product
            assert.equal(actualRespBodyStripped.product.productName, 'No-Iron Textured Dress Shirt');
            assert.equal(actualRespBodyStripped.product.productType, 'master');
            assert.equal(actualRespBodyStripped.product.id, mainPid);
            assert.equal(actualRespBodyStripped.product.longDescription, 'This cotton dress shirt is available in white or blue. Both colors are a wardrobe necessity.');

            // Verify product price
            assert.equal(actualRespBodyStripped.product.price.sales.value, '49.99');
            assert.equal(actualRespBodyStripped.product.price.sales.currency, 'USD');
            assert.equal(actualRespBodyStripped.product.price.sales.formatted, '$49.99');
            assert.equal(actualRespBodyStripped.product.price.list.value, '69.5');
            assert.equal(actualRespBodyStripped.product.price.list.currency, 'USD');
            assert.equal(actualRespBodyStripped.product.price.list.formatted, '$69.50');

            // Verify URL for product.variationAttributes of color = SLABLFB
            var attrColorBlue = bodyAsJson.product.variationAttributes[0].values[0];
            var urlSplit1 = attrColorBlue.url.split('?');
            var urlParams = urlSplit1[1].split('&');
            var urlEndPointCleaned = urlHelpers.stripBasicAuth(urlEndPoint);
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Color with id = SLABLFB: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 4, 'product.variationAttributes Color with id = SLABLFB: url does not have 4 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Color with id = SLABLFB: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color='), 'product.variationAttributes Color with id = SLABLFB: url not include parameter dwvar_25604455M_color=');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=155'), 'product.variationAttributes Color with id = SLABLFB: url not include parameter dwvar_25604455M_size=155');

            var colorBlueImages = attrColorBlue.images;
            assert.isTrue(colorBlueImages.swatch[0].url.endsWith('SLABLFB.CP.jpg'), 'color SLABLFB image swatch[0]: url not ended with SLABLFB.CP.jpg.');

            // Verify URL for product.variationAttributes of color = WHITEFB
            var attrColorWhite = bodyAsJson.product.variationAttributes[0].values[1];
            urlSplit1 = attrColorWhite.url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Color with id = WHITEFB: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 4, 'product.variationAttributes Color with id = WHITEFB: url does not have 4 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Color with id = WHITEFB: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Color with id = WHITEFB: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=155'), 'product.variationAttributes Color with id = WHITEFB: url not include parameter dwvar_25604455M_size=155');

            var colorWhiteImages = attrColorWhite.images;
            assert.isTrue(colorWhiteImages.swatch[0].url.endsWith('WHITEFB.CP.jpg'), 'color WHITEFB image swatch[0]: url not ended with WHITEFB.CP.jpg.');

            // Verify URL for product.variationAttributes of Size of id = 145
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[0].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 145: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 4, 'product.variationAttributes[1].values[0].url does not have 3 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 145: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Size with id = 145: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=145'), 'product.variationAttributes Size with id = 145: url not include parameter dwvar_25604455M_size=145');

            // Verify URL for product.variationAttributes of Size of id = 160
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[3].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 160: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 4, 'product.variationAttributes Size with id = 160: url does not have 3 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 160: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Size with id = 160: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=160'), 'product.variationAttributes Size with id = 160: url not include parameter dwvar_25604455M_size=160');

            // Verify URL for product.variationAttributes of Size of id = 220
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[11].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 220: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 4, 'product.variationAttributes Size with id = 220: url does not have 3 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 220: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Size with id = 220: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=220'), 'product.variationAttributes Size with id = 220: url not include parameter dwvar_25604455M_size=220');

            // Verify URL for product.variationAttributes of width = A (32/33)
            urlSplit1 = bodyAsJson.product.variationAttributes[2].values[0].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = A: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = A: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = A: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=155'), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_size=155');

            // Verify URL for product.variationAttributes of width = B (34/35)
            urlSplit1 = bodyAsJson.product.variationAttributes[2].values[1].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = B: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = B: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = B: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=B'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_width=B');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=155'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_size=155');

            // Verify URL for product.variationAttributes of images
            var prodImages = bodyAsJson.product.images;
            assert.isTrue(prodImages.large[0].url.endsWith('SLABLFB.PZ.jpg'), 'product image large[0]: url not ended with SLABLFB.PZ.jpg.');
            assert.isTrue(prodImages.large[1].url.endsWith('SLABLFB.BZ.jpg'), 'product image large[1]: url not ended with SLABLFB.BZ.jpg.');
            assert.isTrue(prodImages.small[0].url.endsWith('SLABLFB.PZ.jpg'), 'product image small[0]: url not ended with SLABLFB.PZ.jpg.');
            assert.isTrue(prodImages.small[1].url.endsWith('SLABLFB.BZ.jpg'), 'product image small[1]: url not ended with SLABLFB.BZ.jpg.');

            done();
        });
    });
});
