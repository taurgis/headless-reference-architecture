'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');

describe('render', function () {
    var render = null;

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
        render = require('../../../../cartridges/modules/server/render');
    });

    afterEach(function () {
        response.base.writer.print.reset();
        response.setContentType.reset();
        response.viewData = {};
        response.renderings = [];
    });

    it('should render a json output', function () {
        response.renderings.push({ type: 'render', subType: 'json' });
        response.viewData = { name: 'value' };
        render.applyRenderings(response);

        assert.isTrue(response.setContentType.calledWith('application/json'));
        assert.isTrue(response.base.writer.print.calledOnce);
    });

    it('should print output', function () {
        response.renderings.push({ type: 'print', message: 'crazyMessage' });
        render.applyRenderings(response);

        assert.isTrue(response.base.writer.print.calledOnce);
        assert.isTrue(response.base.writer.print.calledWith('crazyMessage'));
    });

    it('should render error page when template failed', function () {
        var renderMock = require('../../../../cartridges/modules/server/render');

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
