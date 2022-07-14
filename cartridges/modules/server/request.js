'use strict';

var QueryString = require('./queryString');
var SimpleCache = require('./simpleCache');

/**
 * Translates global session object into local object
 * @param {dw.session} session - Global customer object
 * @returns {Object} local instance of session object
 */
function getSessionObject(session) {
    var sessionObject = {
        privacyCache: new SimpleCache(session.privacy),
        raw: session,
        currency: {
            currencyCode: session.currency.currencyCode,
            defaultFractionDigits: session.currency.defaultFractionDigits,
            name: session.currency.name,
            symbol: session.currency.symbol
        },
        setCurrency: function (value) {
            session.setCurrency(value);
        }
    };

    Object.defineProperty(sessionObject, 'clickStream', {
        get: function () {
            var clickStreamEntries = session.clickStream.clicks.toArray();
            var clicks = clickStreamEntries.map(function (clickObj) {
                return {
                    host: clickObj.host,
                    locale: clickObj.locale,
                    path: clickObj.path,
                    pipelineName: clickObj.pipelineName,
                    queryString: clickObj.queryString,
                    referer: clickObj.referer,
                    remoteAddress: clickObj.remoteAddress,
                    timestamp: clickObj.timestamp,
                    url: clickObj.url,
                    userAgent: clickObj.userAgent
                };
            });
            return {
                clicks: clicks,
                first: clicks[0],
                last: clicks[clicks.length - 1],
                partial: session.clickStream.partial
            };
        }
    });

    return sessionObject;
}

/**
 *
 * Retrieves and normalizes form data from httpParameterMap
 * @param {dw.web.httpParameterMap} items - original parameters
 * @param {Object} qs - Object containing querystring
 * @return {Object} Object containing key value pairs submitted from the form
 */
function getFormData(items, qs) {
    if (!items || !items.parameterNames) {
        return {};
    }
    var allKeys = items.parameterNames;
    var result = {};
    if (allKeys.length > 0) {
        var iterator = allKeys.iterator();
        while (iterator.hasNext()) {
            var key = iterator.next();
            var value = items.get(key);

            if (value.rawValue && !qs[key]) {
                result[key] = value.rawValue;
            }
        }
    }

    return result;
}

/**
 * Retrieves session locale info
 *
 * @param {string} locale - Session locale code, xx_XX
 * @param {dw.util.Currency} currency - Session currency
 * @return {Object} - Session locale info
 */
function getCurrentLocale(locale, currency) {
    return {
        id: locale,
        currency: {
            currencyCode: currency.currencyCode,
            defaultFractionDigits: currency.defaultFractionDigits,
            name: currency.name,
            symbol: currency.symbol
        }
    };
}

/**
 * Translates global customer's preferredAddress into local object
 * @param {Object} address - a CustomerAddress or OrderAddress
 * @returns {Object} local instance of address object
 */
function getAddressObject(address) {
    var addressObject = null;
    if (address) {
        addressObject = {
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            companyName: address.companyName,
            countryCode: {
                displayValue: address.countryCode.displayValue,
                value: address.countryCode.value
            },
            firstName: address.firstName,
            lastName: address.lastName,
            ID: address.ID,
            phone: address.phone,
            postalCode: address.postalCode,
            stateCode: address.stateCode,
            postBox: address.postBox,
            salutation: address.salutation,
            secondName: address.secondName,
            suffix: address.suffix,
            suite: address.suite,
            title: address.title,
            raw: address
        };
    }
    return addressObject;
}

/**
 * Creates a list of payment instruments for the current user
 * @param {Array} rawPaymentInstruments - current customer's payment instruments
 * @returns {Array} an array of payment instruments
 */
function getPaymentInstruments(rawPaymentInstruments) {
    var paymentInstruments = [];

    if (rawPaymentInstruments.getLength() > 0) {
        var iterator = rawPaymentInstruments.iterator();
        while (iterator.hasNext()) {
            var item = iterator.next();
            paymentInstruments.push({
                creditCardHolder: item.creditCardHolder,
                maskedCreditCardNumber: item.maskedCreditCardNumber,
                creditCardType: item.creditCardType,
                creditCardExpirationMonth: item.creditCardExpirationMonth,
                creditCardExpirationYear: item.creditCardExpirationYear,
                UUID: item.UUID,
                creditCardNumber: Object.hasOwnProperty.call(item, 'creditCardNumber')
                    ? item.creditCardNumber
                    : null,
                raw: item
            });
        }
    }

    return paymentInstruments;
}

/**
 * Translates global customer object into local object
 * @param {dw.customer.Customer} customer - Global customer object
 * @returns {Object} local instance of customer object
 */
function getCustomerObject(customer) {
    if (!customer || !customer.profile) {
        return {
            raw: customer
        };
    }
    if (!customer.authenticated) {
        return {
            raw: customer,
            credentials: {
                username: customer.profile.credentials.login
            }
        };
    }
    var preferredAddress = customer.addressBook.preferredAddress;
    var result;
    result = {
        raw: customer,
        profile: {
            lastName: customer.profile.lastName,
            firstName: customer.profile.firstName,
            email: customer.profile.email,
            phone: customer.profile.phoneHome,
            customerNo: customer.profile.customerNo
        },
        addressBook: {
            preferredAddress: getAddressObject(preferredAddress),
            addresses: []
        },
        wallet: {
            paymentInstruments: getPaymentInstruments(customer.profile.wallet.paymentInstruments)
        }
    };
    if (customer.addressBook.addresses && customer.addressBook.addresses.length > 0) {
        for (var i = 0, ii = customer.addressBook.addresses.length; i < ii; i++) {
            result.addressBook.addresses.push(getAddressObject(customer.addressBook.addresses[i]));
        }
    }
    return result;
}

