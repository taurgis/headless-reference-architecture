const assert = require('chai').assert;

const seoHelper = require('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/seoHelper');

describe('getPageMetaTags', function () {
    it('should return null when no object is passed', function () {
        const result = seoHelper.getPageMetaTags();

        assert.isNull(result);
    });

    it('should return null when an object is passed without the "pageMetaTags" attribute', function () {
        const result = seoHelper.getPageMetaTags({ });

        assert.isNull(result);
    });

    it('should return an array of formatted tags when an object is passed with the "pageMetaTags" attribute', function () {
        const result = seoHelper.getPageMetaTags({
            pageMetaTags: [{
                ID: 'id',
                content: 'content',
                name: false,
                property: true,
                title: false
            }]
        });

        assert.deepEqual(result, [
            {
                'ID': 'id',
                'content': 'content',
                'name': false,
                'property': true,
                'title': false
            }
        ]);
    });
});
