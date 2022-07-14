'use strict';

var resource = require('dw/web/Resource');
var secureEncoder = require('dw/util/SecureEncoder');

/**
 * Function to conver <dw.web.FormField> object to plain JS object.
 * @param  {dw.web.FormField} field original formField object.
 * @return {Object} Plain JS object representing formField.
 */
function formField(field) {
    var result = {};
    Object.defineProperty(result, 'attributes', {
        get: function () {
            var attributes = '';
            attributes += 'name="' + result.htmlName + '"';
            if (result.mandatory) {
                attributes += ' required';
                attributes += ' aria-required="true"';
            }
            if (field.options && field.options.optionsCount > 0) {
                return attributes;
            }

            if (field.type === field.FIELD_TYPE_BOOLEAN && result.checked) {
                attributes += ' checked="' + result.checked + '"';
            }

            var value = field.htmlValue == null ? '' : field.htmlValue;
            attributes += ' value="' + secureEncoder.forHtmlInDoubleQuoteAttribute(value) + '"';

            if (result.maxValue) {
                attributes += ' max="' + result.maxValue + '"';
            }
            if (result.minValue) {
                attributes += ' min="' + result.minValue + '"';
            }
            if (result.maxLength) {
                attributes += ' maxLength="' + result.maxLength + '"';
            }
            if (result.minLength) {
                attributes += ' minLength="' + result.minLength + '"';
            }
            if (result.regEx) {
                attributes += ' pattern="' + result.regEx + '"';
            }
            return attributes;
        }
    });
    Object.defineProperty(result, 'value', {
        configurable: true,
        get: function () {
            return field.value;
        },
        set: function (value) {
            field.value = value; // eslint-disable-line no-param-reassign
            // reset htmlValue
            result.htmlValue = field.htmlValue || '';
        }
    });
    var attributesToCopy = {
        string: ['maxLength', 'minLength', 'regEx'],
        bool: ['checked', 'selected'],
        int: ['maxValue', 'minValue'],
        common: ['htmlValue', 'mandatory',
            'dynamicHtmlName', 'htmlName', 'valid'
        ],
        resources: ['error', 'description', 'label']
    };

    if (field.type === field.FIELD_TYPE_BOOLEAN && field.mandatory && !field.checked) {
        field.invalidateFormElement();
    }

    attributesToCopy.common.forEach(function (item) {
        if (item !== 'valid') {
            result[item] = field[item] || '';
        } else {
            result.valid = field.valid;
        }
    });

    attributesToCopy.resources.forEach(function (item) {
        if (field[item]) {
            result[item] = resource.msg(field[item], 'forms', null);
        }
    });

    if (field.options && field.options.optionsCount > 0) {
        result.options = [];
        for (var i = 0, l = field.options.optionsCount; i < l; i++) {
            result.options.push({
                checked: field.options[i].checked,
                htmlValue: field.options[i].htmlValue,
                label: field.options[i].label
                    ? resource.msg(field.options[i].label, 'forms', null)
                    : '',
                id: field.options[i].optionId,
                selected: field.options[i].selected,
                value: field.options[i].value
            });
        }

        result.selectedOption = field.selectedOption ? field.selectedOption.optionId : '';
    }

    switch (field.type) {
        case field.FIELD_TYPE_BOOLEAN:
            attributesToCopy.bool.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        case field.FIELD_TYPE_DATE:
        case field.FIELD_TYPE_INTEGER:
        case field.FIELD_TYPE_NUMBER:
            attributesToCopy.int.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        case field.FIELD_TYPE_STRING:
            attributesToCopy.string.forEach(function (item) {
                result[item] = field[item];
            });
            break;
        default:
            break;
    }

    result.formType = 'formField';

    return result;
}

module.exports = formField;
