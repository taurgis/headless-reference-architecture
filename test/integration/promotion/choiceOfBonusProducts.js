var assert = require('chai').assert;
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

var request = require('request-promise');
var config = require('../it.config');


describe('Test Choice of bonus Products promotion Mini cart response.', function () {
    this.timeout(50000);
    var VARIANT_PID = '013742002454M';
    var QTY = 3;
    var UUID;

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

    it('should  not return the bonus products, if qty is too low.', function () {
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: VARIANT_PID,
            quantity: QTY
        };

        var expectedResponse = {};

        return request(myRequest)
            .then(function (myResponse) {
                assert.equal(myResponse.statusCode, 200);
                var bodyAsJson = JSON.parse(myResponse.body);
                assert.equal(
                    JSON.stringify(bodyAsJson.newBonusDiscountLineItem),
                    JSON.stringify(expectedResponse));
            });
    });

    it('should return the bonus products, if qty is sufficient.', function () {
        // ----- adding product item #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: VARIANT_PID,
            quantity: QTY
        };

        var expectedPidArray = [
            '008885004540M',
            '008884304047M',
            '883360390116M',
            'pioneer-pdp-6010fdM'];
        var expectedLabels = {
            'close': 'Close',
            'maxprods': 'of 2 Bonus Products Selected:',
            'selectprods': 'Select Bonus Products'
        };

        return request(myRequest)
        .then(function (myResponse) {
            var bodyAsJson = JSON.parse(myResponse.body);
            UUID = bodyAsJson.newBonusDiscountLineItem.uuid;
            assert.equal(myResponse.statusCode, 200);
            assert.equal(bodyAsJson.newBonusDiscountLineItem.bonuspids.length, expectedPidArray.length);
            assert.containSubset(bodyAsJson.newBonusDiscountLineItem.bonuspids, expectedPidArray);
            assert.containSubset(bodyAsJson.newBonusDiscountLineItem.maxBonusItems, 2);
            assert.containSubset(bodyAsJson.newBonusDiscountLineItem.labels, expectedLabels);
        });
    });

    it('should return an error if too many bonus products are added to the cart', function () {
        // ----- adding product item #1:
        var urlQuerystring = '?pids=' +
            JSON.stringify({
                'bonusProducts':
                [{
                    'pid': '008885004540M',
                    'qty': 3,
                    'options': [null]
                }],
                'totalQty': 2 });
        urlQuerystring += '&uuid=' + UUID;
        myRequest.url = config.baseUrl + '/Cart-AddBonusProducts' + urlQuerystring;

        var expectedSubSet = {
            'errorMessage': 'You can choose 2 products, but you have selected 3 products.',
            'error': true,
            'success': false
        };

        return request(myRequest)
        .then(function (myResponse) {
            var bodyAsJson = JSON.parse(myResponse.body);
            assert.equal(myResponse.statusCode, 200);
            assert.containSubset(bodyAsJson, expectedSubSet);
        });
    });
});

describe('Add rule base Bonus Product to cart', function () {
    this.timeout(45000);

    var variantPid1 = '701642842668M';
    var qty1 = 1;
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

    var duuid;
    var pliuuid;
    var pageSize;
    var bonusChoiceRuleBased;

    before(function () {
        // ----- adding qualifying product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
            .then(function (response) {
                var bodyAsJson = JSON.parse(response.body);
                duuid = bodyAsJson.newBonusDiscountLineItem.uuid;
                bonusChoiceRuleBased = bodyAsJson.newBonusDiscountLineItem.bonusChoiceRuleBased;
                pageSize = parseInt(bodyAsJson.newBonusDiscountLineItem.pageSize, 10);
                pliuuid = bodyAsJson.newBonusDiscountLineItem.pliUUID;
            });
    });

    it('It should reflect as a rule based bonus product', function () {
        assert.equal(pageSize, 6);
        assert.equal(bonusChoiceRuleBased, true);
        assert.isNotNull(duuid);
    });

    it('bring up the edit bonus product window', function () {
        // console.log('duuid ' + duuid);
        myRequest.url = config.baseUrl + '/Cart-EditBonusProduct?duuid=' + duuid;
        myRequest.form = {
            duuid: duuid
        };
        myRequest.method = 'GET';
        // console.log(myRequest.url);
        return request(myRequest)
        .then(function (response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(bodyAsJson.action, 'Cart-EditBonusProduct');
            assert.equal(bodyAsJson.addToCartUrl, '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-AddBonusProducts');
            assert.equal(bodyAsJson.showProductsUrl, '/on/demandware.store/Sites-RefArch-Site/en_US/Product-ShowBonusProducts');
            assert.equal(bodyAsJson.maxBonusItems, 2);
            assert.equal(pageSize, 6);
            assert.equal(bodyAsJson.pliUUID, pliuuid);
            assert.equal(bodyAsJson.uuid, duuid);
            assert.equal(bodyAsJson.bonusChoiceRuleBased, true);
            assert.equal(bodyAsJson.showProductsUrlRuleBased, '/on/demandware.store/Sites-RefArch-Site/en_US/Product-ShowBonusProducts?DUUID=' + duuid + '&pagesize=' + pageSize + '&pagestart=0&maxpids=' + bodyAsJson.maxBonusItems);
        });
    });

    it('Add Bonus Product to cart', function () {
        var addBonusQueryString = '?pids={%22bonusProducts%22:[{%22pid%22:%22008884304023M%22,%22qty%22:1,%22options%22:[null]}],%22totalQty%22:1}&uuid=' + duuid + '&pliuuid=' + pliuuid;
        myRequest.url = config.baseUrl + '/Cart-AddBonusProducts' + addBonusQueryString;
        myRequest.form = {
            duuid: duuid
        };
        myRequest.method = 'POST';
        return request(myRequest)
        .then(function (response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(bodyAsJson.action, 'Cart-AddBonusProducts');
            assert.equal(bodyAsJson.totalQty, 2);
            assert.equal(bodyAsJson.msgSuccess, 'Bonus products added to your cart');
            assert.isTrue(bodyAsJson.success);
            assert.isFalse(bodyAsJson.error);
        });
    });
});

