'use strict';

module.exports = function (action) {
    return {
        description: action.description || null,
        label: action.label || null,
        submitted: action.submitted,
        triggered: action.triggered,
        formType: 'formAction'
    };
};
