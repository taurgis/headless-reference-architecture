'use strict';

/* eslint-disable no-param-reassign */

/**
 * Add customisations to the Search response.
 *
 * @param {{query: string, c_searchRedirect: string}} searchResponse - Document representing a product search result.
 * @returns {dw.system.status} - The status of the result (OK or Error)
 */
exports.modifyGETResponse = function (searchResponse) {
    var Status = require('dw/system/Status');

    if (request.isSCAPI()) {
        try {
            var productSearchHelpers = require('../helpers/productSearchHelper');

            if (searchResponse.query) {
                var redirectResult = productSearchHelpers.getSearchRedirectInformation(searchResponse.query);

                if (redirectResult) {
                    // We can only add custom attributes on a "Hit"
                    var newHits = [{
                        c_redirect: redirectResult
                    }];

                    searchResponse.hits = newHits;

                    // Clean the response
                    searchResponse.count = 1;
                    searchResponse.total = 1;
                    delete searchResponse.refinements;
                    delete searchResponse.sortingOptions;
                    delete searchResponse.searchPhraseSuggestions;

                    // No need to do any other customisations, end the hook.
                    return new Status(Status.OK);
                }
            }

            if (searchResponse.count > 0) {
                var hits = searchResponse.hits.toArray();

                hits.forEach(function (hit) {
                    if (hit.represented_product) {
                        hit.c_extend = productSearchHelpers.createExtendedProduct(hit.represented_product.id);
                    }
                });
            }
        } catch (e) {
            return new Status(Status.ERROR, 'ERR-SEARCH-01', e.message);
        }
    }

    return new Status(Status.OK);
};