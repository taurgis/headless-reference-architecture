var ImageTransformation = {};
var BREAKPOINTS = require('*/cartridge/experience/breakpoints.json');
var Image = require('dw/experience/image/Image');
var MediaFile = require('dw/content/MediaFile');

var transformationCapabilities = [
    'scaleWidth',
    'scaleHeight',
    'scaleMode',
    'imageX',
    'imageY',
    'imageURI',
    'cropX',
    'cropY',
    'cropWidth',
    'cropHeight',
    'format',
    'quality',
    'strip'
];

/**
 * Calculates the required DIS transformation object based on the given parameters. Currently
 * only downscaling is performed.
 *
 * @param {Object} metaData the image meta data containing image width and height
 * @param {string} device the device the image should be scaled for (supported values: mobile, desktop)
 * @return {Object} The scaled object
 */
ImageTransformation.scale = function (metaData, device) {
    var transformObj = null;
    if (metaData && device) {
        var targetWidth = BREAKPOINTS[device];
        // only downscale if image is larger than desired width
        if (targetWidth && targetWidth < metaData.width) {
            transformObj = {
                scaleWidth: targetWidth,
                format: 'jpg',
                scaleMode: 'fit'
            };
        }
    }
    return transformObj;
};

/**
 * Creates a cleaned up transformation object
 * @param {*} options the paarmaters object which may hold additional properties not suppoerted by DIS e.g. option.device == 'mobile'
 * @param {*} transform a preconstructed transformation object
 * @return {Object} The transformed object.
 */
function constructTransformationObject(options, transform) {
    var result = transform || {};
    Object.keys(options).forEach(function (element) {
        if (transformationCapabilities.indexOf(element)) {
            result[element] = options[element];
        }
    });
    return result;
}

/**
 * Provides a url to the given media file image. DIS transformation will be applied as given.
 *
 * @param {Image|MediaFile} image the image for which the url should be obtained. In case of an Image type the options may add a device property to scale the image to
 * @param {Object} options the (optional) DIS transformation parameters or option with devices
 *
 * @return {string} The Absolute url
 */
ImageTransformation.url = function (image, options) {
    var transform = {};
    var mediaFile = image instanceof MediaFile ? image : image.file;

    if (image instanceof Image && options.device) {
        transform = ImageTransformation.scale(image.metaData, options.device);
    }
    transform = constructTransformationObject(options, transform);

    if (transform && Object.keys(transform).length) {
        return mediaFile.getImageURL(transform);
    }

    return mediaFile.getAbsURL();
};

/**
 * Return an object containing the scaled image for mobile, table and desktop.  Other included image details
 * are: alt text, focalPoint x, focalPoint y.
 *
 * @param {Image} image the image for which to be scaled.
 * @param {Object} The object containing the scaled image
 *
 * @return {string} The Absolute url
 */
ImageTransformation.getScaledImage = function (image) {
    return {
        src: {
            mobile: ImageTransformation.url(image.file, { device: 'mobile' }),
            tablet: ImageTransformation.url(image.file, { device: 'tablet' }),
            desktop: ImageTransformation.url(image.file, { device: 'desktop' })
        },
        alt: image.file.getAlt(),
        focalPointX: (image.focalPoint.x * 100) + '%',
        focalPointY: (image.focalPoint.y * 100) + '%'
    };
};

module.exports = ImageTransformation;
