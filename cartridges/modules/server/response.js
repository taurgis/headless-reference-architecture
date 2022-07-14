'use strict';

var assign = require('./assign');
var httpHeadersConfig = require('*/cartridge/config/httpHeadersConf');

/**
 * @constructor
 * @classdesc Creates writtable response object
 *
 * @param {Object} response - Global response object
 */
function Response(response) {
    this.view = null;
    this.viewData = {};
    this.redirectUrl = null;
    this.redirectStatus = null;
    this.messageLog = [];
    this.base = response;
    this.cachePeriod = null;
    this.cachePeriodUnit = null;
    this.personalized = false;
    this.renderings = [];
    httpHeadersConfig.forEach(function (httpHeader) {
        this.setHttpHeader(httpHeader.id, httpHeader.value);
    }, this);
}

/**
 * Stores a list of rendering steps.
 * @param {Array} renderings - The array of rendering steps
 * @param {Object} object - An object containing what type to render
 * @returns {void}
 */
function appendRenderings(renderings, object) {
    var hasRendering = false;

    if (renderings.length) {
        for (var i = renderings.length - 1; i >= 0; i--) {
            if (renderings[i].type === 'render') {
                renderings[i] = object; // eslint-disable-line no-param-reassign
                hasRendering = true;
                break;
            }
        }
    }

    if (!hasRendering) {
        renderings.push(object);
    }
}

Response.prototype = {
    /**
     * Stores template name and data for rendering at the later time
     * @param {string} name - Path to a template
     * @param {Object} data - Data to be passed to the template
     * @returns {void}
     */
    render: function render(name, data) {
        this.view = name;
        this.viewData = assign(this.viewData, data);

        appendRenderings(this.renderings, { type: 'render', subType: 'isml', view: name });
    },
    /**
     * Stores data to be rendered as json
     * @param {Object} data - Data to be rendered as json
     * @returns {void}
     */
    json: function json(data) {
        this.isJson = true;
        this.viewData = assign(this.viewData, data);

        appendRenderings(this.renderings, { type: 'render', subType: 'json' });
    },
    /**
     * Stores data to be rendered as XML
     * @param {string} xmlString - The XML to print.
     * @returns {void}
     */
    xml: function xml(xmlString) {
        this.isXml = true;
        this.viewData = assign(this.viewData, { xml: xmlString });

        appendRenderings(this.renderings, { type: 'render', subType: 'xml' });
    },
    /**
     * Stores data to be rendered as a page designer page
     * @param {string} page - ID of the page to be rendered
     * @param {Object} data - Data to be passed to the template
     * @param {dw.util.HashMap} aspectAttributes - (optional) aspect attributes to be passed to the PageMgr
     * @returns {void}
     */
    page: function (page, data, aspectAttributes) {
        this.viewData = assign(this.viewData, data);
        appendRenderings(this.renderings, { type: 'render', subType: 'page', page: page, aspectAttributes: aspectAttributes });
    },
    /**
     * Redirects to a given url right away
     * @param {string} url - Url to be redirected to
     * @returns {void}
     */
    redirect: function redirect(url) {
        this.redirectUrl = url;
    },
    /**
     * Sets an optional redirect status, standard cases being 301 or 302.
     * @param {string} redirectStatus - HTTP redirect status code
     * @returns {void}
     */
    setRedirectStatus: function setRedirectStatus(redirectStatus) {
        this.redirectStatus = redirectStatus;
    },
    /**
     * Get data that was setup for a template
     * @returns {Object} Data for the template
     */
    getViewData: function () {
        return this.viewData;
    },
    /**
     * Updates data for the template
     * @param {Object} data - Data for template
     * @returns {void}
     */
    setViewData: function (data) {
        this.viewData = assign(this.viewData, data);
    },
    /**
     * Logs information for output on the error page
     * @param {string[]} arguments - List of items to be logged
     * @returns {void}
     */
    log: function log() {
        var args = Array.prototype.slice.call(arguments);

        var output = args.map(function (item) {
            if (typeof item === 'object' || Array.isArray(item)) {
                return JSON.stringify(item);
            }
            return item;
        });

        this.messageLog.push(output.join(' '));
    },
    /**
     * Set content type for the output
     * @param {string} type - Type of the output
     * @returns {void}
     */
    setContentType: function setContentType(type) {
        this.base.setContentType(type);
    },

    /**
     * Set status code of the response
     * @param {int} code - Valid HTTP return code
     * @returns {void}
     */
    setStatusCode: function setStatusCode(code) {
        this.base.setStatus(code);
    },

    /**
     * creates a print step to the renderings
     * @param {string} message - Message to be printed
     * @returns {void}
     */
    print: function print(message) {
        this.renderings.push({ type: 'print', message: message });
    },

    /**
     * Sets current page cache expiration period value in hours
     * @param  {int} period Number of hours from current time
     * @return {void}
     */
    cacheExpiration: function cacheExpiration(period) {
        this.cachePeriod = period;
    },

    /**
     * Adds a response header with the given name and value
     * @param  {string} name - the name to use for the response header
     * @param  {string} value - the value to use
     * @return {void}
     */
    setHttpHeader: function setHttpHeader(name, value) {
        this.base.setHttpHeader(name, value);
    }

};

module.exports = Response;
