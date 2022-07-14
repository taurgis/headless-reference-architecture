var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
var jsonHelpers = require('../helpers/jsonUtils');
chai.use(chaiSubset);

/**
 * Test case:
 * should be able to submit an order with billingForm
 */

describe('billingForm', function () {
    this.timeout(5000);

    describe('positive test', function () {
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

        var cookieString;


        var variantPid1 = '701643421084M';
        var qty1 = 2;
        var addProd = '/Cart-AddProduct';

        // ----- Step 1 adding product to Cart
        myRequest.url = config.baseUrl + addProd;
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
            .then(function (addToCartResponse) {
                assert.equal(addToCartResponse.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                cookieString = cookieJar.getCookieString(myRequest.url);
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                var cookie = request.cookie(cookieString);
                cookieJar.setCookie(cookie, myRequest.url);
                // step2 : get cookies, Generate CSRF, then set cookies
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                // step3 : submit billing request with token aquired in step 2
                myRequest.url = config.baseUrl + '/CheckoutServices-SubmitPayment?' +
                    csrfJsonResponse.csrf.tokenName + '=' +
                    csrfJsonResponse.csrf.token;
                myRequest.form = {
                    dwfrm_billing_shippingAddressUseAsBillingAddress: 'true',
                    dwfrm_billing_addressFields_firstName: 'John',
                    dwfrm_billing_addressFields_lastName: 'Smith',
                    dwfrm_billing_addressFields_address1: '10 main St',
                    dwfrm_billing_addressFields_address2: '',
                    dwfrm_billing_addressFields_country: 'us',
                    dwfrm_billing_addressFields_states_stateCode: 'MA',
                    dwfrm_billing_addressFields_city: 'burlington',
                    dwfrm_billing_addressFields_postalCode: '09876',
                    dwfrm_billing_paymentMethod: 'CREDIT_CARD',
                    dwfrm_billing_creditCardFields_cardType: 'Visa',
                    dwfrm_billing_creditCardFields_cardNumber: '4111111111111111',
                    dwfrm_billing_creditCardFields_expirationMonth: '2',
                    dwfrm_billing_creditCardFields_expirationYear: '2030.0',
                    dwfrm_billing_contactInfoFields_phone: '9786543213',
                    dwfrm_billing_creditCardFields_securityCode: '342'
                };
                var ExpectedResBody = {
                    locale: 'en_US',
                    address: {
                        firstName: { value: 'John' },
                        lastName: { value: 'Smith' },
                        address1: { value: '10 main St' },
                        address2: { value: null },
                        city: { value: 'burlington' },
                        stateCode: { value: 'MA' },
                        postalCode: { value: '09876' },
                        countryCode: { value: 'us' }
                    },
                    paymentMethod: { value: 'CREDIT_CARD', htmlName: 'CREDIT_CARD' },
                    phone: { value: '9786543213' },
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    saveCard: false
                };

                return request(myRequest)
                    .then(function (response) {
                        var bodyAsJson = JSON.parse(response.body);
                        var strippedBody = jsonHelpers.deleteProperties(bodyAsJson, ['redirectUrl', 'action', 'queryString']);
                        assert.equal(response.statusCode, 200, 'Expected CheckoutServices-SubmitPayment statusCode to be 200.');
                        assert.containSubset(strippedBody.address, ExpectedResBody.address, 'Expecting actual response address to be equal match expected response address');
                        assert.isFalse(strippedBody.error);
                        assert.equal(strippedBody.paymentMethod.value, ExpectedResBody.paymentMethod.value);
                        assert.equal(strippedBody.phone.value, ExpectedResBody.phone.value);
                    });
            });
    });
});

