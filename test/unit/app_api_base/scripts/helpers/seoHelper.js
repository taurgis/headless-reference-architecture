'use strict';

const assert = require('chai').assert;

const seoHelper = require('../../../../../cartridges/app_api_base/cartridge/scripts/helpers/seoHelper');

describe('getPageMetaTags', () => {
    it('should return null when no object is passed', () => {
        const result = seoHelper.getPageMetaTags();

        assert.isNull(result);
    });

    it('should return null when an object is passed without the "pageMetaTags" attribute', () => {
        const result = seoHelper.getPageMetaTags({ });

        assert.isNull(result);
    });

    it('should return an array of formatted tags when an object is passed with the "pageMetaTags" attribute', () => {
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
