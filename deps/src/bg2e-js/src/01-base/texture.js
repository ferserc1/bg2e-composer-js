(function() {

	bg.base.TextureUnit = {
		TEXTURE_0: 0,
		TEXTURE_1: 1,
		TEXTURE_2: 2,
		TEXTURE_3: 3,
		TEXTURE_4: 4,
		TEXTURE_5: 5,
		TEXTURE_6: 6,
		TEXTURE_7: 7,
		TEXTURE_8: 8,
		TEXTURE_9: 9,
		TEXTURE_10: 10,
		TEXTURE_11: 11,
		TEXTURE_12: 12,
		TEXTURE_13: 13,
		TEXTURE_14: 14,
		TEXTURE_15: 15,
		TEXTURE_16: 16,
		TEXTURE_17: 17,
		TEXTURE_18: 18,
		TEXTURE_19: 19,
		TEXTURE_20: 20,
		TEXTURE_21: 21,
		TEXTURE_22: 22,
		TEXTURE_23: 23,
		TEXTURE_24: 24,
		TEXTURE_25: 25,
		TEXTURE_26: 26,
		TEXTURE_27: 27,
		TEXTURE_28: 28,
		TEXTURE_29: 29,
		TEXTURE_30: 30
	};
	
	bg.base.TextureWrap = {
		REPEAT: null,
		CLAMP: null,
		MIRRORED_REPEAT: null
	};
	
	bg.base.TextureFilter = {
		NEAREST_MIPMAP_NEAREST: null,
		LINEAR_MIPMAP_NEAREST: null,
		NEAREST_MIPMAP_LINEAR: null,
		LINEAR_MIPMAP_LINEAR: null,
		NEAREST: null,
		LINEAR: null
	};
	
	bg.base.TextureTarget = {
		TEXTURE_2D: null,
		CUBE_MAP: null,
		POSITIVE_X_FACE: null,
		NEGATIVE_X_FACE: null,
		POSITIVE_Y_FACE: null,
		NEGATIVE_Y_FACE: null,
		POSITIVE_Z_FACE: null,
		NEGATIVE_Z_FACE: null
	};
		
	class TextureImpl {
		constructor(context) {
			this.initFlags(context);
		}
	
		initFlags(context) {
			console.log("TextureImpl: initFlags() method not implemented");
		}
		
		create(context) {
			console.log("TextureImpl: create() method not implemented");
			return null;
		}
		
		setActive(context,texUnit) {
			console.log("TextureImpl: setActive() method not implemented");
		}
		
		bind(context,target,texture) {
			console.log("TextureImpl: bind() method not implemented");
		}
		
		unbind(context,target) {
			console.log("TextureImpl: unbind() method not implemented");
		}
		
		setTextureWrapX(context,target,texture,wrap) {
			console.log("TextureImpl: setTextureWrapX() method not implemented");
		}
		
		setTextureWrapY(context,target,texture,wrap) {
			console.log("TextureImpl: setTextureWrapY() method not implemented");
		}
		
		setImage(context,target,minFilter,magFilter,texture,img,flipY) {
			console.log("TextureImpl: setImage() method not implemented");
		}
		
		setImageRaw(context,target,minFilter,magFilter,texture,width,height,data) {
			console.log("TextureImpl: setImageRaw() method not implemented");
		}

		setTextureFilter(context,target,minFilter,magFilter) {
			console.log("TextureImpl: setTextureFilter() method not implemented");
		}

		setCubemapImage(context,face,image) {
			console.log("TextureImpl: setCubemapImage() method not implemented");
		}

		setCubemapRaw(context,face,rawImage,w,h) {
			console.log("TextureImpl: setCubemapRaw() method not implemented");
		}

		setVideo(context,target,texture,video,flipY) {
			console.log("TextureImpl: setVideo() method not implemented");
		}

		updateVideoData(context,target,texture,video) {
			console.log("TextureImpl: updateVideoData() method not implemented");
		}

		destroy(context,texture) {
			console.log("TextureImpl: destroy() method not implemented");
		}
	}
	
	bg.base.TextureImpl = TextureImpl;

	bg.base.TextureDataType = {
		NONE: 0,
		IMAGE: 1,
		IMAGE_DATA: 2,
		CUBEMAP: 3,
		CUBEMAP_DATA: 4,
		VIDEO: 5
	};

	let g_base64TexturePreventRemove = [];

	class Texture extends bg.app.ContextObject {
		static IsPowerOfTwoImage(image) {
			return bg.Math.checkPowerOfTwo(image.width) && bg.Math.checkPowerOfTwo(image.height);
		}

		static FromCanvas(context,canvas2d) {
			return Texture.FromBase64Image(context,canvas2d.toDataURL("image/png"));
		}

		static UpdateCanvasImage(texture,canvas2d) {
			if (!texture.valid) {
				return false;
			}
			let imageData = canvas2d.toDataURL("image/png");
			let recreate = false;
			if (texture.img.width!=imageData.width || texture.img.height!=imageData.height) {
				recreate = true;
			}
			texture.img = new Image();
			g_base64TexturePreventRemove.push(texture);
			//tex.onload = function(evt,img) {
			// Check this: use onload or setTimeout?
			// onload seems to not work in all situations
			setTimeout(() => {
				texture.bind();
				if (Texture.IsPowerOfTwoImage(texture.img)) {
					texture.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
					texture.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
				}
				else {
					texture.minFilter = bg.base.TextureFilter.NEAREST;
					texture.magFilter = bg.base.TextureFilter.NEAREST;
					texture.wrapX = bg.base.TextureWrap.CLAMP;
					texture.wrapY = bg.base.TextureWrap.CLAMP;
				}
				texture.setImage(texture.img,true);
				texture.unbind();
				let index = g_base64TexturePreventRemove.indexOf(texture);
				if (index!=-1) {
					g_base64TexturePreventRemove.splice(index,1);
				}
				bg.emitImageLoadEvent();
			//}
			},100);
			texture.img.src = imageData;
			
			return texture;
		}

		static FromBase64Image(context,imgData) {
			let tex = new bg.base.Texture(context);
			tex.img = new Image();
			g_base64TexturePreventRemove.push(tex);
			//tex.onload = function(evt,img) {
			// Check this: use onload or setTimeout?
			// onload seems to not work in all situations
			tex.promise = new Promise((resolve,reject) => {
				setTimeout(() => {
					tex.create();
					tex.bind();
					if (Texture.IsPowerOfTwoImage(tex.img)) {
						tex.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
						tex.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
					}
					else {
						tex.minFilter = bg.base.TextureFilter.NEAREST;
						tex.magFilter = bg.base.TextureFilter.NEAREST;
						tex.wrapX = bg.base.TextureWrap.CLAMP;
						tex.wrapY = bg.base.TextureWrap.CLAMP;
					}
					tex.setImage(tex.img,false);	// Check this: flip base64 image?
					tex.unbind();
					let index = g_base64TexturePreventRemove.indexOf(tex);
					if (index!=-1) {
						g_base64TexturePreventRemove.splice(index,1);
					}
					bg.emitImageLoadEvent();
					resolve(tex);
				},10);
			})
			tex.img.src = imgData;
			
			return tex;
		}
		
		static ColorTexture(context,color,size) {
			let colorTexture = new bg.base.Texture(context);
			colorTexture.create();
			colorTexture.bind();

			var dataSize = size.width * size.height * 4;
			var textureData = [];
			for (var i = 0; i < dataSize; i+=4) {
				textureData[i]   = color.r * 255;
				textureData[i+1] = color.g * 255;
				textureData[i+2] = color.b * 255;
				textureData[i+3] = color.a * 255;
			}
			
			textureData = new Uint8Array(textureData);

			colorTexture.minFilter = bg.base.TextureFilter.NEAREST;
			colorTexture.magFilter = bg.base.TextureFilter.NEAREST;
			colorTexture.setImageRaw(size.width,size.height,textureData);
			colorTexture.unbind();

			return colorTexture;
		}
		
		static WhiteTexture(context,size) {
			return Texture.ColorTexture(context,bg.Color.White(),size);
		}

		static WhiteCubemap(context) {
			return Texture.ColorCubemap(context, bg.Color.White());
		}

		static BlackCubemap(context) {
			return Texture.ColorCubemap(context, bg.Color.Black());
		}

		static ColorCubemap(context,color) {
			let cm = new bg.base.Texture(context);
			cm.target = bg.base.TextureTarget.CUBE_MAP;
			cm.create();
			cm.bind();

			let dataSize = 32 * 32 * 4;
			let textureData = [];
			for (let i = 0; i<dataSize; i+=4) {
				textureData[i] 		= color.r * 255;
				textureData[i + 1] 	= color.g * 255;
				textureData[i + 2] 	= color.b * 255;
				textureData[i + 3] 	= color.a * 255;
			}

			textureData = new Uint8Array(textureData);

			cm.setCubemapRaw(
				32,
				32,
				textureData,
				textureData,
				textureData,
				textureData,
				textureData,
				textureData
			);

			cm.unbind();
			return cm;
		}
		
		static NormalTexture(context,size) {
			return Texture.ColorTexture(context,new bg.Color(0.5,0.5,1,1),size);
		}
		
		static BlackTexture(context,size) {
			return Texture.ColorTexture(context,bg.Color.Black(),size);
		}

		static RandomTexture(context,size) {
			let colorTexture = new bg.base.Texture(context);
			colorTexture.create();
			colorTexture.bind();

			var dataSize = size.width * size.height * 4;
			var textureData = [];
			for (var i = 0; i < dataSize; i+=4) {
				let randVector = new bg.Vector3(bg.Math.random() * 2.0 - 1.0,
												bg.Math.random() * 2.0 - 1.0,
												0);
				randVector.normalize();

				textureData[i]   = randVector.x * 255;
				textureData[i+1] = randVector.y * 255;
				textureData[i+2] = randVector.z * 255;
				textureData[i+3] = 1;
			}
			
			textureData = new Uint8Array(textureData);

			colorTexture.minFilter = bg.base.TextureFilter.NEAREST;
			colorTexture.magFilter = bg.base.TextureFilter.NEAREST;
			colorTexture.setImageRaw(size.width,size.height,textureData);
			colorTexture.unbind();

			return colorTexture;
		}

		/*
		 *	Precomputed BRDF, for using with PBR shaders
		 */
		static PrecomputedBRDFLookupTexture(context) {
			return Texture.FromBase64Image(context,bg.base._brdfLUTData);
		}

		/*
		 *	Create a texture using an image.
		 *		context: the rendering context
		 *		image: a valid image object (for example, an <image> tag)
		 *		url: unique URL for this image, used as index for the texture cache
		 */
		static FromImage(context,image,url) {
			let texture = null;
			if (image) {
				texture = bg.base.TextureCache.Get(context).find(url);
				if (!texture) {
					bg.log(`Texture ${url} not found. Loading texture`);
					texture = new bg.base.Texture(context);
					texture.create();
					texture.bind();
					texture.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
					texture.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
					texture.setImage(image);
					texture.fileName = url;
					bg.base.TextureCache.Get(context).register(url,texture);
				}
			}
			return texture;
		}
		
		static SetActive(context,textureUnit) {
			bg.Engine.Get().texture.setActive(context,textureUnit);
		}
		
		static Unbind(context, target) {
			if (!target) {
				target = bg.base.TextureTarget.TEXTURE_2D;
			}
			bg.Engine.Get().texture.unbind(context,target);
		}
		
		constructor(context) {
			super(context);
			
			this._texture = null;
			this._fileName = "";
			this._size = new bg.Vector2(0);
			this._target = bg.base.TextureTarget.TEXTURE_2D;
			
			this._minFilter = bg.base.TextureFilter.LINEAR;
			this._magFilter = bg.base.TextureFilter.LINEAR;
			
			this._wrapX = bg.base.TextureWrap.REPEAT;
			this._wrapY = bg.base.TextureWrap.REPEAT;

			this._video = null;
		}
		
		get texture() { return this._texture; }
		get target() { return this._target; }
		set target(t) { this._target = t; }
		get fileName() { return this._fileName; }
		set fileName(fileName) { this._fileName = fileName; }
		set minFilter(f) { this._minFilter = f; }
		set magFilter(f) { this._magFilter = f; }
		get minFilter() { return this._minFilter; }
		get magFilter() { return this._magFilter; }
		set wrapX(w) { this._wrapX = w; }
		set wrapY(w) { this._wrapY = w; }
		get wrapX() { return this._wrapX; }
		get wrapY() { return this._wrapY; }
		get size() { return this._size; }
		

		// Access to image data structures
		get image() { return this._image; }
		get imageData() { return this._imageData; }
		get cubeMapImages() { return this._cubeMapImages; }
		get cubeMapData() { return this._cubeMapData; }
		get video() { return this._video; }

		get dataType() {
			if (this._image) {
				return bg.base.TextureDataType.IMAGE;
			}
			else if (this._imageData) {
				return bg.base.TextureDataType.IMAGE_DATA;
			}
			else if (this._cubeMapImages) {
				return bg.base.TextureDataType.CUBEMAP;
			}
			else if (this._cubeMapData) {
				return bg.base.TextureDataType.CUBEMAP_DATA;
			}
			else if (this._video) {
				return bg.base.TextureDataType.VIDEO;
			}
			else {
				return bg.base.TextureDataType.NONE;
			}
		}

		create() {
			if (this._texture!==null) {
				this.destroy()
			}
			this._texture = bg.Engine.Get().texture.create(this.context);
		}
		
		setActive(textureUnit) {
			bg.Engine.Get().texture.setActive(this.context,textureUnit);
		}
		
		
		bind() {
			bg.Engine.Get().texture.bind(this.context,this._target,this._texture);
		}
		
		unbind() {
			Texture.Unbind(this.context,this._target);
		}
		
		setImage(img, flipY) {
			if (flipY===undefined) flipY = true;
			this._size.width = img.width;
			this._size.height = img.height;
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
			bg.Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
			bg.Engine.Get().texture.setImage(this.context,this._target,this._minFilter,this._magFilter,this._texture,img,flipY);

			this._image = img;
			this._imageData = null;
			this._cubeMapImages = null;
			this._cubeMapData = null;
			this._video = null;
		}

		updateImage(img, flipY) {
			if (flipY===undefined) flipY = true;
			this._size.width = img.width;
			this._size.height = img.height;
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
			bg.Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
			bg.Engine.Get().texture.setImage(this.context,this._target,this._minFilter,this._magFilter,this._texture,img,flipY);

			this._image = img;
			this._imageData = null;
			this._cubeMapImages = null;
			this._cubeMapData = null;
			this._video = null;
		}
		
		setImageRaw(width,height,data,type,format) {
			if (!type) {
				type = this.context.RGBA;
			}
			if (!format) {
				format = this.context.UNSIGNED_BYTE;
			}
			this._size.width = width;
			this._size.height = height;
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
			bg.Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
			bg.Engine.Get().texture.setImageRaw(this.context,this._target,this._minFilter,this._magFilter,this._texture,width,height,data,type,format);

			this._image = null;
			this._imageData = data;
			this._cubeMapImages = null;
			this._cubeMapData = null;
			this._video = null;
		}

		setCubemap(posX,negX,posY,negY,posZ,negZ) {
			bg.Engine.Get().texture.bind(this.context,this._target,this._texture);
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapY);
			bg.Engine.Get().texture.setTextureFilter(this.context,this._target,this._minFilter,this._magFilter);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.POSITIVE_X_FACE,posX);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.NEGATIVE_X_FACE,negX);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.POSITIVE_Y_FACE,posY);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.NEGATIVE_Y_FACE,negY);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.POSITIVE_Z_FACE,posZ);
			bg.Engine.Get().texture.setCubemapImage(this.context,bg.base.TextureTarget.NEGATIVE_Z_FACE,negZ);

			this._image = null;
			this._imageData = null;
			this._cubeMapImages = {
				posX: posX,
				negX: negX,
				posY: posY,
				negY: negY,
				posZ: posZ,
				negZ: negZ
			};
			this._cubeMapData = null;
			this._video = null;
		}

		setCubemapRaw(w,h,posX,negX,posY,negY,posZ,negZ) {
			bg.Engine.Get().texture.bind(this.context,this._target,this._texture);
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
			bg.Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapY);
			bg.Engine.Get().texture.setTextureFilter(this.context,this._target,this._minFilter,this._magFilter);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.POSITIVE_X_FACE,posX,w,h);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.NEGATIVE_X_FACE,negX,w,h);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.POSITIVE_Y_FACE,posY,w,h);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.NEGATIVE_Y_FACE,negY,w,h);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.POSITIVE_Z_FACE,posZ,w,h);
			bg.Engine.Get().texture.setCubemapRaw(this.context,bg.base.TextureTarget.NEGATIVE_Z_FACE,negZ,w,h);

			this._image = null;
			this._imageData = null;
			this._cubeMapImages = null;
			this._cubeMapData = {
				width: w,
				height: h,
				posX:posX,
				negX:negX,
				posY:posY,
				negY:negY,
				posZ:posZ,
				negZ:negZ
			};
			this._video = null;
		}

		setVideo(video, flipY) {
			if (flipY===undefined) flipY = true;
			this._size.width = video.videoWidth;
			this._size.height = video.videoHeight;
			bg.Engine.Get().texture.setVideo(this.context,this._target,this._texture,video,flipY);
			this._video = video;

			this._image = null;
			this._imageData = null;
			this._cubeMapImages = null;
			this._cubeMapData = null;
		}

		destroy() {
			bg.Engine.Get().texture.destroy(this.context,this._texture);
			this._texture = null;
			this._minFilter = null;
			this._magFilter = null;
			this._fileName = "";
		}

		valid() {
			return this._texture!==null;
		}

		update() {
			bg.Engine.Get().texture.updateVideoData(this.context,this._target,this._texture,this._video);
		}
	}
	
	bg.base.Texture = Texture;
		
})();
