var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('ContactUs-Subscribe', function () {
    this.timeout(25000);

    var cookieJar = request.jar();

    var myRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    myRequest.url = config.baseUrl + '/ContactUs-Subscribe';

    it('should successfully subscribe to contact us with valid email', function () {
        myRequest.form = {
            contactFirstName: 'Jane',
            contactLastName: 'Smith',
            contactEmail: 'JaneSmith@abc.com',
            contactTopic: 'OS',
            contactComment: 'Where is my order?'
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add coupon request statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.msg, 'Subscribe to contact us success');
            });
    });

    it('should error on subscribe to contact us with invalid email', function () {
        myRequest.form = {
            contactFirstName: 'Jane',
            contactLastName: 'Smith',
            contactEmail: 'JaneSmith@abc',
            contactTopic: 'OS',
            contactComment: 'Where is my order?'
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected add coupon request statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                assert.isTrue(bodyAsJson.error);
                assert.equal(bodyAsJson.msg, 'Please provide a valid email Id');
            });
    });
});
