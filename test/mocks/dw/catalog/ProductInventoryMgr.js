var productInventoryMgr = {
    getInventoryList: function (inventoryListId) {
        var inventoryListId0001 = {
            getRecord: function (productID) {
                var product000001 = {
                    ATS: { value: 10 }
                };

                var product000002 = {
                    ATS: { value: 3 }
                };

                var product000003 = {
                    ATS: { value: 5 }
                };

                switch (productID) {
                    case '000001':
                        return product000001;
                    case '000002':
                        return product000002;
                    case '000003':
                        return product000003;
                    default:
                        return {};
                }
            }
        };

        var inventoryListId0002 = {
            getRecord: function (productID) {
                var product000001 = {
                    ATS: { value: 0 }
                };

                var product000002 = {
                    ATS: { value: 8 }
                };

                var product000003 = {
                    ATS: { value: 10 }
                };

                switch (productID) {
                    case '000001':
                        return product000001;
                    case '000002':
                        return product000002;
                    case '000003':
                        return product000003;
                    default:
                        return {};
                }
            }
        };

        var inventoryListId0003 = {
            getRecord: function (productID) {
                var product000001 = {
                    ATS: { value: 10 }
                };

                var product000002 = {
                    ATS: { value: 15 }
                };

                var product000003 = {
                    ATS: { value: 8 }
                };

                switch (productID) {
                    case '000001':
                        return product000001;
                    case '000002':
                        return product000002;
                    case '000003':
                        return product000003;
                    default:
                        return {};
                }
            }
        };

        switch (inventoryListId) {
            case 'inventoryListId0001':
                return inventoryListId0001;
            case 'inventoryListId0002':
                return inventoryListId0002;
            case 'inventoryListId0003':
                return inventoryListId0003;
            default:
                return {};
        }
    }
};

module.exports = {
    getInventoryList: productInventoryMgr.getInventoryList
};
