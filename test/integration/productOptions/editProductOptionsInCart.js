var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Edit Product Options for an Option Product in Cart', function () {
    this.timeout(45000);

    var productpid = 'mitsubishi-wd-73736M';
    var quantity = 1;
    var options = [{ 'optionId': 'tvWarranty', 'selectedValueId': '001' }];
    var optionsString = JSON.stringify(options);
    var productuuid;
    var cookieString;

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

    before(function () {
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: productpid,
            quantity: quantity,
            options: optionsString
        };

        return request(myRequest).then(function (response) {
            assert.equal(response.statusCode, 200);
            cookieString = cookieJar.getCookieString(myRequest.url);
            var bodyAsJson = JSON.parse(response.body);
            productuuid = bodyAsJson.cart.items[0].UUID;
        });
    });

    it('should get information including options on the specified product', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Cart-GetProduct?uuid=' + productuuid;

        var cookie = request.cookie(cookieString);
        cookieJar.setCookie(cookie, myRequest.url);

        return request(myRequest).then(function (response) {
            assert.equal(response.statusCode, 200);
            var bodyAsJson = JSON.parse(response.body);
            assert.isNotNull(bodyAsJson.renderedTemplate);
            assert.isString(bodyAsJson.closeButtonText);
            assert.isString(bodyAsJson.enterDialogMessage);
            assert.equal(bodyAsJson.product.options[0].selectedValueId, '001');
            assert.equal(bodyAsJson.selectedOptionValueId, '001');
            assert.equal(bodyAsJson.selectedQuantity, 1);
        });
    });

    it('should edit options of the specified product', function () {
        var newSelectedOptionValueId = '003';
        var expectedResp = {
            'action': 'Cart-EditProductLineItem',
            'cartModel': {
                'items': [
                    {
                        'id': productpid,
                        'productName': 'Mitsubishi 735 Series 73" DLP® High Definition Television',
                        'productType': 'optionProduct',
                        'price': {
                            'sales': {
                                'value': 2379.98,
                                'currency': 'USD',
                                'formatted': '$2,379.98',
                                'decimalPrice': '2379.98'
                            },
                            'list': null
                        },
                        'quantity': quantity,
                        'options': [
                            {
                                'displayName': 'Extended Warranty: 5 Year Warranty',
                                'optionId': 'tvWarranty',
                                'selectedValueId': newSelectedOptionValueId
                            }
                        ]
                    }
                ]
            },
            'newProductId': productpid
        };


        myRequest.method = 'POST';
        myRequest.url = config.baseUrl + '/Cart-EditProductLineItem';
        myRequest.form = {
            uuid: productuuid,
            pid: productpid,
            quantity: quantity,
            selectedOptionValueId: newSelectedOptionValueId
        };

        var cookie = request.cookie(cookieString);
        cookieJar.setCookie(cookie, myRequest.url);

        return request(myRequest).then(function (response) {
            assert.equal(response.statusCode, 200);
            var bodyAsJson = JSON.parse(response.body);
            assert.containSubset(bodyAsJson.cartModel, expectedResp.cartModel);
        });
    });
});
