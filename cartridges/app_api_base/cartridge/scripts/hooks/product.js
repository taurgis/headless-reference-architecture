/* eslint-disable no-param-reassign, consistent-return */

'use strict';

/**
 * Add customisations to the Product response.
 *
 * @param {dw.catalog.Product} dwProduct - The product
 * @param {Object} product - Document representing a product
 */
exports.modifyGETResponse = function (dwProduct, product) {
    if (request.isSCAPI()) {
        var seoHelper = require('*/cartridge/scripts/helpers/seoHelper');

        product.c_metadata = seoHelper.getPageMetaTags(dwProduct);
    }
};