/**
 * set currency of the current locale if there's a mismatch
 * @param {Object} request - Global request object
 * @param {dw.system.Session} session - Global session object
 */
function setCurrency(request, session) {
    var Locale = require('dw/util/Locale');
    var currency = require('dw/util/Currency');
    var countries = require('*/cartridge/config/countries');
    var currentLocale = Locale.getLocale(request.locale);

    var currentCountry = !currentLocale
        ? countries[0]
        : countries.filter(function (country) {
            return country.id === currentLocale.ID;
        })[0];

    if (session.currency
        && currentCountry
        && session.currency.currencyCode !== currentCountry.currencyCode
        && (!currentCountry.alternativeCurrencyCodes
            || currentCountry.alternativeCurrencyCodes.indexOf(session.currency.currencyCode) < 0
        )
    ) {
        session.setCurrency(currency.getCurrency(currentCountry.currencyCode));
    }
}

/**
 * get a local instance of the geo location object
 * @param {Object} request - Global request object
 * @returns {Object} object containing geo location information
 */
function getGeolocationObject(request) {
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(request.locale);

    return {
        countryCode: request.geolocation ? request.geolocation.countryCode : currentLocale.country,
        latitude: request.geolocation ? request.geolocation.latitude : 90.0000,
        longitude: request.geolocation ? request.geolocation.longitude : 0.0000
    };
}

/**
 * Get request body as string if it is a POST or PUT
 * @param {Object} request - Global request object
 * @returns {string|Null} the request body as string
 */
function getRequestBodyAsString(request) {
    var result = null;

    if (request
        && (request.httpMethod === 'POST' || request.httpMethod === 'PUT')
        && request.httpParameterMap
    ) {
        result = request.httpParameterMap.requestBodyAsString;
    }

    return result;
}

/**
 * Get a local instance of the pageMetaData object
 * @param {Object} pageMetaData - Global request pageMetaData object
 * @returns {Object} object containing pageMetaData information
 */
function getPageMetaData(pageMetaData) {
    var pageMetaDataObject = {
        title: pageMetaData.title,
        description: pageMetaData.description,
        keywords: pageMetaData.keywords,
        pageMetaTags: pageMetaData.pageMetaTags,
        addPageMetaTags: function (pageMetaTags) {
            pageMetaData.addPageMetaTags(pageMetaTags);
        },
        setTitle: function (title) {
            pageMetaData.setTitle(title);
        },
        setDescription: function (description) {
            pageMetaData.setDescription(description);
        },
        setKeywords: function (keywords) {
            pageMetaData.setKeywords(keywords);
        }
    };

    return pageMetaDataObject;
}

/**
 * @constructor
 * @classdesc Local instance of request object with customer object in it
 *
 * Translates global request and customer object to local one
 * @param {Object} request - Global request object
 * @param {dw.customer.Customer} customer - Global customer object
 * @param {dw.system.Session} session - Global session object
 */
function Request(request, customer, session) {
    // Avoid currency check for remote includes
    if (!request.includeRequest) {
        setCurrency(request, session);
    }

    this.httpMethod = request.httpMethod;
    this.host = request.httpHost;
    this.path = request.httpPath;
    this.httpHeaders = request.httpHeaders;
    this.https = request.isHttpSecure();
    this.includeRequest = request.includeRequest;
    this.setLocale = function (localeID) {
        return request.setLocale(localeID);
    };

    Object.defineProperty(this, 'session', {
        get: function () {
            return getSessionObject(session);
        }
    });

    Object.defineProperty(this, 'httpParameterMap', {
        get: function () {
            return request.httpParameterMap;
        }
    });

    Object.defineProperty(this, 'querystring', {
        get: function () {
            return new QueryString(request.httpQueryString);
        }
    });

    Object.defineProperty(this, 'form', {
        get: function () {
            return getFormData(request.httpParameterMap, this.querystring);
        }
    });

    Object.defineProperty(this, 'body', {
        get: function () {
            return getRequestBodyAsString(request);
        }
    });

    Object.defineProperty(this, 'geolocation', {
        get: function () {
            return getGeolocationObject(request);
        }
    });

    Object.defineProperty(this, 'currentCustomer', {
        get: function () {
            return getCustomerObject(customer);
        }
    });

    Object.defineProperty(this, 'locale', {
        get: function () {
            return getCurrentLocale(request.locale, session.currency);
        }
    });

    Object.defineProperty(this, 'remoteAddress', {
        get: function () {
            return request.getHttpRemoteAddress();
        }
    });

    Object.defineProperty(this, 'referer', {
        get: function () {
            return request.getHttpReferer();
        }
    });

    Object.defineProperty(this, 'pageMetaData', {
        get: function () {
            return getPageMetaData(request.pageMetaData);
        }
    });
}
module.exports = Request;
