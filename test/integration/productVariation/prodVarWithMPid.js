var assert = require('chai').assert;
var request = require('request');
var config = require('../it.config');
var jsonHelpers = require('../helpers/jsonUtils');
var urlHelpers = require('../helpers/urlUtils');

describe('ProductVariation - Get product variation with only main product ID', function () {
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
        var resourcePath = config.baseUrl + '/Product-Variation?';
        myGetRequest.url = resourcePath + 'pid=' + mainPid;

        request(myGetRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

            // Remove basic auth - to use intergration tests on test instances

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

            // Verifying the following for product.variationAttributes of color swatch color= SLABLFB
            var attrColorBlue = bodyAsJson.product.variationAttributes[0].values[0];

            // Verify color swatch
            assert.equal(attrColorBlue.value, 'SLABLFB');
            assert.isTrue(bodyAsJson.product.variationAttributes[0].swatchable);

            // Clean the resourcePath if basic auth is set
            var resourcePathCleaned = urlHelpers.stripBasicAuth(resourcePath);

            // Verify URL
            assert.equal(attrColorBlue.url, resourcePathCleaned + 'dwvar_25604455M_color=SLABLFB&pid=25604455M&quantity=1', 'Actual color attribute = SLABLFB: url not as expected.');

            // Verify Image
            var colorBlueImages = attrColorBlue.images;
            assert.isTrue(colorBlueImages.swatch[0].url.endsWith('SLABLFB.CP.jpg'), 'color SLABLFB image swatch[0]: url not ended with SLABLFB.CP.jpg.');

            // Verify rating
            assert.equal(bodyAsJson.product.rating, '3.3');

            // Verify description
            assert.equal(bodyAsJson.product.longDescription, 'This cotton dress shirt is available in white or blue. Both colors are a wardrobe necessity.');
            assert.equal(bodyAsJson.product.shortDescription, 'This cotton dress shirt is available in white or blue. Both colors are a wardrobe necessity.');

            // Verify availability
            assert.equal(bodyAsJson.product.availability.messages, 'In Stock');

            // Verifying the following for product.variationAttributes of color swatch color= WHITEFB
            var attrColorWhite = bodyAsJson.product.variationAttributes[0].values[1];

            // Verify color swatch
            assert.equal(attrColorBlue.value, 'SLABLFB');
            assert.equal(attrColorWhite.url, resourcePathCleaned + 'dwvar_25604455M_color=WHITEFB&pid=25604455M&quantity=1', 'Actual color attribute = WHITEFB: url not as expected.');

            // Verify URL
            var colorWhiteImages = attrColorWhite.images;
            assert.isTrue(colorWhiteImages.swatch[0].url.endsWith('WHITEFB.CP.jpg'), 'color WHITEFB image swatch[0].url not ended with WHITEFB.CP.jpg.');

            // Verify URL for product.variationAttributes of Size of id = 145
            assert.equal(bodyAsJson.product.variationAttributes[1].values[0].url, resourcePathCleaned + 'dwvar_25604455M_size=145&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[0].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 150
            assert.equal(bodyAsJson.product.variationAttributes[1].values[1].url, resourcePathCleaned + 'dwvar_25604455M_size=150&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[1].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 155
            assert.equal(bodyAsJson.product.variationAttributes[1].values[2].url, resourcePathCleaned + 'dwvar_25604455M_size=155&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[2].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 160
            assert.equal(bodyAsJson.product.variationAttributes[1].values[3].url, resourcePathCleaned + 'dwvar_25604455M_size=160&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[3].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 165
            assert.equal(bodyAsJson.product.variationAttributes[1].values[4].url, resourcePathCleaned + 'dwvar_25604455M_size=165&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[4].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 170
            assert.equal(bodyAsJson.product.variationAttributes[1].values[5].url, resourcePathCleaned + 'dwvar_25604455M_size=170&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[5].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 175
            assert.equal(bodyAsJson.product.variationAttributes[1].values[6].url, resourcePathCleaned + 'dwvar_25604455M_size=175&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[6].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 180
            assert.equal(bodyAsJson.product.variationAttributes[1].values[7].url, resourcePathCleaned + 'dwvar_25604455M_size=180&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[7].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 185
            assert.equal(bodyAsJson.product.variationAttributes[1].values[8].url, resourcePathCleaned + 'dwvar_25604455M_size=185&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[8].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 190
            assert.equal(bodyAsJson.product.variationAttributes[1].values[9].url, resourcePathCleaned + 'dwvar_25604455M_size=190&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[9].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 200
            assert.equal(bodyAsJson.product.variationAttributes[1].values[10].url, resourcePathCleaned + 'dwvar_25604455M_size=200&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[10].url not as expected.');

            // Verify URL for product.variationAttributes of Size of id = 220
            assert.equal(bodyAsJson.product.variationAttributes[1].values[11].url, resourcePathCleaned + 'dwvar_25604455M_size=220&pid=25604455M&quantity=1', 'Actual product.variationAttributes[1].values[11].url not as expected.');

            // Verify URL for product.variationAttributes of width = A (32/33)
            assert.equal(bodyAsJson.product.variationAttributes[2].values[0].url, resourcePathCleaned + 'dwvar_25604455M_width=A&pid=25604455M&quantity=1', 'Actual product.variationAttributes[2].values[0].url not as expected.');

            // Verify URL for product.variationAttributes of width = B (34/35)
            assert.equal(bodyAsJson.product.variationAttributes[2].values[1].url, resourcePathCleaned + 'dwvar_25604455M_width=B&pid=25604455M&quantity=1', 'Actual product.variationAttributes[2].values[1].url not as expected.');

            // Verify URL for product.variationAttributes of images
            var prodImages = bodyAsJson.product.images;
            assert.isTrue(prodImages.large[0].url.endsWith('WHITEFB.PZ.jpg'), 'product image large[0]: url not ended with WHITEFB.PZ.jpg');
            assert.isTrue(prodImages.large[1].url.endsWith('WHITEFB.BZ.jpg'), 'product image large[1]: url not ended with WHITEFB.BZ.jpg');
            assert.isTrue(prodImages.small[0].url.endsWith('WHITEFB.PZ.jpg'), 'product image small[0]: url not ended with WHITEFB.PZ.jpg');
            assert.isTrue(prodImages.small[1].url.endsWith('WHITEFB.BZ.jpg'), 'product image small[1]: url not ended with WHITEFB.BZ.jpg');

            done();
        });
    });
});
