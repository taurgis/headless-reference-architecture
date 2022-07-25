var storeMgr = {
    searchStoresByPostalCode: function () {
        return {
            keySet: function () {
                return [{
                    ID: 'Any ID',
                    name: 'Downtown TV Shop',
                    address1: '333 Washington St',
                    address2: '',
                    city: 'Boston',
                    postalCode: '01803',
                    phone: '333-333-3333',
                    stateCode: 'MA',
                    countryCode: {
                        value: 'us'
                    },
                    latitude: 42.5273334,
                    longitude: -71.13758250000001,
                    storeHours: {
                        markup: 'Mon - Sat: 10am - 9pm'
                    }
                }];
            }
        };
    },

    searchStoresByCoordinates: function () {
        return {
            keySet: function () {
                return [{
                    ID: 'Any ID',
                    name: 'Downtown TV Shop',
                    address1: '333 Washington St',
                    address2: '',
                    city: 'Boston',
                    postalCode: '01803',
                    phone: '333-333-3333',
                    stateCode: 'MA',
                    countryCode: {
                        value: 'us'
                    },
                    latitude: 42.5273334,
                    longitude: -71.13758250000001,
                    storeHours: {
                        markup: 'Mon - Sat: 10am - 9pm'
                    }
                }];
            }
        };
    }

};

module.exports = {
    searchStoresByPostalCode: storeMgr.searchStoresByPostalCode,
    searchStoresByCoordinates: storeMgr.searchStoresByCoordinates
};
