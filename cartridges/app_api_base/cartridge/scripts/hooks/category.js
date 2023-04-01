/* eslint-disable no-param-reassign, consistent-return */

'use strict';

/**
 * Add customisations to the Category response.
 *
 * @param {dw.catalog.Category} dwCategory - The category
 * @param {Object} category - Document representing a category
 */
exports.modifyGETResponse = function (dwCategory, category) {
    if (request.isSCAPI()) {
        var productSearchHelper = require('*/cartridge/scripts/helpers/productSearchHelper');

        category.c_metadata = productSearchHelper.getCategoryMetaData(dwCategory);
    }
};
