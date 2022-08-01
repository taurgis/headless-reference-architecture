'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var config = require('*/cartridge/scripts/config');

/**
 * invokes service
 * @param {{dw.svc.Service}}service - service instance
 * @returns {{Object}} result of service call
 */
function invokeService(service) {
    var result;
    if (service) {
        try {
            var responseObject = service.call();
            if (responseObject) {
                result = responseObject.object;
            }
        } catch (e) {
            Logger.error('Exception: ' + e);
        }
    }
    return result;
}

/**
 * Service call to exchange JWT into a new session
 * @param {{string}}token - bearer token
 * @param {{string}}clientIP - client ip
 * @return {Object} response object
 */
function getSession(token, clientIP) {
    return invokeService(
        LocalServiceRegistry.createService('sfcc-ocapi-session-bridge', {
            createRequest: function (svc) {
                svc.setRequestMethod('POST');
                svc.addHeader('Authorization', 'Bearer ' + token);
                svc.setURL(config.OCAPI_SESSION_BRIDGE_URI);

                /*
                    If we have the client IP, send it to the session bridge API so the resulting session has the correct IP.
                    This is required for client IP related services (ie. geolocation) to have the correct information.
                    Otherwise, since the call to the session bridge originates from the server, the server IP would be stored in the session.
                */
                if (clientIP) {
                    svc.addHeader(config.CLIENT_IP_HEADER_NAME, clientIP);
                }

                return svc;
            },
            parseResponse: function (svc, response) {
                return response;
            },
            filterLogMessage: function (msg) {
                return msg;
            },
            mockCall: function () {
                var mockResponseObj = {};
                return {
                    statusCode: 200,
                    statusMessage: 'Success',
                    text: JSON.stringify(mockResponseObj)
                };
            }
        })
    );
}

module.exports = {
    getSession: getSession
};
