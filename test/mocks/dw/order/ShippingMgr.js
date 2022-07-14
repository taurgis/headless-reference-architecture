
var ArrayList = require('../../../mocks/dw.util.Collection');

var defaultShippingMethod =
    {
        description: 'Order received within 7-10 business days',
        displayName: 'Ground',
        ID: '001',
        custom: {
            estimatedArrivalTime: '7-10 Business Days'
        }
    };

function createShipmentShippingModel() {
    return {
        applicableShippingMethods: new ArrayList([
            {
                description: 'Order received within 7-10 business days',
                displayName: 'Ground',
                ID: '001',
                custom: {
                    estimatedArrivalTime: '7-10 Business Days'
                }
            },
            {
                description: 'Order received in 2 business days',
                displayName: '2-Day Express',
                ID: '002',
                shippingCost: '$0.00',
                custom: {
                    estimatedArrivalTime: '2 Business Days'
                }
            }
        ]),
        getApplicableShippingMethods: function () {
            return new ArrayList([
                {
                    description: 'Order received within 7-10 business days',
                    displayName: 'Ground',
                    ID: '001',
                    custom: {
                        estimatedArrivalTime: '7-10 Business Days'
                    }
                },
                {
                    description: 'Order received in 2 business days',
                    displayName: '2-Day Express',
                    ID: '002',
                    shippingCost: '$0.00',
                    custom: {
                        estimatedArrivalTime: '2 Business Days'
                    }
                }
            ]);
        },
        getShippingCost: function () {
            return {
                amount: {
                    valueOrNull: 7.99
                }
            };
        }
    };
}

module.exports = {
    getDefaultShippingMethod: function () {
        return defaultShippingMethod;
    },
    getShipmentShippingModel: function (shipment) {
        return createShipmentShippingModel(shipment);
    }
};
