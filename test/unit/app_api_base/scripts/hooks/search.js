'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let isSCAPI = true;
let getSearchRedirectInformationResult = null;
let getSearchMetaDataResult = null;
let createExtendedProductResult = null;

const product = proxyquire('../../../../../cartridges/app_api_base/cartridge/scripts/hooks/search', {
    '*/cartridge/scripts/helpers/productSearchHelper': {
        getSearchRedirectInformation: () => {
            return getSearchRedirectInformationResult;
        },
        getSearchMetaData: () => {
            return getSearchMetaDataResult;
        },
        createExtendedProduct: () => {
            return createExtendedProductResult;
        }
    },
    'dw/system/Status': function (type, code) {
        return {
            OK: 1,
            code: code
        };
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
        getSearchRedirectInformationResult = null;
        getSearchMetaDataResult = null;
        createExtendedProductResult = null;
    });

    it('should catch exceptions', function () {
        var result = product.modifyGETResponse();

        assert.equal(result.code, 'ERR-SEARCH-01');
    });

    describe('Search Redirect', function () {
        it('should return search with redirect information', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}],
                count: 2,
                total: 2,
                refinements: [],
                sortingOptions: [],
                searchPhraseSuggestions: []
            };

            getSearchRedirectInformationResult = 'https://www.rhino-inquisitor.com';
            searchResponse.hits.toArray = () => searchResponse.hits;

            var result = product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits.length, 1);
            assert.equal(searchResponse.hits[0].c_redirect, 'https://www.rhino-inquisitor.com');
            assert.equal(searchResponse.count, 1);
            assert.equal(searchResponse.total, 1);
            assert.isUndefined(searchResponse.refinements);
            assert.isUndefined(searchResponse.sortingOptions);
            assert.isUndefined(searchResponse.searchPhraseSuggestions);

            assert.equal(result.OK, 1);
        });

        it('should not return search with redirect information if the request is not from the SCAPI', function () {
            const searchResponse = {
                query: 'rhino'
            };
            getSearchRedirectInformationResult = 'https://www.rhino-inquisitor.com';
            isSCAPI = false;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.c_redirect);
        });

        it('should not return a search with redirect if no redirect has been found', function () {
            const searchResponse = {
                query: 'rhino'
            };
            getSearchRedirectInformationResult = null;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.c_redirect);
        });
    });

    describe('Search Meta Data', function () {
        it('should return search with metadata if there are results on the first hit', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}],
                count: 2,
                total: 2,
                refinements: [],
                sortingOptions: [],
                searchPhraseSuggestions: []
            };

            getSearchMetaDataResult = { 'test': 'test' };
            searchResponse.hits.toArray = () => searchResponse.hits;

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits[0].c_metadata.test, 'test');
        });

        it('should return search with metadata if there are no results as the first hit', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [],
                count: 0,
                total: 0,
                refinements: [],
                sortingOptions: [],
                searchPhraseSuggestions: []
            };

            getSearchMetaDataResult = { 'test': 'test' };

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits[0].c_metadata.test, 'test');
            assert.equal(searchResponse.hits[0].product_id, 'metadata');
        });

        it('should not return search with metadata if the request is not from the SCAPI', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}]
            };
            searchResponse.hits.toArray = () => searchResponse.hits;
            getSearchMetaDataResult = { 'test': 'test' };
            isSCAPI = false;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.hits[0].c_metadata);
        });
    });

    describe('Search Extended Products', function () {
        it('should return search with extended products', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [{
                    represented_product: {
                        id: 'test'
                    }
                },
                {
                    represented_product: {
                        id: 'test2'
                    }
                }],
                count: 2,
                total: 2,
                refinements: [],
                sortingOptions: [],
                searchPhraseSuggestions: []
            };

            searchResponse.hits.toArray = () => searchResponse.hits;

            createExtendedProductResult = { 'test': 'test' };

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits[0].c_extend, createExtendedProductResult);
        });

        it('should not return search with extended products if the request is not from the SCAPI', function () {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}]
            };
            createExtendedProductResult = { 'test': 'test' };
            isSCAPI = false;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.hits[0].c_extend);
        });
    });
});
