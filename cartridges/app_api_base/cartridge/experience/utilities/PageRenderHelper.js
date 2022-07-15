'use strict';

/* global request, dw*/

var RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

module.exports = {
    /**
     * Assembles the page meta data.
     *
     * @param {dw.experience.Page} page The page object
     *
     * @returns {dw.web.PageMetaData} The page meta data
     */
    getPageMetaData: function getPageMetaData(page) {
        var computedMetaData = {
            title: page.pageTitle,
            description: page.pageDescription,
            keywords: page.pageKeywords,
            pageMetaTags: []
        };

        request.pageMetaData.pageMetaTags.forEach(function (item) {
            if (item.title) {
                computedMetaData.title = item.content;
            } else if (item.name && item.ID === 'description') {
                computedMetaData.description = item.content;
            } else if (item.name && item.ID === 'keywords') {
                computedMetaData.keywords = item.content;
            } else {
                computedMetaData.pageMetaTags.push(item);
            }
        });

        return computedMetaData;
    },

    /**
     * Returns the RegionModel registry for a given container (Page or Component).
     *
     * @param {dw.experience.Page|dw.experience.Component} container a component or page object
     * @param {string} containerType components or pages
     *
     * @returns {experience.utilities.RegionModelRegistry} The container regions
     */
    getRegionModelRegistry: function getRegionModelRegistry(container) {
        var containerType;
        if (container && container instanceof dw.experience.Page) {
            containerType = 'pages';
        } else if (container && container instanceof dw.experience.Component) {
            containerType = 'components';
        } else {
            return null;
        }
        var metaDefinition = require('*/cartridge/experience/' + containerType + '/' + container.typeID.replace(/\./g, '/') + '.json');

        return new RegionModelRegistry(container, metaDefinition);
    },

    /**
     * Returns true if page is rendered via editor UI and false in the storefront
     * @returns {boolean} The container regions
     */
    isInEditMode: function isInEditMode() {
        return request.httpPath.indexOf('__SYSTEM__Page-Show') > 0;
    },

    /**
     * Returns a css safe string of a given input string
     * @param {string} input a css class name.
     * @return {string} css
     */
    safeCSSClass: function (input) {
        return encodeURIComponent(input.toLowerCase()).replace(/%[0-9A-F]{2}/gi, '');
    }

};
