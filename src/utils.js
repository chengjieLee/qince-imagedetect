import trackingImage from "./trackingImage.js";

const getEnvironment = () => {
	const ua = window?.navigator?.userAgent?.toLowerCase();
	const isWeixin = ua.indexOf("micromessenger") !== -1 || ua.indexOf("wechat") !== -1 || (!!window.wx && !window.Image);
	const isInApp = /(^|;\s)app\//.test(ua);
	if (isWeixin) {
		if (window?.__wxjs_environment === "miniprogram" || !!window?.__wxAppCode__) {
			return "wxapp";
		} else {
			return "wxh5";
		}
	} else {
		if (!isInApp) {
			return "browser";
		} else {
			return "app";
		}
	}
};

const imageDetect = () => {
	// const tracking = window.tracking;
	const env = getEnvironment();
	/**
	 * @param { String } url 图片url 本地资源路径。。。
	 * @return { Promise } promiseObject resolve({brightness: Number,isGray: Boolean,isBright: Boolean,})
	 * @description 检测图片的明暗度，返回一个promise，返回值为一个对象，包含brightness: Number,isGray: Boolean,isBright: Boolean；brightness: 明暗值，isGray：是否过暗，isBright：是否过亮
	 */
	const checkLuminance = (url) => {
		return new Promise((resolve, reject) => {		
			if (env === "wxapp") {
				try {
					wx.getImageInfo({
						src: url,
						success: async (res) => {
							// 创建离屏canvas
							const canvas = wx?.createOffscreenCanvas({
								type: "2d",
								width: res.width,
								height: res.height,
							});
							const context = canvas?.getContext("2d");
							const image = canvas?.createImage();
							// 等待图片加载
							await new Promise((resolve) => {
								image.src = url; // 要加载的图片 url
								image.onload = resolve;
							});

							context.drawImage(image, 0, 0, res.width, res.height);
							const imgData = context.getImageData(0, 0, res.width, res.height);

							const gray = trackingImage.grayscale(
								imgData?.data,
								res.width,
								res.height
							);
							// 计算明暗度
							let brightness = 0;
							for (let i = 0; i < gray.length; i++) {
								brightness += gray[i];
							}
							brightness /= gray.length;

							resolve({
								brightness,
								isGray: brightness < 80,
								isBright: brightness > 150,
							});
						},
						fail: (error) => {
							reject(error);
						},
					});
				} catch (error) {
					reject(error);
				}
			} else {
				try {
					const image = new Image();
					image.src = url;
					image.onload = () => {
						const canvas = document.createElement("canvas");
						canvas.width = image.width || image?.offsetWidth;
						canvas.height = image.height || image?.offsetHeight;

						const context = canvas.getContext("2d");

						context.drawImage(image, 0, 0, canvas.width, canvas.height);

						const gray = trackingImage.grayscale(
							context.getImageData(0, 0, canvas.width, canvas.height)?.data,
							canvas.width,
							canvas.height
						);
						// 计算明暗度
						let brightness = 0;
						for (let i = 0; i < gray.length; i++) {
							brightness += gray[i];
						}

						brightness /= gray.length;

						resolve({
							brightness,
							isGray: brightness < 80,
							isBright: brightness > 150,
						});
					};
					image.onerror = () => {
						reject({
							error: '图片加载失败'
						});
					};
				} catch (error) {
					reject({
						error: JSON.stringify(error)
					});
				}
			}
		});
	};

		/**
	 * @param { String } url 图片url 本地资源路径。。。
	 * @return { Promise } promiseObject resolve({averageDiff: Number,isClear: Boolean,})
	 * @description 检测图片的清晰度，返回一个promise，返回值为一个对象，包含averageDiff: Number,isClear: Boolean；averageDiff: 清晰度，isClear：是否清晰
	 */
	const checkDim = (url) => {
		return new Promise((resolve, reject) => {
			if (env === "wxapp") {
				wx.getImageInfo({
					src: url,
					success: async (res) => {
						// 创建离屏canvas
						const canvas = wx?.createOffscreenCanvas({
							type: "2d",
							width: res.width,
							height: res.height,
						});
						const context = canvas?.getContext("2d");
						const image = canvas?.createImage();
						// 等待图片加载
						await new Promise((resolve) => {
							image.src = url; // 要加载的图片 url
							image.onload = resolve;
						});

						context.drawImage(image, 0, 0, res.width, res.height);
						const imgData = context.getImageData(0, 0, res.width, res.height);
						const data = imgData.data;

						// 计算图像的模糊程度
						let totalDiff = 0;
						for (let i = 0; i < data.length; i += 4) {
							// 计算像素的灰度值
							const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
							// 计算像素与相邻像素的差值
							if (i > 0) {
								const diff = Math.abs(
									gray - (data[i - 4] + data[i - 3] + data[i - 2]) / 3
								);
								totalDiff += diff;
							}
						}
						// 计算平均差值
						const averageDiff = totalDiff / (image.width * image.height);
						// 输出模糊程度
						resolve({
							averageDiff,
							isClear: averageDiff > 4,
						});
					},
					fail: (error) => {
						reject({
							error: JSON.stringify(error)
						});
					},
				});
			} else {
				try {
					const image = new Image();
					image.src = url;
					image.onload = () => {
						// 创建Canvas元素
						const canvas = document.createElement("canvas");
						canvas.width = image.width || image?.offsetWidth;
						canvas.height = image.height || image?.offsetHeight;
						const ctx = canvas.getContext("2d");
						canvas.width = image.width;
						canvas.height = image.height;
						ctx.drawImage(image, 0, 0, image.width, image.height);

						// 获取图像的像素数据
						const imageData = ctx.getImageData(0, 0, image.width, image.height);
						const data = imageData.data;

						// 计算图像的模糊程度
						let totalDiff = 0;
						for (let i = 0; i < data.length; i += 4) {
							// 计算像素的灰度值
							const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
							// 计算像素与相邻像素的差值
							if (i > 0) {
								const diff = Math.abs(
									gray - (data[i - 4] + data[i - 3] + data[i - 2]) / 3
								);
								totalDiff += diff;
							}
						}
						// 计算平均差值
						const averageDiff = totalDiff / (image.width * image.height);
						// 输出模糊程度
						resolve({
							averageDiff,
							isClear: averageDiff > 4,
						});
					};
					image.onerror = () => {
						reject({
							error: '图片加载失败'
						});
					};
				} catch (err) {
					reject({
						error: JSON.stringify(err)
					});
				}
			}
		});
	};

	return {
		checkLuminance, // 检测图像明暗
		checkDim, // 检测图像模糊程度
	};
};

export default imageDetect();
