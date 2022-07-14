/* global session */

'use strict';

var server = require('./server/server');
server.middleware = require('./server/middleware');
server.forms = require('./server/forms/forms')(session);
server.querystring = require('./server/queryString');

module.exports = server;
