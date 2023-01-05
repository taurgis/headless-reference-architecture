/* eslint-disable no-param-reassign, consistent-return */

'use strict';

/**
 * Add customisations to the Product response.
 *
 * @param {dw.product.Product} dwProduct - The product
 * @param {ObjectProduct} product - Document representing a product
 */
exports.modifyGETResponse = function (dwProduct, product) {
    var seoHelper = require('*/cartridge/scripts/helpers/seoHelper');

    product.c_metadata = seoHelper.getPageMetaTags(dwProduct);
};
