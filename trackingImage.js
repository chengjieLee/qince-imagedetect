const trackingImage = {};

/**
 * Converts a color from a colorspace based on an RGB color model to a
 * grayscale representation of its luminance. The coefficients represent the
 * measured intensity perception of typical trichromat humans, in
 * particular, human vision is most sensitive to green and least sensitive
 * to blue.
 * @param {pixels} pixels The pixels in a linear [r,g,b,a,...] array.
 * @param {number} width The image width.
 * @param {number} height The image height.
 * @param {boolean} fillRGBA If the result should fill all RGBA values with the gray scale
 *  values, instead of returning a single value per pixel.
 * @param {Uint8ClampedArray} The grayscale pixels in a linear array ([p,p,p,a,...] if fillRGBA
 *  is true and [p1, p2, p3, ...] if fillRGBA is false).
 * @static
 */
trackingImage.grayscale = function (pixels, width, height, fillRGBA) {
	var gray = new Uint8ClampedArray(
		fillRGBA ? pixels.length : pixels.length >> 2
	);
	var p = 0;
	var w = 0;
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			var value =
				pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114;
			gray[p++] = value;

			if (fillRGBA) {
				gray[p++] = value;
				gray[p++] = value;
				gray[p++] = pixels[w + 3];
			}

			w += 4;
		}
	}
	return gray;
};


export default trackingImage;