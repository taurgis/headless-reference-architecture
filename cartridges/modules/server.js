'use strict';

var server = require('./server/server');
server.middleware = require('./server/middleware');
server.querystring = require('./server/queryString');

module.exports = server;