describe('Add list base Bonus Product to cart', function () {
    this.timeout(45000);

    var variantPid1 = '013742002454M';
    var qty1 = 5;
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

    var duuid;
    var pliuuid;
    var bonusChoiceRuleBased;
    var bonuspids;

    before(function () {
        // ----- adding qualifying product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };

        return request(myRequest)
            .then(function (response) {
                var bodyAsJson = JSON.parse(response.body);
                duuid = bodyAsJson.newBonusDiscountLineItem.uuid;
                bonusChoiceRuleBased = bodyAsJson.newBonusDiscountLineItem.bonusChoiceRuleBased;
                pliuuid = bodyAsJson.newBonusDiscountLineItem.pliUUID;
                bonuspids = bodyAsJson.newBonusDiscountLineItem.bonuspids;
            });
    });

    it('It should reflect as a rule based bonus product', function () {
        var bonuspidsExpected = [
            '008885004540M',
            '008884304047M',
            '883360390116M',
            'pioneer-pdp-6010fdM'
        ];

        assert.equal(bonusChoiceRuleBased, false);
        assert.isNotNull(duuid);
        assert.equal(bonuspids[0], bonuspidsExpected[0]);
        assert.equal(bonuspids[1], bonuspidsExpected[1]);
        assert.equal(bonuspids[2], bonuspidsExpected[2]);
        assert.equal(bonuspids[3], bonuspidsExpected[3]);
    });

    it('bring up the edit bonus product window', function () {
        myRequest.url = config.baseUrl + '/Cart-EditBonusProduct?duuid=' + duuid;
        myRequest.form = {
            duuid: duuid
        };
        myRequest.method = 'GET';
        return request(myRequest)
        .then(function (response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(bodyAsJson.action, 'Cart-EditBonusProduct');
            assert.equal(bodyAsJson.addToCartUrl, '/on/demandware.store/Sites-RefArch-Site/en_US/Cart-AddBonusProducts');
            assert.equal(bodyAsJson.showProductsUrl, '/on/demandware.store/Sites-RefArch-Site/en_US/Product-ShowBonusProducts');
            assert.equal(bodyAsJson.maxBonusItems, 2);
            assert.equal(bodyAsJson.pliUUID, pliuuid);
            assert.equal(bodyAsJson.uuid, duuid);
            assert.equal(bodyAsJson.bonusChoiceRuleBased, false);
        });
    });

    it('Add Bonus Product to cart', function () {
        var addBonusQueryString = '?pids={%22bonusProducts%22:[{%22pid%22:%22008885004540M%22,%22qty%22:1,%22options%22:[null]}],%22totalQty%22:1}&uuid=' + duuid + '&pliuuid=' + pliuuid;
        myRequest.url = config.baseUrl + '/Cart-AddBonusProducts' + addBonusQueryString;
        myRequest.form = {
            duuid: duuid
        };
        myRequest.method = 'POST';
        return request(myRequest)
        .then(function (response) {
            var bodyAsJson = JSON.parse(response.body);
            assert.equal(bodyAsJson.action, 'Cart-AddBonusProducts');
            assert.equal(bodyAsJson.totalQty, 6);
            assert.equal(bodyAsJson.msgSuccess, 'Bonus products added to your cart');
            assert.isTrue(bodyAsJson.success);
            assert.isFalse(bodyAsJson.error);
        });
    });
});
