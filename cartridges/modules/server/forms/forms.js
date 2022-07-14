'use strict';

var field = require('./formField');
var action = require('./formAction');

/**
 * Convert dw.web.Form or dw.web.FormGroup to plain JS object
 * @param  {dw.web.Form|dw.web.FormGroup} form Form to be parsed
 * @return {Object} Plain JS form object
 */
function parseForm(form) {
    var formField = require('dw/web/FormField');
    var formAction = require('dw/web/FormAction');
    var formGroup = require('dw/web/FormGroup');
    var result = {
        valid: form.valid,
        htmlName: form.htmlName,
        dynamicHtmlName: form.dynamicHtmlName,
        error: form.error || null,
        attributes: 'name = "' + form.htmlName + '" id = "' + form.htmlName + '"',
        formType: 'formGroup'
    };
    Object.keys(form).forEach(function (key) {
        if (form[key] instanceof formField) {
            result[key] = field(form[key]);
        } else if (form[key] instanceof formAction) {
            result[key] = action(form[key]);
        } else if (form[key] instanceof formGroup) {
            result[key] = parseForm(form[key]);
        }
    });

    return result;
}

/**
 * Copy the values of an object to form
 * @param {Object} object - the object to set the new form values to
 * @param  {dw.web.Form|dw.web.FormGroup} currentForm - Form to be parsed
 */
function copyObjectToForm(object, currentForm) {
    Object.keys(currentForm).forEach(function (key) {
        if (currentForm[key] && currentForm[key].formType === 'formGroup') {
            copyObjectToForm(object, currentForm[key]);
        } else if (object[key] && !Object.hasOwnProperty.call(currentForm[key], 'options')) {
            currentForm[key].value = object[key]; // eslint-disable-line no-param-reassign
        } else if (object[key] && Object.hasOwnProperty.call(currentForm[key], 'options')) {
            currentForm[key].options.forEach(function (option) {
                if (option.value === object[key]) {
                    option.selected = true; // eslint-disable-line no-param-reassign
                }
            });
        }
    });
}

/**
 * Get values of a formGroup to object
 * @param {dw.web.FormGroup} formGroup - Form group
 * @param {string} name - The name of the formGroup
 * @return {Object} Object with nested values
 */
function findValue(formGroup, name) {
    var ObjectWrapper = {};
    ObjectWrapper[name] = {};

    Object.keys(formGroup).forEach(function (key) {
        var formField = formGroup[key];
        if (formField instanceof Object) {
            if (formField.formType === 'formField') {
                ObjectWrapper[name][key] = formField.value;
            } else if (formField.formType === 'formGroup') {
                ObjectWrapper[name][key] = findValue(formField, key)[key];
            }
        }
    });

    return ObjectWrapper;
}

module.exports = function (session) {
    return {
        getForm: function (name) {
            var currentForm = session.forms[name];
            var result = parseForm(currentForm);
            result.base = currentForm;
            result.clear = function () {
                currentForm.clearFormElement();
                var clearedForm = parseForm(currentForm);
                Object.keys(clearedForm).forEach(function (key) {
                    this[key] = clearedForm[key];
                }, this);
            };
            result.copyFrom = function (object) {
                copyObjectToForm(object, result);
            };
            result.toObject = function () {
                var formObj = {};
                var form = this;
                Object.keys(form).forEach(function (key) {
                    var formField = form[key];
                    if (typeof form[key] !== 'function'
                        && formField instanceof Object) {
                        if (formField.formType === 'formField') {
                            formObj[key] = formField.value;
                        } else if (formField.formType === 'formGroup') {
                            var nested = findValue(formField, key);
                            formObj[key] = nested[key];
                        }
                    }
                });
                return formObj;
            };
            return result;
        }
    };
};
