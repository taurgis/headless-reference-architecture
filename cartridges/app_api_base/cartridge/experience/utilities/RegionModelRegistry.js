'use strict';

var RegionModel = require('*/cartridge/experience/utilities/RegionModel.js');

/**
 * Utility providing shortened access to render a subregion of the given container within a template
 *
 * @param {*} container the container obejct (a page or component)
 * @param {*} metaDataDefinition the object representation of the defintion JSON
 */
var RegionModelRegistry = function (container, metaDataDefinition) {
    this.container = container;
    this.addRegions(metaDataDefinition);
};

/**
 * Registers all regions that are defined in the given meta definitions.
 *
 * Returns nothing as it only registers the regions for itself.
 *
 * @param {Object} metadef The components meta definitions
 */
RegionModelRegistry.prototype.addRegions = function (metadef) {
    if (metadef && metadef.region_definitions) {
        metadef.region_definitions.forEach(function (regionDefinition) {
            var name = regionDefinition.id;
            if (!this[name]) {
                this[name] = new RegionModel(this.container, name);
            }
        }, this);
    }
};

module.exports = RegionModelRegistry;
