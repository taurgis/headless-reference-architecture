'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var Response = proxyquire('../../../../cartridges/modules/server/response', {
    '*/cartridge/config/httpHeadersConf': [
        {
            'id': 'someName',
            'value': 'someValue'
        }
    ]
});

var res = {
    redirect: function () {},
    setHttpHeader: sinon.spy(),
    setContentType: sinon.spy(),
    setStatus: sinon.spy()
};

describe('response', function () {
    it('should create response object with passed-in base', function () {
        var response = new Response(res);
        assert.property(response, 'base');
        assert.property(response.base, 'redirect');
    });

    it('should correctly set view and viewData', function () {
        var response = new Response(res);
        response.render('test', { name: 'value' });
        assert.equal(response.view, 'test');
        assert.equal(response.viewData.name, 'value');
    });

    it('should extend viewData', function () {
        var response = new Response(res);
        response.setViewData({ name: 'value' });
        response.setViewData({ foo: 'bar' });
        response.render('test', { name: 'test' });
        assert.equal(response.viewData.name, 'test');
        assert.equal(response.viewData.foo, 'bar');
    });

    it('should correctly store a page rendering and set viewData', function () {
        var response = new Response(res);
        response.page('test', { name: 'value' });
        assert.equal(response.viewData.name, 'value');
        assert.equal(response.renderings.length, 1);
        assert.deepEqual(response.renderings[0], {
            type: 'render', subType: 'page', page: 'test', aspectAttributes: undefined
        });
    });

    it('should correctly store a page rendering with aspectAttributes and set viewData', function () {
        var response = new Response(res);
        response.page('test', { name: 'value' }, { test: 'foo' });
        assert.equal(response.viewData.name, 'value');
        assert.equal(response.renderings.length, 1);
        assert.deepEqual(response.renderings[0], {
            type: 'render', subType: 'page', page: 'test', aspectAttributes: { test: 'foo' }
        });
    });

    it('should extend viewData for page', function () {
        var response = new Response(res);
        response.setViewData({ name: 'value' });
        response.setViewData({ foo: 'bar' });
        response.page('page', { name: 'test' });
        assert.equal(response.viewData.name, 'test');
        assert.equal(response.viewData.foo, 'bar');
    });

    it('should not extend viewData with non-objects', function () {
        var response = new Response(res);
        response.setViewData({ name: 'value' });
        response.setViewData(function () {});
        assert.equal(response.viewData.name, 'value');
    });

    it('should correctly set json', function () {
        var response = new Response(res);
        response.json({ name: 'value' });
        assert.isTrue(response.isJson);
        assert.equal(response.viewData.name, 'value');
    });

    it('should correctly set xml', function () {
        var response = new Response(res);
        response.xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
        assert.isTrue(response.isXml);
        assert.equal(response.viewData.xml, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
    });

    it('should correctly set url', function () {
        var response = new Response(res);
        response.redirect('hello');
        assert.equal(response.redirectUrl, 'hello');
    });

    it('should correctly set redirect status', function () {
        var response = new Response(res);
        response.setRedirectStatus('301');
        assert.equal(response.redirectStatus, '301');
    });

    it('should set and retrieve data', function () {
        var response = new Response(res);
        response.setViewData({ name: 'value' });
        assert.equal(response.getViewData().name, 'value');
    });

    it('should log item', function () {
        var response = new Response(res);
        response.log('one', 'two', 'three');
        assert.equal(response.messageLog.length, 1);
        assert.equal(response.messageLog[0], 'one two three');
    });

    it('should convert log item to json', function () {
        var response = new Response(res);
        response.log({ name: 'value' });
        assert.equal(response.messageLog.length, 1);
        assert.equal(response.messageLog[0], '{"name":"value"}');
    });

    it('should try to print out a message', function () {
        var response = new Response(res);
        response.print('hello');

        assert.equal(response.renderings.length, 1);
        assert.equal(response.renderings[0].type, 'print');
        assert.equal(response.renderings[0].message, 'hello');
    });

    it('should set http header', function () {
        var response = new Response(res);
        response.setHttpHeader('aName', 'aValue');
        assert.isTrue(res.setHttpHeader.calledWith('aName', 'aValue'));
    });

    it('should set content type', function () {
        var response = new Response(res);
        response.setContentType('text/html');
        assert.isTrue(res.setContentType.calledWith('text/html'));
    });

    it('should set status code', function () {
        var response = new Response(res);
        response.setStatusCode(500);
        assert.isTrue(res.setStatus.calledWith(500));
    });

    it('should set cache expiration for the page', function (done) {
        var response = new Response(res);
        response.cacheExpiration(6);
        assert.equal(6, response.cachePeriod);
        done();
    });

    it('should loop through and append to renderings array', function () {
        var response = new Response(res);
        response.renderings.push({ type: 'render', subType: 'isml' });

        response.json({ name: 'value' });

        assert.isTrue(response.isJson);
        assert.equal(response.viewData.name, 'value');

        assert.equal(response.renderings.length, 1);
        assert.equal(response.renderings[0].type, 'render');
        assert.equal(response.renderings[0].subType, 'json');
    });

    it('should loop through and append to renderings array', function () {
        var response = new Response(res);
        response.renderings.push({ type: 'print' });

        response.json({ name: 'value' });

        assert.equal(response.renderings.length, 2);
        assert.equal(response.renderings[0].type, 'print');

        assert.equal(response.renderings[1].type, 'render');
        assert.equal(response.renderings[1].subType, 'json');
    });
});
