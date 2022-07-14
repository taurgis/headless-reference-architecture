var assert = require('chai').assert;
var chaiSubset = require('chai-subset');
var chai = require('chai');
chai.use(chaiSubset);

var request = require('request');
var config = require('../it.config');


describe('Store Locator', function () {
    this.timeout(5000);

    describe('FindStores using Postal Code and radius', function () {
        it('should returns locations for valid postal code and radius', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?postalCode=01803&radius=15';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [
                    {
                        'ID': 'store1',
                        'name': 'Commerce Cloud',
                        'address1': '10 Presidential Way',
                        'address2': null,
                        'city': 'Woburn',
                        'countryCode': 'US',
                        'latitude': 42.5273334,
                        'longitude': -71.13758250000001,
                        'postalCode': '01801',
                        'stateCode': 'MA',
                        'storeHours': 'Mon - Sat: 10am - 9pm<br />\r\nSun: 12pm - 6pm'
                    },
                    {
                        'ID': 'store4',
                        'name': 'Champaign Electronic Shop',
                        'address1': '1001 Cambridge St',
                        'address2': null,
                        'city': 'Cambridge',
                        'countryCode': 'US',
                        'latitude': 42.3729794,
                        'longitude': -71.09346089999997,
                        'postalCode': '02141',
                        'phone': '+1-617-714-2640',
                        'stateCode': 'MA'
                    },
                    {
                        'ID': 'store10',
                        'name': 'Downtown TV Shop',
                        'address1': '333 Washington St',
                        'address2': null,
                        'city': 'Boston',
                        'countryCode': 'US',
                        'latitude': 42.3569512,
                        'longitude': -71.05902600000002,
                        'postalCode': '02108',
                        'phone': '+1-617-695-1565',
                        'stateCode': 'MA',
                        'storeHours': 'Mon - Sat: 10am - 9pm<br />\r\n            Sun: 12pm - 6pm'
                    },
                    {
                        'ID': 'store5',
                        'name': 'Short Electro',
                        'address1': '584 Columbus Ave',
                        'address2': null,
                        'city': 'Boston',
                        'countryCode': 'US',
                        'latitude': 42.3403189,
                        'longitude': -71.0817859,
                        'postalCode': '02118',
                        'phone': '+1-617-888-7276',
                        'stateCode': 'MA',
                        'storeHours': 'Mon - Sat: 10am - 9pm<br />\r\n            Sun: 12pm - 6pm'
                    },
                    {
                        'ID': 'store6',
                        'name': 'Khale Street Electronics',
                        'address1': '150 Winthrop Ave',
                        'address2': null,
                        'city': 'Lawrence',
                        'countryCode': 'US',
                        'latitude': 42.6895548,
                        'longitude': -71.14878340000001,
                        'postalCode': '01843',
                        'phone': '+1-978-580-2704',
                        'stateCode': 'MA'
                    }
                ],
                'locations': [
                    { 'name': 'Commerce Cloud',
                        'latitude': 42.5273334,
                        'longitude': -71.13758250000001 },
                    { 'name': 'Champaign Electronic Shop',
                        'latitude': 42.3729794,
                        'longitude': -71.09346089999997 },
                    { 'name': 'Downtown TV Shop',
                        'latitude': 42.3569512,
                        'longitude': -71.05902600000002 },
                    { 'name': 'Short Electro',
                        'latitude': 42.3403189,
                        'longitude': -71.0817859 },
                    { 'name': 'Khale Street Electronics',
                        'latitude': 42.6895548,
                        'longitude': -71.14878340000001 }
                ],
                'searchKey': {
                    'postalCode': '01803'
                },
                'radius': 15,
                'radiusOptions': [
                    15,
                    30,
                    50,
                    100,
                    300
                ]
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                var bodyAsJsonLocations = JSON.parse(bodyAsJson.locations);
                assert.containSubset(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.containSubset(bodyAsJsonLocations, ExpectedResBody.locations);
                assert.containSubset(bodyAsJson.searchKey, ExpectedResBody.searchKey, 'Actual response.searchKey not as expected.');
                assert.containSubset(bodyAsJson.radius, ExpectedResBody.radius, 'Actual response.radius not as expected.');
                assert.containSubset(bodyAsJson.radiusOptions, ExpectedResBody.radiusOptions, 'Actual response.radiusOptions not as expected.');

                done();
            });
        });

        it('should returns location for specified postal code and default radius = 15', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?postalCode=04330';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [],
                'locations': '[]',
                'searchKey': {
                    'postalCode': '04330'
                },
                'radius': 15
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.deepEqual(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.deepEqual(bodyAsJson.locations, ExpectedResBody.locations, 'Actual response.locations not as expected.');
                assert.deepEqual(bodyAsJson.radius, ExpectedResBody.radius, 'Actual response.radius not as expected.');

                done();
            });
        });

        it('should returns 0 location for non-exist postal code', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?postalCode=012AB&radius=5';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [],
                'locations': '[]'
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.deepEqual(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.deepEqual(bodyAsJson.locations, ExpectedResBody.locations, 'Actual response.locations not as expected.');

                done();
            });
        });

        it('should returns 0 location for negative radius', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?postalCode=01803&radius=-15';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [],
                'locations': '[]'
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.deepEqual(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.deepEqual(bodyAsJson.locations, ExpectedResBody.locations, 'Actual response.locations not as expected.');

                done();
            });
        });
    });

    describe('FindStores using valid longitude, latitude and radius.', function () {
        it('should returns locations for specified longitude, latitude and radius', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?long=-71.14878340000001&lat=42.6895548&radius=23';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [
                    {
                        'ID': 'store6',
                        'name': 'Khale Street Electronics',
                        'address1': '150 Winthrop Ave',
                        'address2': null,
                        'city': 'Lawrence',
                        'countryCode': 'US',
                        'latitude': 42.6895548,
                        'longitude': -71.14878340000001,
                        'postalCode': '01843',
                        'phone': '+1-978-580-2704',
                        'stateCode': 'MA'
                    },
                    {
                        'ID': 'store1',
                        'name': 'Commerce Cloud',
                        'address1': '10 Presidential Way',
                        'address2': null,
                        'city': 'Woburn',
                        'countryCode': 'US',
                        'latitude': 42.5273334,
                        'longitude': -71.13758250000001,
                        'postalCode': '01801',
                        'stateCode': 'MA',
                        'storeHours': 'Mon - Sat: 10am - 9pm<br />\r\nSun: 12pm - 6pm'
                    },
                    {
                        'ID': 'store4',
                        'name': 'Champaign Electronic Shop',
                        'address1': '1001 Cambridge St',
                        'address2': null,
                        'city': 'Cambridge',
                        'countryCode': 'US',
                        'latitude': 42.3729794,
                        'longitude': -71.09346089999997,
                        'postalCode': '02141',
                        'phone': '+1-617-714-2640',
                        'stateCode': 'MA'
                    }
                ],
                'locations': [
                    { 'name': 'Khale Street Electronics',
                        'latitude': 42.6895548,
                        'longitude': -71.14878340000001 },
                    { 'name': 'Commerce Cloud',
                        'latitude': 42.5273334,
                        'longitude': -71.13758250000001 },
                    { 'name': 'Champaign Electronic Shop',
                        'latitude': 42.3729794,
                        'longitude': -71.09346089999997 }
                ],
                'searchKey': {
                    'lat': 42.6895548,
                    'long': -71.14878340000001
                },
                'radius': 23,
                'radiusOptions': [
                    15,
                    30,
                    50,
                    100,
                    300
                ]
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                var bodyAsJsonLocations = JSON.parse(bodyAsJson.locations);
                assert.containSubset(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.containSubset(bodyAsJsonLocations, ExpectedResBody.locations);
                assert.containSubset(bodyAsJson.searchKey, ExpectedResBody.searchKey, 'Actual response.searchKey not as expected.');
                assert.containSubset(bodyAsJson.radius, ExpectedResBody.radius, 'Actual response.radius not as expected.');
                assert.containSubset(bodyAsJson.radiusOptions, ExpectedResBody.radiusOptions, 'Actual response.radiusOptions not as expected.');

                done();
            });
        });

        it('should returns 0 location for the specified longitude and latitude', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?long=0&lat=0';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [],
                'locations': '[]'
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.deepEqual(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.deepEqual(bodyAsJson.locations, ExpectedResBody.locations, 'Actual response.locations not as expected.');

                done();
            });
        });

        it('should returns 0 location for invalid longitude and latitude', function (done) {
            var url = config.baseUrl + '/Stores-FindStores?long=190&lat=100&radius=15';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            var ExpectedResBody = {
                'stores': [],
                'locations': '[]'
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.deepEqual(bodyAsJson.stores, ExpectedResBody.stores, 'Actual response.stores not as expected.');
                assert.deepEqual(bodyAsJson.locations, ExpectedResBody.locations, 'Actual response.locations not as expected.');

                done();
            });
        });

        it('should returns succesful response with no parameter', function (done) {
            // when no parameter specified, it uses geolocation.latitude and geolocation.longitude
            // for the latitude and longitude; therefore the search result could be vary depending on
            // the current location

            var url = config.baseUrl + '/Stores-FindStores';
            var myRequest = {
                url: url,
                method: 'GET',
                rejectUnauthorized: false,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            request(myRequest, function (error, response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');

                var bodyAsJson = JSON.parse(response.body);
                assert.isNotNull(bodyAsJson.stores, 'Expect stores property in response.');
                assert.isArray(bodyAsJson.stores, 'Expect stores property as array.');
                assert.isNotNull(bodyAsJson.locations, 'Expect locations property in response.');
                assert.isString(bodyAsJson.locations, 'Expect locations property as array.');

                done();
            });
        });
    });
});
