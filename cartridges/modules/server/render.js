'use strict';
/* global XML */

var isml = require('dw/template/ISML');
var PageMgr = require('dw/experience/PageMgr');

/**
 * Render an ISML template
 * @param {string} view - Path to an ISML template
 * @param {Object} viewData - Data to be passed as pdict
 * @param {Object} response - Response object
 * @returns {void}
 */
function template(view, viewData) {
    // create a shallow copy of the data
    var data = {};
    Object.keys(viewData).forEach(function (key) {
        data[key] = viewData[key];
    });

    try {
        isml.renderTemplate(view, data);
    } catch (e) {
        throw new Error(e.javaMessage + '\n\r' + e.stack, e.fileName, e.lineNumber);
    }
}

/**
 * Render JSON as an output
 * @param {Object} data - Object to be turned into JSON
 * @param {Object} response - Response object
 * @returns {void}
 */
function json(data, response) {
    response.setContentType('application/json');
    response.base.writer.print(JSON.stringify(data, null, 2));
}

/**
 * Render XML as an output
 * @param {Object} viewData - Object to be turned into XML
 * @param {Object} response - Response object
 * @returns {void}
 */
function xml(viewData, response) {
    var XML_CHAR_MAP = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
    };

    // Valid XML needs a single root.
    var xmlData = '<response>';

    Object.keys(viewData).forEach(function (key) {
        if (key === 'xml') {
            xmlData += viewData[key];
        } else {
            xmlData +=
                '<' + key + '>' + viewData[key].replace(/[<>&"']/g, function (ch) {
                    return XML_CHAR_MAP[ch];
                }) + '</' + key + '>';
        }
    });

    // Close the root
    xmlData += '</response>';

    response.setContentType('application/xml');

    try {
        response.base.writer.print(new XML(xmlData));
    } catch (e) {
        throw new Error(e.message + '\n\r' + e.stack, e.fileName, e.lineNumber);
    }
}

/**
 * Render a page designer page
 * @param {string} pageID - Path to an ISML template
 * @param {dw.util.HashMap} aspectAttributes - aspectAttributes to be passed to the PageMgr
 * @param {Object} data - Data to be passed
 * @param {Object} response - Response object
 * @returns {void}
 */
function page(pageID, aspectAttributes, data, response) {
    if (aspectAttributes && !aspectAttributes.isEmpty()) {
        response.base.writer.print(PageMgr.renderPage(pageID, aspectAttributes, JSON.stringify(data)));
    } else {
        response.base.writer.print(PageMgr.renderPage(pageID, JSON.stringify(data)));
    }
}

/**
 * Determines what to render
 * @param {Object} res - Response object
 * @returns {void}
 */
function applyRenderings(res) {
    if (res.renderings.length) {
        res.renderings.forEach(function (element) {
            if (element.type === 'render') {
                switch (element.subType) {
                    case 'isml':
                        template(element.view, res.viewData);
                        break;
                    case 'json':
                        json(res.viewData, res);
                        break;
                    case 'xml':
                        xml(res.viewData, res);
                        break;
                    case 'page':
                        page(element.page, element.aspectAttributes, res.viewData, res);
                        break;
                    default:
                        throw new Error('Cannot render template without name or data');
                }
            } else if (element.type === 'print') {
                res.base.writer.print(element.message);
            } else {
                throw new Error('Cannot render template without name or data');
            }
        });
    } else {
        throw new Error('Cannot render template without name or data');
    }
}

module.exports = {
    applyRenderings: applyRenderings
};
