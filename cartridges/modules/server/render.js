'use strict';

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
 * Determines what to render
 * @param {Object} res - Response object
 * @returns {void}
 */
function applyRenderings(res) {
    if (res.renderings.length) {
        res.renderings.forEach(function (element) {
            if (element.type === 'render') {
                switch (element.subType) {
                    case 'json':
                        json(res.viewData, res);
                        break;
                    default:
                        throw new Error('Cannot JSON without name or data');
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
