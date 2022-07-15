'use strict';

/**
 * @namespace PageDesigner
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var Resource = require('dw/web/Resource');

/**
 * PageDesigner-Serialize : This endpoint can be used to get the serialized version of a Single Page Designer Page
 * @name Base/PageDesigner-Serialize
 * @function
 * @memberof PageDesigner
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('Serialize', cache.applyDefaultCache, function (req, res, next) {
    var PageMgr = require('dw/experience/PageMgr');
    var resultPage = null;

    if (req.querystring && req.querystring.pageId) {
        if (req.querystring.categoryId && req.querystring.aspectTypeId) {
            var CatalogMgr = require('dw/catalog/CatalogMgr');
            var category = CatalogMgr.getCategory(req.querystring.categoryId);

            resultPage = PageMgr.getPageByCategory(category, true, req.querystring.aspectTypeId);
        } else if (req.querystring.productId && req.querystring.aspectTypeId) {
            var ProductMgr = require('dw/catalog/ProductMgr');
            var product = ProductMgr.getProduct(req.querystring.productId);

            resultPage = PageMgr.getPageByProduct(product, true, req.querystring.aspectTypeId);
        } else {
            resultPage = PageMgr.getPage(req.querystring.pageId);
        }
    }

    if (resultPage) {
        res.print(PageMgr.serializePage(resultPage.ID, null));
    } else {
        res.setStatusCode(404);
        res.json({
            error: Resource.msg('global.error.general', 'error', null),
            message: Resource.msg('error.unknownpage', 'pagedesigner', null),
            query: req.querystring
        });
    }

    next();
});

module.exports = server.exports();
