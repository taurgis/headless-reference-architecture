'use strict';

// mocking ~/cartridge/scripts/renderTemplateHelper

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var templateStub = sinon.stub();

templateStub.returns({
    render: function () {
        return { text: 'rendered html' };
    }
});

function proxyModel() {
    return proxyquire('../../../cartridges/app_storefront_base/cartridge/scripts/renderTemplateHelper', {
        'dw/util/Template': templateStub,
        'dw/util/HashMap': function () {
            return {
                result: {},
                put: function (key, context) {
                    this.result[key] = context;
                }
            };
        }
    });
}

module.exports = {
    templateStub: templateStub,
    proxyModel: proxyModel
};
