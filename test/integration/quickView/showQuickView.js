var assert = require('chai').assert;
var request = require('request');
var config = require('../it.config');

describe('Product-ShowQuickView', function () {
    this.timeout(5000);

    var variantPid = '708141676220M';

    var myGetRequest = {
        url: '',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    it('should return renderedTemplate and productURL', function (done) {
        var urlEndPoint = config.baseUrl + '/Product-ShowQuickView';
        var urlWithVpid = urlEndPoint + '?pid=' + variantPid;

        myGetRequest.url = urlWithVpid;

        request(myGetRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

            var bodyAsJson = JSON.parse(response.body);

            assert.isNotNull(bodyAsJson.renderedTemplate);
            assert.isString(bodyAsJson.renderedTemplate);
            assert.isNotNull(bodyAsJson.productUrl);
            assert.isString(bodyAsJson.productUrl);
            assert.isString(bodyAsJson.closeButtonText);
            assert.isString(bodyAsJson.enterDialogMessage);

            done();
        });
    });
});
