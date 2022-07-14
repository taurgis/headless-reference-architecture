'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

describe('render', function () {
    var render = null;
    var ismlRender = sinon.spy();
    var pageDesignerRender = sinon.spy();

    var response = {
        base: {
            writer: {
                print: sinon.spy()
            }
        },
        setContentType: sinon.spy(),
        viewData: {},
        renderings: [],
        view: null
    };

    beforeEach(function () {
        global.XML = function (xmlString) {
            var parseString = require('xml2js').parseString;

            return parseString(xmlString, 'text/xml', function (error) {
                if (error) {
                    throw new Error(error);
                }
            });
        };

        render = proxyquire('../../../../cartridges/modules/server/render', {
            'dw/template/ISML': {
                renderTemplate: ismlRender
            },
            'dw/experience/PageMgr': {
                renderPage: pageDesignerRender
            }
        });
    });

    afterEach(function () {
        ismlRender.reset();
        pageDesignerRender.reset();
        response.base.writer.print.reset();
        response.setContentType.reset();
        response.viewData = {};
        response.renderings = [];
    });

    it('should correctly render a template', function () {
        response.renderings.push({ type: 'render', subType: 'isml', view: 'name' });
        render.applyRenderings(response);

        assert.isTrue(ismlRender.calledOnce);
    });

    it('should pass data correctly to the view', function () {
        response.renderings.push({ type: 'render', subType: 'isml', view: 'template' });
        response.viewData = { name: 'value' };
        render.applyRenderings(response);

        assert.isTrue(ismlRender.calledWith('template', sinon.match({ name: 'value' })));
    });

    it('should correctly render a page', function () {
        response.renderings.push({ type: 'render', subType: 'page', page: 'page' });
        render.applyRenderings(response);

        assert.isTrue(pageDesignerRender.calledOnce);
    });

    it('should pass data correctly to the view of the page being rendered', function () {
        response.renderings.push({ type: 'render', subType: 'page', page: 'page2' });
        response.viewData = { decorator: 'decorator' };
        render.applyRenderings(response);

        assert.isTrue(response.base.writer.print.calledOnce);
        assert.isTrue(pageDesignerRender.calledWith('page2', '{"decorator":"decorator"}'));
    });

    it('should render a json output', function () {
        response.renderings.push({ type: 'render', subType: 'json' });
        response.viewData = { name: 'value' };
        render.applyRenderings(response);


        assert.isTrue(response.setContentType.calledWith('application/json'));
        assert.isTrue(response.base.writer.print.calledOnce);
    });

    it('should render valid xml output', function () {
        response.renderings.push({ type: 'render', subType: 'xml' });
        response.viewData = {
            key1: 'value1',
            key2: 'value2',
            xml: '<xmlKey></xmlKey>'
        };

        render.applyRenderings(response);

        assert.isTrue(response.setContentType.calledWith('application/xml'));
        assert.isTrue(response.base.writer.print.calledOnce);
    });

    it('should throw an exception when invalid XML is provided', function () {
        response.renderings.push({ type: 'render', subType: 'xml' });
        response.viewData = { xml: '<x>I am not valid XML<y>' };

        try {
            render.applyRenderings(response);
        } catch (e) {
            assert.isNotNull(e);
        }
    });

    it('should print output', function () {
        response.renderings.push({ type: 'print', message: 'crazyMessage' });
        render.applyRenderings(response);

        assert.isTrue(response.base.writer.print.calledOnce);
        assert.isTrue(response.base.writer.print.calledWith('crazyMessage'));
    });

    it('should render error page when template failed', function () {
        var renderMock = proxyquire('../../../../cartridges/modules/server/render', {
            'dw/template/ISML': {
                renderTemplate: function () {
                    throw new Error('hello');
                }
            },
            'dw/experience/PageMgr': {
                renderPage: function () {
                    throw new Error('Hello Darkness');
                }
            }
        });

        response.renderings.push({ type: 'render', subType: 'isml', view: 'template' });

        try {
            renderMock.applyRenderings(response);
        } catch (e) {
            assert.isNotNull(e);
        }
    });

    it('should throw error when no rendering step has been called', function () {
        try {
            render.applyRenderings(response);
        } catch (e) {
            assert.isNotNull(e);
        }
    });

    it('should throw error when unidentified Type', function () {
        response.renderings.push({ type: 'blah', subType: 'blah', view: 'template' });

        try {
            render.applyRenderings(response);
        } catch (e) {
            assert.isNotNull(e);
        }
    });

    it('should throw error when unidentified subType', function () {
        response.renderings.push({ type: 'render', subType: 'blah', view: 'template' });

        try {
            render.applyRenderings(response);
        } catch (e) {
            assert.isNotNull(e);
        }
    });
});
