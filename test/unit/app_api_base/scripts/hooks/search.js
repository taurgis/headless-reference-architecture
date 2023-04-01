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

describe('modifyGETResponse', () => {
    before(() => {
        global.request = {
            isSCAPI: () => {
                return isSCAPI;
            }
        };
    });

    beforeEach(() => {
        isSCAPI = true;
        getSearchRedirectInformationResult = null;
        getSearchMetaDataResult = null;
        createExtendedProductResult = null;
    });

    it('should catch exceptions', () => {
        var result = product.modifyGETResponse();

        assert.equal(result.code, 'ERR-SEARCH-01');
    });

    describe('Search Redirect', () => {
        it('should return search with redirect information', () => {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}],
                count: 2,
                total: 2,
                refinements: [],
                sortingOptions: [],
                search_phrase_suggestions: {}
            };

            getSearchRedirectInformationResult = 'https://www.rhino-inquisitor.com';
            searchResponse.hits.toArray = () => searchResponse.hits;

            var result = product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits.length, 2);
            assert.equal(searchResponse.search_phrase_suggestions.c_searchRedirect, 'https://www.rhino-inquisitor.com');
            assert.equal(searchResponse.count, 2);
            assert.equal(searchResponse.total, 2);

            assert.equal(result.OK, 1);
        });

        it('should not return search with redirect information if the request is not from the SCAPI', () => {
            const searchResponse = {
                query: 'rhino',
                search_phrase_suggestions: {}
            };
            getSearchRedirectInformationResult = 'https://www.rhino-inquisitor.com';
            isSCAPI = false;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.search_phrase_suggestions.c_searchRedirect);
        });

        it('should not return a search with redirect if no redirect has been found', () => {
            const searchResponse = {
                query: 'rhino',
                search_phrase_suggestions: {}
            };
            getSearchRedirectInformationResult = null;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.search_phrase_suggestions.c_searchRedirect);
        });
    });

    describe('Search Meta Data', () => {
        it('should return search with metadata if there are results', () => {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}],
                count: 2,
                total: 2,
                refinements: [],
                sortingOptions: [],
                search_phrase_suggestions: {}
            };

            getSearchMetaDataResult = { 'test': 'test' };
            searchResponse.hits.toArray = () => searchResponse.hits;

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.search_phrase_suggestions.c_metadata.test, 'test');
        });

        it('should return search with metadata if there are no results', () => {
            const searchResponse = {
                query: 'rhino',
                hits: [],
                count: 0,
                total: 0,
                refinements: [],
                sortingOptions: [],
                search_phrase_suggestions: {}
            };

            getSearchMetaDataResult = { 'test': 'test' };

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.search_phrase_suggestions.c_metadata.test, 'test');
        });

        it('should not return search with metadata if the request is not from the SCAPI', () => {
            const searchResponse = {
                query: 'rhino',
                hits: [{}, {}],
                search_phrase_suggestions: {}
            };
            searchResponse.hits.toArray = () => searchResponse.hits;
            getSearchMetaDataResult = { 'test': 'test' };
            isSCAPI = false;

            product.modifyGETResponse(searchResponse);

            assert.isUndefined(searchResponse.search_phrase_suggestions.c_metadata);
        });
    });

    describe('Search Extended Products', () => {
        it('should return search with extended products', () => {
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
                search_phrase_suggestions: []
            };

            searchResponse.hits.toArray = () => searchResponse.hits;

            createExtendedProductResult = { 'test': 'test' };

            product.modifyGETResponse(searchResponse);

            assert.equal(searchResponse.hits[0].c_extend, createExtendedProductResult);
        });

        it('should not return search with extended products if the request is not from the SCAPI', () => {
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
