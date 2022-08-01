'use strict';

var Site = require('dw/system/Site');
var currentSite = Site.getCurrent();

module.exports = {
    // The header name set in Customer CDN settings -> Client IP Header Name. Allows B2C to retrieve the client IP during session bridging.
    CLIENT_IP_HEADER_NAME:
        currentSite.getCustomPreferenceValue('clientIPHeaderName'),

    // The request URI used to fetch OCAPI Session in bridge service - SLAS
    OCAPI_SESSION_BRIDGE_URI: currentSite.getCustomPreferenceValue(
        'ocapiSessionBridgeURI'
    )
};
