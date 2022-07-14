'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var ArrayList = require('../../../mocks/dw.util.Collection');

var Request = proxyquire('../../../../cartridges/modules/server/request', {
    'dw/util/Locale': {
        getLocale: function () {
            return { ID: 'en_US', country: 'US' };
        }
    },
    'dw/util/Currency': {
        getCurrency: function () {
            return 'currency';
        }
    },
    '*/cartridge/config/countries': [
        {
            'id': 'en_US',
            'currencyCode': 'USD',
            'alternativeCurrencyCodes': ['CAD']
        }, {
            'id': 'en_GB',
            'currencyCode': 'GBP'
        }, {
            'id': 'ja_JP',
            'currencyCode': 'JPY'
        }, {
            'id': 'zh_CN',
            'currencyCode': 'CNY'
        }, {
            'id': 'fr_FR',
            'currencyCode': 'EUR'
        }, {
            'id': 'it_IT',
            'currencyCode': 'EUR'
        }]
});

var session = {
    setCurrency: function () { return; }
};

var setCurrencyStub = sinon.stub(session, 'setCurrency');

function createFakeRequest(overrides) {
    overrides = overrides || {}; // eslint-disable-line no-param-reassign
    var globalRequest = {
        httpMethod: 'GET',
        httpHost: 'localhost',
        httpPath: '/Product-Show',
        httpQueryString: '',
        httpParameterMap: {
            requestBodyAsString: ''
        },
        isHttpSecure: function () {
            return false;
        },
        getHttpReferer: function () {
            return 'https://www.salesforce.com';
        },
        getHttpRemoteAddress: function () {
            return '0.0.0.0';
        },
        geolocation: {
            countryCode: 'US',
            latitude: 42.4019,
            longitude: -71.1193
        },
        customer: {
            authenticated: true,
            profile: {
                firstName: 'John',
                lastName: 'Snow',
                email: 'jsnow@starks.com',
                phoneHome: '1234567890',
                credentials: {
                    login: 'jsnow@starks.com'
                },
                wallet: {
                    paymentInstruments: new ArrayList([
                        {
                            creditCardHolder: 'someName',
                            maskedCreditCardNumber: 'someMaskedNumber',
                            creditCardType: 'someCardType',
                            creditCardExpirationMonth: 'someMonth',
                            creditCardExpirationYear: 'someYear',
                            UUID: 'someUUID',
                            creditCardNumber: 'someNumber'
                        }
                    ])
                }
            },
            addressBook: {
                preferredAddress: {
                    address1: '15 South Point Drive',
                    address2: null,
                    city: 'Boston',
                    countryCode: {
                        displayValue: 'United States',
                        value: 'US'
                    },
                    firstName: 'John',
                    lastName: 'Snow',
                    ID: 'Home',
                    postalCode: '02125',
                    stateCode: 'MA',
                    postBox: '2134',
                    salutation: null,
                    secondName: null,
                    suffix: null,
                    suite: '302',
                    title: 'Dr'

                }
            }
        },
        locale: 'ab_YZ',
        pageMetaData: {
            title: '',
            description: '',
            keywords: '',
            pageMetaTags: [{}],
            addPageMetaTags: function (pageMetaTags) {
                this.pageMetaTags = pageMetaTags;
            },
            setTitle: function (title) {
                this.title = title;
            },
            setDescription: function (description) {
                this.description = description;
            },
            setKeywords: function (keywords) {
                this.keywords = keywords;
            }
        },
        session: {
            currency: {
                currencyCode: 'XYZ',
                defaultFractionDigits: 10,
                name: 'Volodin Dollars',
                symbol: '៛'
            },
            custom: {
                rememberMe: true
            },
            privacyCache: {
                get: function (key) { // eslint-disable-line no-unused-vars
                    return this.key;
                },
                set: function (value) { // eslint-disable-line no-unused-vars
                    this.key = value;
                },
                key: 'value'
            },
            clickStream: {
                clicks: {
                    toArray: function () {
                        return [{
                            host: 'clickObj.host',
                            locale: 'clickObj.locale',
                            path: 'clickObj.path',
                            pipelineName: 'clickObj-pipelineName',
                            queryString: 'clickObj.queryString',
                            referer: 'clickObj.referer',
                            remoteAddress: 'clickObj.remoteAddress',
                            timestamp: 'clickObj.timestamp',
                            url: 'clickObj.url',
                            userAgent: 'clickObj.userAgent'
                        }];
                    }
                },
                partial: false
            },
            setCurrency: setCurrencyStub
        }
    };
    Object.keys(overrides).forEach(function (key) {
        globalRequest[key] = overrides[key];
    });
    return globalRequest;
}

