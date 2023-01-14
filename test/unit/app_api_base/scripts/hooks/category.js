'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let isSCAPI = true;

const category = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/hooks/category', {
    '*/cartridge/scripts/helpers/productSearchHelper': {
        getCategoryMetaData: () => {
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

    it('should return category with metadata', function () {
        const dwCategory = {};
        const categoryResponse = {};

        category.modifyGETResponse(dwCategory, categoryResponse);

        assert.equal(categoryResponse.c_metadata.test, 'test');
    });

    it('should not return category with metadata if the request is not from the SCAPI', function () {
        const dwCategory = {};
        const categoryResponse = {};
        isSCAPI = false;

        category.modifyGETResponse(dwCategory, categoryResponse);

        assert.equal(categoryResponse.c_metadata, undefined);
    });
});
