var assert = require('chai').assert;
var request = require('request');
var _ = require('lodash');
var config = require('../it.config');
var jsonHelpers = require('../helpers/jsonUtils');
var urlHelpers = require('../helpers/urlUtils');

describe('ProductVariation - Get product variation with main product ID and all required variation attributes', function () {
    this.timeout(5000);

    var mainPid = '25604455M';
    var paramColorWhite = 'dwvar_25604455M_color=WHITEFB';
    var paramSize160 = 'dwvar_25604455M_size=160';
    var paramWidth3233 = 'dwvar_25604455M_width=A';
    var expectedVariant = '708141676220M';

    var myGetRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should returns variant for the selected attributes', function (done) {
        var urlEndPoint = config.baseUrl + '/Product-Variation';
        var urlWithMpid = urlEndPoint + '?pid=' + mainPid;
        myGetRequest.url = urlWithMpid + '&' + paramColorWhite + '&' + paramSize160 + '&' + paramWidth3233;

        request(myGetRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

            var bodyAsJson = JSON.parse(response.body);

            // strip out all "url" properties from the actual response
            var actualRespBodyStripped = jsonHelpers.deleteProperties(bodyAsJson, ['url', 'resetUrl', 'selectedProductUrl', 'raw', 'absURL']);
            var attrColor = actualRespBodyStripped.product.variationAttributes[0].values[0];

            // Verify color swatch
            assert.equal(attrColor.value, 'SLABLFB');
            assert.isTrue(actualRespBodyStripped.product.variationAttributes[0].swatchable);

            // Verify rating
            assert.equal(actualRespBodyStripped.product.rating, '4.8');

            // Verify description
            assert.equal(actualRespBodyStripped.product.longDescription, 'This cotton dress shirt is available in white or blue. Both colors are a wardrobe necessity.');
            assert.equal(actualRespBodyStripped.product.shortDescription, 'This cotton dress shirt is available in white or blue. Both colors are a wardrobe necessity.');

            // Verify product
            assert.equal(actualRespBodyStripped.product.productName, 'No-Iron Textured Dress Shirt');
            assert.equal(actualRespBodyStripped.product.productType, 'variant');
            assert.equal(actualRespBodyStripped.product.id, expectedVariant);
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
            assert.equal(urlParams.length, 5, 'product.variationAttributes Color with id = SLABLFB: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Color with id = SLABLFB: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Color with id = SLABLFB: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=SLABLFB'), 'product.variationAttributes Color with id = SLABLFB: url not include parameter dwvar_25604455M_color=SLABLFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=160'), 'product.variationAttributes Color with id = SLABLFB: url not include parameter dwvar_25604455M_size=160');

            var colorBlueImages = attrColorBlue.images;
            assert.isTrue(colorBlueImages.swatch[0].url.endsWith('SLABLFB.CP.jpg'), 'color SLABLFB image swatch[0]: url not ended with SLABLFB.CP.jpg.');

            // Verify URL for product.variationAttributes of color = WHITEFB
            var attrColorWhite = bodyAsJson.product.variationAttributes[0].values[1];
            urlSplit1 = attrColorWhite.url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Color with id = WHITEFB: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Color with id = WHITEFB: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Color with id = WHITEFB: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Color with id = WHITEFB: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color='), 'product.variationAttributes Color with id = WHITEFB: url not include parameter dwvar_25604455M_color=');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=160'), 'product.variationAttributes Color with id = WHITEFB: url not include parameter dwvar_25604455M_size=160');

            var colorWhiteImages = attrColorWhite.images;
            assert.isTrue(colorWhiteImages.swatch[0].url.endsWith('WHITEFB.CP.jpg'), 'color WHITEFB image swatch[0]: url not ended with WHITEFB.CP.jpg.');

            // Verify URL for product.variationAttributes Size with id = 145
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[0].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 145: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 145: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 145: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 145: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 145: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=145'), 'product.variationAttributes Size with id = 145: url not include parameter dwvar_25604455M_size=145');

            // Verify URL for product.variationAttributes of Size of id = 150
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[1].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 150: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 150: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 150: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 150: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 150: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=150'), 'product.variationAttributes Size with id = 150: url not include parameter dwvar_25604455M_size=150');

            // Verify URL for product.variationAttributes Size with id = 155
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[2].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 155: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 155: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 155: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 155: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 155: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=155'), 'product.variationAttributes Size with id = 155: url not include parameter dwvar_25604455M_size=155');

            // Verify URL for product.variationAttributes Size with id = 160
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[3].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 160: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 160: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 160: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 160: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 160: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size='), 'product.variationAttributes Size with id = 160: url not include parameter dwvar_25604455M_size=');

            // Verify URL for product.variationAttributes Size with id = 165
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[4].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 165: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 165 url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 165: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 165: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 165: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=165'), 'product.variationAttributes Size with id = 165: url not include parameter dwvar_25604455M_size=165');

            // Verify URL for product.variationAttributes Size with id = 170
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[5].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 170: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 170 url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 170: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 170: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 170: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=170'), 'product.variationAttributes Size with id = 170: url not include parameter dwvar_25604455M_size=170');

            // Verify URL for product.variationAttributes Size with id = 180
            urlSplit1 = bodyAsJson.product.variationAttributes[1].values[7].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = 180: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = 180 url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = 180: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=A'), 'product.variationAttributes Size with id = 180: url not include parameter dwvar_25604455M_width=A');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = 180: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=180'), 'product.variationAttributes Size with id = 180: url not include parameter dwvar_25604455M_size=180');

            // Verify URL for product.variationAttributes of width = A (32/33)
            urlSplit1 = bodyAsJson.product.variationAttributes[2].values[0].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = A: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = A: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = A: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width='), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_width=');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=160'), 'product.variationAttributes Size with id = A: url not include parameter dwvar_25604455M_size=160');

            // Verify URL for product.variationAttributes of width = B (34/35)
            urlSplit1 = bodyAsJson.product.variationAttributes[2].values[1].url.split('?');
            urlParams = urlSplit1[1].split('&');
            assert.equal(urlSplit1[0], urlEndPointCleaned, 'product.variationAttributes Size with id = B: actual request end point not equal expected value.');
            assert.equal(urlParams.length, 5, 'product.variationAttributes Size with id = B: url does not have 5 parameters.');
            assert.isTrue(_.includes(urlParams, 'pid=' + mainPid), 'product.variationAttributes Size with id = B: url not include parameter pid=' + mainPid);
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_width=B'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_width=B');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_color=WHITEFB'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_color=WHITEFB');
            assert.isTrue(_.includes(urlParams, 'dwvar_25604455M_size=160'), 'product.variationAttributes Size with id = B: url not include parameter dwvar_25604455M_size=160');

            // Verify URL for product.variationAttributes of images
            var prodImages = bodyAsJson.product.images;
            assert.isTrue(prodImages.large[0].url.endsWith('WHITEFB.PZ.jpg'), 'product image large[0]: url not ended with WHITEFB.PZ.jpg.');
            assert.isTrue(prodImages.large[1].url.endsWith('WHITEFB.BZ.jpg'), 'product image large[1]: url not ended with WHITEFB.BZ.jpg.');
            assert.isTrue(prodImages.small[0].url.endsWith('WHITEFB.PZ.jpg'), 'product image small[0]: url not ended with WHITEFB.PZ.jpg.');
            assert.isTrue(prodImages.small[1].url.endsWith('WHITEFB.BZ.jpg'), 'product image small[1]: url not ended with WHITEFB.BZ.jpg.');

            done();
        });
    });
});
