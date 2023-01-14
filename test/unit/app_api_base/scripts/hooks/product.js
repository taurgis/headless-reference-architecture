'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let isSCAPI = true;

const product = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/hooks/product', {
    '*/cartridge/scripts/helpers/seoHelper': {
        getPageMetaTags: () => {
            return { 'test': 'test' };
        }
    }
});

describe('modifyGETResponse', function () {
    before(function () {
        global.request = {
            isSCAPI: () => {
                return isSCAPI;
            }
        };
    });

    beforeEach(function () {
        isSCAPI = true;
    });

    it('should return product with metadata', function () {
        const dwProduct = {};
        const productResponse = {};

        product.modifyGETResponse(dwProduct, productResponse);

        assert.equal(productResponse.c_metadata.test, 'test');
    });

    it('should not return product with metadata if the request is not from the SCAPI', function () {
        const dwProduct = {};
        const productResponse = {};
        isSCAPI = false;

        product.modifyGETResponse(dwProduct, productResponse);

        assert.equal(productResponse.c_metadata, undefined);
    });
});
