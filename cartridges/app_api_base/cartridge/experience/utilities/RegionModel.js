var RegionRenderSettings = require('dw/experience/RegionRenderSettings');
var ComponentRenderSettings = require('dw/experience/ComponentRenderSettings');
var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');

/**
 * Set name/value attribute pair at given settings object, this can be a settings
 * of a component, a region and either default or a specific one.
 *
 * @param {*} renderSettings region or component rendering settings
 * @param {string} name the attribute name to set
 * @param {string} value the attribute value to set
 */
function setAttribute(renderSettings, name, value) {
    if (renderSettings !== null) {
        var attr = renderSettings.getAttributes() || new HashMap();
        attr.put(name, value);
        renderSettings.setAttributes(attr);
    }
}

/**
 * A script representation of a region, which adds convenient access to the regions
 * and its components render settings and a shortcut to render given region
 *
 * @param {*} container The page or parent region
 * @param {string} name The name of the region
 *
 * @class
 */
function RegionModel(container, name) {
    this.region = container.getRegion(name);
    this.regionRenderSettings = (new RegionRenderSettings()).setTagName('div');
    this.defaultComponentRenderSettings = (new ComponentRenderSettings()).setTagName('div');
    this.regionRenderSettings.setDefaultComponentRenderSettings(this.defaultComponentRenderSettings);
}

/**
 * Set the tag name of a region
 *
 * @param {string} name the name of the tag (default: div)
 * @param {booleam} inComponents wether the tag should be used in its components too (default: div)
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setTagName = function tagName(name, inComponents) {
    this.regionRenderSettings.setTagName(name);
    if (inComponents) {
        this.defaultComponentRenderSettings = (new ComponentRenderSettings()).setTagName(name);
        this.regionRenderSettings.setDefaultComponentRenderSettings(this.defaultComponentRenderSettings);
    }
    return this;
};

/**
 * Set the class name of a region
 *
 * @param {string} cssClass the class name(s) of the region
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setClassName = function setClassName(cssClass) {
    setAttribute(this.regionRenderSettings, 'class', cssClass);
    return this;
};

/**
 * Set attribute of the region container
 *
 * @param {string} name the region tag attribute name
 * @param {string} value the region tag attribute value
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setAttribute = function attr(name, value) {
    setAttribute(this.regionRenderSettings, name, value);
    return this;
};

/**
 * Set the tag name for a given or all components of a region
 *
 * @param {string} tagName the component tag name to set
 * @param {number} [position] optional position to only set it for a specific component
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setComponentTagName = function componentTagName(tagName, position) {
    if (typeof position === 'number') {
        // ignore request in case position is invalid
        if (!this.region.visibleComponents
            || position >= this.region.visibleComponents.length) {
            return this;
        }

        this.region.visibleComponents[position].setTagName(tagName);
    } else {
        this.defaultComponentRenderSettings.setTagName(tagName);
    }

    return this;
};

/**
 * Set the class name for a given or all components of a region
 *
 * @param {*} cssClass the component class name to set
 * @param {string} componentSelector optional has position attribute to only set it for a specific component
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setComponentClassName = function setComponentClassName(cssClass, componentSelector) {
    this.setComponentAttribute('class', cssClass, componentSelector);
    return this;
};

/**
 * Set a given attribute to a given or all components of a region
 *
 * @param {string} name the name of the attribute
 * @param {string} value the value of the attribute
 * @param {string} componentSelector optional has position attribute to only set it for a specific component
 * @return {RegionModel} The region model object
 */
RegionModel.prototype.setComponentAttribute = function setComponentAttribute(name, value, componentSelector) {
    // default is all components
    var renderSettings = this.defaultComponentRenderSettings;
    var position = componentSelector && componentSelector.position;
    var component;
    // when position is set, only set for the component at that position
    if (typeof position === 'number') {
        // ignore request in case position is invalid
        if (!this.region.visibleComponents
            || position >= this.region.visibleComponents.length) {
            return this;
        }
        component = this.region.visibleComponents[position];
        renderSettings = this.regionRenderSettings.getComponentRenderSettings(component);
    }

    setAttribute(renderSettings, name, value);

    if (component) {
        this.regionRenderSettings.setComponentRenderSettings(component, renderSettings);
    }

    return this;
};

/**
 * Renders the entire region
 *
 * @returns {Object} the rendered region
 */
RegionModel.prototype.render = function render() {
    return PageMgr.renderRegion(this.region, this.regionRenderSettings);
};

module.exports = RegionModel;
