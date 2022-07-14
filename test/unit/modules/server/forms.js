'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('forms', function () {
    var buildObj = function (obj) {
        Object.keys(obj).forEach(function (key) {
            this[key] = obj[key];
        }, this);
    };
    var FormGroup = function (obj) { this.init.call(this, obj); };
    FormGroup.prototype.init = buildObj;
    var FormAction = function (obj) { this.init.call(this, obj); };
    FormAction.prototype.init = buildObj;
    var FormField = function (obj) { this.init.call(this, obj); };
    FormField.prototype.init = buildObj;
    var formsRequire = proxyquire('../../../../cartridges/modules/server/forms/forms', {
        'dw/web/FormField': FormField,
        'dw/web/FormAction': FormAction,
        'dw/web/FormGroup': FormGroup,
        './formField': proxyquire('../../../../cartridges/modules/server/forms/formField', {
            'dw/web/Resource': { msg: function (value) { return value; } },
            'dw/util/SecureEncoder': { forHtmlInDoubleQuoteAttribute: function (something) { return something; } }
        })
    });

    it('should load a form', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    firstName: new FormField({
                        value: 'Jon',
                        htmlValue: 'Jon',
                        valid: true,
                        mandatory: true,
                        htmlName: 'dwfrm_address_firstName',
                        dynamicHtmlName: 'dwfrm_address_firstName_asdf8979asd8f',
                        type: 1,
                        FIELD_TYPE_STRING: 1,
                        label: 'hello',
                        regEx: '/[a-zA-Z]*/',
                        maxLength: 50,
                        minLength: 1
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isTrue(currentForm.valid);
        assert.isNull(currentForm.error);
        assert.equal(currentForm.htmlName, 'dwfrm_address');
        assert.isNotNull(currentForm.firstName);
    });

    it('should load a form with correct string form fields', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    firstName: new FormField({
                        value: 'Jon',
                        htmlValue: 'Jon',
                        valid: true,
                        mandatory: true,
                        htmlName: 'dwfrm_address_firstName',
                        dynamicHtmlName: 'dwfrm_address_firstName_asdf8979asd8f',
                        type: 1,
                        FIELD_TYPE_STRING: 1,
                        label: 'hello',
                        regEx: '/[a-zA-Z]*/',
                        maxLength: 50,
                        minLength: 1
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.firstName);
        assert.equal(currentForm.firstName.value, 'Jon');
        assert.equal(currentForm.firstName.htmlValue, 'Jon');
        assert.isTrue(currentForm.firstName.valid);
        assert.isUndefined(currentForm.firstName.error);
        assert.isTrue(currentForm.firstName.mandatory);
        assert.equal(currentForm.firstName.label, 'hello');
        assert.equal(currentForm.firstName.attributes, 'name="dwfrm_address_firstName" required aria-required="true" value="Jon" maxLength="50" minLength="1" pattern="/[a-zA-Z]*/"');
        assert.equal(currentForm.firstName.formType, 'formField');
    });

    it('should load a form with correct bool form fields', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    boolField: new FormField({
                        value: true,
                        selected: true,
                        checked: true,
                        htmlValue: true,
                        htmlName: 'dwfrm_address_boolField',
                        dynamicHtmlName: 'dwfrm_address_boolField_a89sa7d9f8a7sd',
                        type: 2,
                        FIELD_TYPE_BOOLEAN: 2,
                        valid: false,
                        error: 'Found an issue'
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.boolField);
        assert.equal(currentForm.boolField.value, true);
        assert.equal(currentForm.boolField.htmlValue, true);
        assert.isFalse(currentForm.boolField.valid);
        assert.equal(currentForm.boolField.error, 'Found an issue');
        assert.equal(currentForm.boolField.attributes, 'name="dwfrm_address_boolField" checked="true" value="true"');
        assert.equal(currentForm.boolField.formType, 'formField');
    });

    it('should invalidate bool form field if mandatory flag is true and checked attribute false', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    boolField: new FormField({
                        value: true,
                        selected: false,
                        valid: true,
                        checked: false,
                        htmlValue: true,
                        htmlName: 'dwfrm_address_boolField',
                        dynamicHtmlName: 'dwfrm_address_boolField_a89sa7d9f8a7sd',
                        type: 2,
                        mandatory: true,
                        FIELD_TYPE_BOOLEAN: 2,
                        error: 'Found an issue',
                        invalidateFormElement: function () {
                            this.valid = false;
                        }
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.boolField);
        assert.equal(currentForm.boolField.value, true);
        assert.equal(currentForm.boolField.htmlValue, true);
        assert.equal(currentForm.boolField.formType, 'formField');
        assert.isFalse(currentForm.boolField.valid);
        assert.equal(currentForm.boolField.error, 'Found an issue');
        assert.equal(currentForm.boolField.attributes, 'name="dwfrm_address_boolField" required aria-required="true" value="true"');
    });

    it('should load a form with correct int form fields', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    intField: new FormField({
                        value: null,
                        htmlValue: null,
                        mandatory: true,
                        htmlName: 'dwfrm_address_intField',
                        dynamicHtmlName: 'dwfrm_address_intField_as8df7asd98',
                        type: 3,
                        FIELD_TYPE_INTEGER: 3,
                        maxValue: 999,
                        minValue: 1,
                        valid: true
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.intField);
        assert.equal(currentForm.intField.value, null);
        assert.equal(currentForm.intField.htmlValue, '');
        assert.isTrue(currentForm.intField.valid);
        assert.isUndefined(currentForm.intField.error);
        assert.isTrue(currentForm.intField.mandatory);
        assert.equal(currentForm.intField.attributes, 'name="dwfrm_address_intField" required aria-required="true" value="" max="999" min="1"');
        assert.equal(currentForm.intField.formType, 'formField');
    });

    it('should load a form with correct date form fields', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    dateField: new FormField({
                        value: null,
                        htmlValue: null,
                        mandatory: true,
                        htmlName: 'dwfrm_address_dateField',
                        dynamicHtmlName: 'dwfrm_address_dateField_as8df7asd98',
                        type: 4,
                        FIELD_TYPE_DATE: 4,
                        valid: true
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.dateField);
        assert.equal(currentForm.dateField.value, null);
        assert.equal(currentForm.dateField.htmlValue, '');
        assert.isTrue(currentForm.dateField.valid);
        assert.isUndefined(currentForm.dateField.error);
        assert.isTrue(currentForm.dateField.mandatory);
        assert.equal(currentForm.dateField.attributes, 'name="dwfrm_address_dateField" required aria-required="true" value=""');
        assert.equal(currentForm.dateField.formType, 'formField');
    });

    it('should load a form with correct string form field with options', function () {
        var Options = function () {};
        Options.prototype = [];
        var options = new Options();
        options.push({
            checked: false,
            htmlValue: 'hello',
            optionId: 1,
            selected: false,
            value: 'hello'
        });
        options.push({
            checked: true,
            htmlValue: 'goodbye',
            optionId: 2,
            selected: true,
            value: 'goodbye',
            label: 'label'
        });
        options.optionsCount = 2;
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    firstName: new FormField({
                        value: 'Jon',
                        htmlValue: 'Jon',
                        valid: true,
                        mandatory: true,
                        htmlName: 'dwfrm_address_firstName',
                        dynamicHtmlName: 'dwfrm_address_firstName_asdf8979asd8f',
                        type: 1,
                        FIELD_TYPE_STRING: 1,
                        options: options,
                        selectedOption: {
                            optionId: 2
                        }
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.firstName);
        assert.isNotNull(currentForm.firstName.options);
        assert.equal(currentForm.firstName.options.length, 2);
        assert.equal(currentForm.firstName.options[0].id, 1);
        assert.isFalse(currentForm.firstName.options[0].selected);
        assert.equal(currentForm.firstName.options[1].id, 2);
        assert.isTrue(currentForm.firstName.options[1].selected);
        assert.equal(currentForm.firstName.selectedOption, 2);
        assert.equal(currentForm.firstName.formType, 'formField');
    });

    it('should load a form with correct actions', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    action: new FormAction({
                        submitted: false,
                        triggered: false
                    }),
                    action2: new FormAction({
                        description: 'Some action',
                        label: 'My action',
                        submitted: true,
                        triggered: true
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.action);
        assert.isFalse(currentForm.action.submitted);
        assert.isFalse(currentForm.action.triggered);
        assert.isNull(currentForm.action.description);
        assert.isNotNull(currentForm.action2);
        assert.isTrue(currentForm.action2.submitted);
        assert.isTrue(currentForm.action2.triggered);
        assert.equal(currentForm.action2.description, 'Some action');
        assert.equal(currentForm.action2.label, 'My action');
        assert.equal(currentForm.action.formType, 'formAction');
        assert.equal(currentForm.action2.formType, 'formAction');
    });
    it('should load a form with another form embeded', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    innerForm: new FormGroup({
                        valid: true,
                        error: null,
                        htmlName: 'dwfrm_address_innerForm',
                        dynamicHtmlName: 'dwfrm_address_innerForm_a90a9s8fasd',
                        firstName: new FormField({
                            value: 'Jon',
                            htmlValue: 'Jon',
                            valid: true,
                            mandatory: true,
                            htmlName: 'dwfrm_address_innerForm_firstName',
                            dynamicHtmlName: 'dwfrm_address_innerForm_firstName_asdf8979asd8f',
                            type: 1,
                            FIELD_TYPE_STRING: 1,
                            label: 'hello',
                            regEx: '/[a-zA-Z]*/',
                            maxLength: 50,
                            minLength: 1
                        })
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        assert.isNotNull(currentForm.innerForm.firstName);
        assert.equal(currentForm.innerForm.firstName.value, 'Jon');
        assert.equal(currentForm.innerForm.firstName.htmlValue, 'Jon');
        assert.isTrue(currentForm.innerForm.firstName.valid);
        assert.isUndefined(currentForm.innerForm.firstName.error);
        assert.isTrue(currentForm.innerForm.firstName.mandatory);
        assert.equal(currentForm.innerForm.firstName.label, 'hello');
        assert.equal(currentForm.innerForm.firstName.attributes, 'name="dwfrm_address_innerForm_firstName" required aria-required="true" value="Jon" maxLength="50" minLength="1" pattern="/[a-zA-Z]*/"');
        assert.equal(currentForm.innerForm.formType, 'formGroup');
        assert.equal(currentForm.innerForm.firstName.formType, 'formField');
    });
    it('should return updated attributes after form clear', function () {
        var session = {
            forms: {
                shippingaddress: {
                    valid: true,
                    error: 'null',
                    htmlName: 'dwfrm_shippingaddress',
                    dynamicHtmlName: 'dwfrm_shippingaddress_a98dfa9sd8',
                    intField: new FormField({
                        value: 10,
                        htmlValue: 10,
                        mandatory: true,
                        htmlName: 'dwfrm_shippingaddress_intField',
                        dynamicHtmlName: 'dwfrm_shippingaddress_intField_as8df7asd98',
                        type: 3,
                        FIELD_TYPE_INTEGER: 3,
                        maxValue: 999,
                        minValue: 1,
                        valid: true
                    }),
                    clearFormElement: function () {
                        this.intField.value = 0;
                        this.intField.htmlValue = 0;
                    }
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('shippingaddress');
        assert.equal(currentForm.intField.attributes, 'name="dwfrm_shippingaddress_intField" required aria-required="true" value="10" max="999" min="1"');
        currentForm.clear();
        assert.equal(currentForm.intField.attributes, 'name="dwfrm_shippingaddress_intField" required aria-required="true" value="0" max="999" min="1"');
    });
    it('should update htmlValue when value is updated', function () {
        var session = {
            forms: {
                shippingaddress: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_shippingaddress',
                    dynamicHtmlName: 'dwfrm_shippingaddress_a98dfa9sd8',
                    intField: new FormField({
                        value: 10,
                        htmlValue: 10,
                        mandatory: true,
                        htmlName: 'dwfrm_shippingaddress_intField',
                        dynamicHtmlName: 'dwfrm_shippingaddress_intField_as8df7asd98',
                        type: 3,
                        FIELD_TYPE_INTEGER: 3,
                        maxValue: 999,
                        minValue: 1,
                        valid: true
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('shippingaddress');
        assert.equal(currentForm.intField.htmlValue, 10);
        currentForm.intField.value = 22;
        assert.equal(currentForm.intField.value, 22);
    });

    it('should copy the values of a form to an object', function () {
        var session = {
            forms: {
                shippingaddress: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_shippingaddress',
                    dynamicHtmlName: 'dwfrm_shippingaddress_a98dfa9sd8',
                    intField: new FormField({
                        value: 10,
                        htmlValue: 10,
                        mandatory: true,
                        htmlName: 'dwfrm_shippingaddress_intField',
                        dynamicHtmlName: 'dwfrm_shippingaddress_intField_as8df7asd98',
                        type: 3,
                        FIELD_TYPE_INTEGER: 3,
                        maxValue: 999,
                        minValue: 1,
                        valid: true
                    }),
                    innerForm: new FormGroup({
                        valid: true,
                        error: null,
                        htmlName: 'dwfrm_address_innerForm',
                        dynamicHtmlName: 'dwfrm_address_innerForm_a90a9s8fasd',
                        firstName: new FormField({
                            value: 'Jon',
                            htmlValue: 'Jon',
                            valid: true,
                            mandatory: true,
                            htmlName: 'dwfrm_address_innerForm_firstName',
                            dynamicHtmlName: 'dwfrm_address_innerForm_firstName_asdf8979asd8f',
                            type: 1,
                            FIELD_TYPE_STRING: 1,
                            label: 'hello',
                            regEx: '/[a-zA-Z]*/',
                            maxLength: 50,
                            minLength: 1
                        }),
                        innerForm: new FormGroup({
                            valid: true,
                            error: null,
                            htmlName: 'dwfrm_address_innerForm',
                            dynamicHtmlName: 'dwfrm_address_innerForm_a90a9s8fasd',
                            firstName: new FormField({
                                value: 'Jon',
                                htmlValue: 'Jon',
                                valid: true,
                                mandatory: true,
                                htmlName: 'dwfrm_address_innerForm_firstName',
                                dynamicHtmlName: 'dwfrm_address_innerForm_firstName_asdf8979asd8f',
                                type: 1,
                                FIELD_TYPE_STRING: 1,
                                label: 'hello',
                                regEx: '/[a-zA-Z]*/',
                                maxLength: 50,
                                minLength: 1
                            })
                        })
                    })
                }
            }
        };
        var expectedObject = {
            intField: 10,
            innerForm: {
                firstName: 'Jon',
                innerForm: {
                    firstName: 'Jon'
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('shippingaddress');
        var result = currentForm.toObject();
        assert.deepEqual(expectedObject, result);
    });

    it('should copy the values of an object to a form', function () {
        var session = {
            forms: {
                shippingaddress: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_shippingaddress',
                    dynamicHtmlName: 'dwfrm_shippingaddress_a98dfa9sd8',
                    intField: new FormField({
                        value: 10,
                        htmlValue: 10,
                        mandatory: true,
                        htmlName: 'dwfrm_shippingaddress_intField',
                        dynamicHtmlName: 'dwfrm_shippingaddress_intField_as8df7asd98',
                        type: 3,
                        FIELD_TYPE_INTEGER: 3,
                        maxValue: 999,
                        minValue: 1,
                        valid: true
                    })
                }
            }
        };
        var object = { intField: 22 };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('shippingaddress');
        assert.equal(currentForm.intField.value, 10);
        currentForm.copyFrom(object);
        assert.equal(currentForm.intField.value, 22);
    });
    it('should copy the values of an object to a nested form', function () {
        var session = {
            forms: {
                address: {
                    valid: true,
                    error: null,
                    htmlName: 'dwfrm_address',
                    dynamicHtmlName: 'dwfrm_address_a98dfa9sd8',
                    innerForm: new FormGroup({
                        valid: true,
                        error: null,
                        htmlName: 'dwfrm_address_innerForm',
                        dynamicHtmlName: 'dwfrm_address_innerForm_a90a9s8fasd',
                        firstName: new FormField({
                            value: 'Jon',
                            htmlValue: 'Jon',
                            valid: true,
                            mandatory: true,
                            htmlName: 'dwfrm_address_innerForm_firstName',
                            dynamicHtmlName: 'dwfrm_address_innerForm_firstName_asdf8979asd8f',
                            type: 1,
                            FIELD_TYPE_STRING: 1,
                            label: 'hello',
                            regEx: '/[a-zA-Z]*/',
                            maxLength: 50,
                            minLength: 1
                        })
                    })
                }
            }
        };
        var forms = formsRequire(session);
        var currentForm = forms.getForm('address');
        var object = { firstName: 'Sally' };
        assert.equal(currentForm.innerForm.firstName.value, 'Jon');
        currentForm.copyFrom(object);
        assert.equal(currentForm.innerForm.firstName.value, 'Sally');
    });
});
