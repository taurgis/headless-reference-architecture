'use strict';

/**
 * Gets page meta tags to support rule based meta data
 *
 * @param {Object} object - object which contains page meta tags
 *
 * @returns {Array<{ID: string, content:string, name:boolean, property:boolean, title:boolean}>} - The configured Page Meta Tags
 */
function getPageMetaTags(object) {
    if (object === null) {
        return null;
    }

    if ('pageMetaTags' in object) {
        return object.pageMetaTags.map(function (pageMetaTag) {
            return {
                ID: pageMetaTag.ID,
                content: pageMetaTag.content,
                name: pageMetaTag.name,
                property: pageMetaTag.property,
                title: pageMetaTag.title
            };
        });
    }

    return null;
}

module.exports = {
    getPageMetaTags: getPageMetaTags
};