describe('request', function () {
    afterEach(function () {
        setCurrencyStub.reset();
    });

    it('should parse empty query string', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.isObject(req.querystring);
        assert.equal(Object.keys(req.querystring).length, 0);
        assert.equal(req.querystring.toString(), '');
    });

    it('should parse simple query string', function () {
        var req = new Request(createFakeRequest({ httpQueryString: 'id=22&name=foo' }), createFakeRequest().customer, createFakeRequest().session);
        assert.isObject(req.querystring);
        assert.equal(req.querystring.id, 22);
        assert.equal(req.querystring.name, 'foo');
        assert.equal(req.querystring.toString(), 'id=22&name=foo');
    });

    it('should parse query string with variables', function () {
        var req = new Request(createFakeRequest({
            httpQueryString: 'dwvar_bar_size=32&dwvar_foo_color=1111'
        }), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.querystring.variables.color.id, 'foo');
        assert.equal(req.querystring.variables.color.value, '1111');
        assert.equal(req.querystring.variables.size.id, 'bar');
        assert.equal(req.querystring.variables.size.value, '32');
        assert.notProperty(req.querystring, 'dwvar_foo_color');
        assert.notProperty(req.querystring, 'dwvar_bar_size');
        assert.equal(req.querystring.toString(), 'dwvar_bar_size=32&dwvar_foo_color=1111');
    });

    it('should parse query string with incorrectly formatted variables', function () {
        var req = new Request(createFakeRequest({
            httpQueryString: 'dwvar_color=1111&dwvar_size=32'
        }), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.querystring.dwvar_color, '1111');
        assert.equal(req.querystring.dwvar_size, '32');
        assert.notProperty(req.querystring, 'variables');
        assert.equal(req.querystring.toString(), 'dwvar_color=1111&dwvar_size=32');
    });

    it('should contain correct geolocation object and properties', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.geolocation.countryCode, 'US');
        assert.equal(req.geolocation.latitude, 42.4019);
        assert.equal(req.geolocation.longitude, -71.1193);
    });

    it('should contain correct current customer profile and properties', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.currentCustomer.profile.firstName, 'John');
        assert.equal(req.currentCustomer.profile.lastName, 'Snow');
        assert.equal(req.currentCustomer.profile.email, 'jsnow@starks.com');
        assert.equal(req.currentCustomer.profile.phone, '1234567890');
    });

    it('should contain correct customer credentials when customer unauthenticated', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.customer.authenticated = false;
        var req = new Request(fakeRequest, fakeRequest.customer, createFakeRequest().session);
        assert.equal(req.currentCustomer.credentials.username, 'jsnow@starks.com');
    });

    it('should contain correct current customer address book and properties', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedResult = createFakeRequest();
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.address1,
            '15 South Point Drive'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.address2,
            null
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.city,
            'Boston'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.countryCode.displayValue,
            'United States'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.countryCode.value,
            'US'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.firstName,
            'John'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.lastName,
            'Snow'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.ID,
            'Home'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.stateCode,
            'MA'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.postalCode,
            '02125'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.postBox,
            '2134'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.salutation,
            null
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.secondName,
            null
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.suffix,
            null
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.suite,
            '302'
        );
        assert.equal(
            req.currentCustomer.addressBook.preferredAddress.title,
            'Dr'
        );
        assert.deepEqual(
            req.currentCustomer.addressBook.preferredAddress.raw,
            expectedResult.customer.addressBook.preferredAddress
         );
    });

    it('should contain correct current customer wallet and properties', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedResult = createFakeRequest();
        assert.deepEqual(
            req.currentCustomer.wallet.paymentInstrument,
            expectedResult.customer.profile.wallet.paymentInstruments[0]
        );
    });

    it('should not fail if customer does not exist', function () {
        var req = new Request(createFakeRequest({ customer: null }), null, createFakeRequest().session);
        assert.equal(req.host, 'localhost');
    });

    it('should not fail if customer does not have a profile', function () {
        var req = new Request(createFakeRequest({ customer: { profile: null } }), { profile: null }, createFakeRequest().session);
        assert.equal(req.currentCustomer.raw.profile, null);
    });

    it('should retrieve form properties', function () {
        var items = {
            one: { rawValue: 1 },
            two: { rawValue: 2 },
            three: { rawValue: 3 },
            submitted: { },
            id: { rawValue: 22 },
            name: { rawValue: 'foo' }
        };
        var httpParamMap = {
            parameterNames: {
                iterator: function () {
                    var index = 0;
                    return {
                        hasNext: function () {
                            return index < Object.keys(items).length - 1;
                        },
                        next: function () {
                            var value = Object.keys(items)[index];
                            index++;
                            return value;
                        }
                    };
                },
                length: Object.keys(items).length
            },
            get: function (name) {
                return items[name];
            }
        };
        var req = new Request(
            createFakeRequest({ httpParameterMap: httpParamMap, httpQueryString: 'id=22&name=foo' }),
            null,
            createFakeRequest().session
        );
        assert.equal(req.form.one, 1);
        assert.equal(req.form.two, 2);
        assert.equal(req.form.three, 3);
        assert.isUndefined(req.form.submitted);
        assert.isUndefined(req.form.id);
    });

    it('should contain locale ID', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedResult = createFakeRequest();
        assert.deepEqual(
            req.locale.id,
            expectedResult.locale
        );
    });

    it('should contain session currency', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedResult = createFakeRequest();
        assert.deepEqual(
            req.locale.currency,
            expectedResult.session.currency
        );
    });

    it('should contain session privacy', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedResult = req.session.raw.privacyCache.get('key');
        assert.equal(expectedResult, 'value');
    });

    it('should contain session clickStream', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        var expectedClick = {
            host: 'clickObj.host',
            locale: 'clickObj.locale',
            path: 'clickObj.path',
            pipelineName: 'clickObj-pipelineName',
            queryString: 'clickObj.queryString',
            referer: 'clickObj.referer',
            remoteAddress: 'clickObj.remoteAddress',
            timestamp: 'clickObj.timestamp',
            url: 'clickObj.url',
            userAgent: 'clickObj.userAgent'
        };

        var expectedResult = {
            clicks: [expectedClick],
            first: expectedClick,
            last: expectedClick,
            partial: false
        };

        assert.deepEqual(req.session.clickStream, expectedResult);
    });

    it('should call setCurrency once', function () {
        new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.isTrue(setCurrencyStub.calledOnce);
    });

    it('should not call setCurrency when currency is a alternative currency code', function () {
        var fakeRequest = createFakeRequest({
            locale: 'en_US'
        });
        fakeRequest.session.currency.currencyCode = 'CAD';
        new Request(fakeRequest, fakeRequest.customer, fakeRequest.session);
        assert.isFalse(setCurrencyStub.calledOnce);
    });


    it('should contain correct geolocation object and properties wehn co geolocation exists', function () {
        var fakeRequest = createFakeRequest();
        delete fakeRequest.geolocation;
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.geolocation.countryCode, 'US');
        assert.equal(req.geolocation.latitude, 90.0000);
        assert.equal(req.geolocation.longitude, 0.0000);
    });

    it('should contain the correct referer', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.referer, 'https://www.salesforce.com');
    });

    it('should contain the correct remote address', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.remoteAddress, '0.0.0.0');
    });

    it('should not get body as string for a GET request', function () {
        var req = new Request(createFakeRequest(), createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.body, null);
    });

    it('should get body as string for a POST request', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.httpMethod = 'POST';
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.body, '');
    });

    it('should get body as string for a PUT request', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.httpMethod = 'PUT';
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.body, '');
    });

    it('should get pageMetaData title', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.pageMetaData.setTitle('TestTitle');
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.pageMetaData.title, 'TestTitle');
    });

    it('should get pageMetaData description', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.pageMetaData.setDescription('TestDescription');
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.pageMetaData.description, 'TestDescription');
    });

    it('should get pageMetaData keywords', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.pageMetaData.setKeywords('TestKeywords');
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.equal(req.pageMetaData.keywords, 'TestKeywords');
    });

    it('should get pageMetaData pageMetaTags', function () {
        var fakeRequest = createFakeRequest();
        fakeRequest.pageMetaData.addPageMetaTags([{ title: true, content: 'TestTitle' }]);
        var req = new Request(fakeRequest, createFakeRequest().customer, createFakeRequest().session);
        assert.deepEqual(req.pageMetaData.pageMetaTags, [{ title: true, content: 'TestTitle' }]);
    });
});
