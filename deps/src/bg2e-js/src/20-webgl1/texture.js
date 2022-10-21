(function() {
	
	class TextureImpl extends bg.base.TextureImpl {
		initFlags(context) {
			bg.base.TextureWrap.REPEAT = context.REPEAT;
			bg.base.TextureWrap.CLAMP = context.CLAMP_TO_EDGE;
			bg.base.TextureWrap.MIRRORED_REPEAT = context.MIRRORED_REPEAT;
			
			bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST = context.NEAREST_MIPMAP_NEAREST;
			bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST = context.LINEAR_MIPMAP_NEAREST;
			bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR = context.NEAREST_MIPMAP_LINEAR;
			bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR = context.LINEAR_MIPMAP_LINEAR;
			bg.base.TextureFilter.NEAREST = context.NEAREST;
			bg.base.TextureFilter.LINEAR = context.LINEAR;
			
			bg.base.TextureTarget.TEXTURE_2D 		= context.TEXTURE_2D;
			bg.base.TextureTarget.CUBE_MAP 		= context.TEXTURE_CUBE_MAP;
			bg.base.TextureTarget.POSITIVE_X_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_X;
			bg.base.TextureTarget.NEGATIVE_X_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_X;
			bg.base.TextureTarget.POSITIVE_Y_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_Y;
			bg.base.TextureTarget.NEGATIVE_Y_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_Y;
			bg.base.TextureTarget.POSITIVE_Z_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_Z;
			bg.base.TextureTarget.NEGATIVE_Z_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_Z;
		}
		
		requireMipmaps(minFilter,magFilter) {
			return	minFilter==bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST	||
					minFilter==bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST 	||
					minFilter==bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR 	||
					minFilter==bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR		||
					magFilter==bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST	||
					magFilter==bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST 	||
					magFilter==bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR	||
					magFilter==bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR;
		}
		
		create(context) {
			return context.createTexture();
		}
		
		setActive(context,texUnit) {
			context.activeTexture(context.TEXTURE0 + texUnit);
		}
		
		bind(context,target,texture) {
			context.bindTexture(target, texture);
		}
		
		unbind(context,target) {
			this.bind(context,target,null);
		}
		
		setTextureWrapX(context,target,texture,wrap) {
			context.texParameteri(target, context.TEXTURE_WRAP_S, wrap);
		}
		
		setTextureWrapY(context,target,texture,wrap) {
			context.texParameteri(target, context.TEXTURE_WRAP_T, wrap);
		}
		
		setImage(context,target,minFilter,magFilter,texture,img,flipY) {
			if (flipY) context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
			context.texParameteri(target, context.TEXTURE_MIN_FILTER, minFilter);
			context.texParameteri(target, context.TEXTURE_MAG_FILTER, magFilter);
			context.texImage2D(target,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE, img);
			if (this.requireMipmaps(minFilter,magFilter)) {
				context.generateMipmap(target);
			}
		}
		
		setImageRaw(context,target,minFilter,magFilter,texture,width,height,data,type,format) {
			if (!type) {
				type = context.RGBA;
			}
			if (!format) {
				format = context.UNSIGNED_BYTE;
			}
			if (format==bg.base.RenderSurfaceFormat.FLOAT) {
				minFilter = bg.base.TextureFilter.NEAREST;
				magFilter = bg.base.TextureFilter.NEAREST;
			}
			context.texParameteri(target, context.TEXTURE_MIN_FILTER, minFilter);
			context.texParameteri(target, context.TEXTURE_MAG_FILTER, magFilter);
			context.texImage2D(target,0, type,width,height,0,type,format, data);
			if (this.requireMipmaps(minFilter,magFilter)) {
				context.generateMipmap(target);
			}
		}

		setTextureFilter(context,target,minFilter,magFilter) {
			context.texParameteri(target,context.TEXTURE_MIN_FILTER,minFilter);
			context.texParameteri(target,context.TEXTURE_MAG_FILTER,magFilter);
		}

		setCubemapImage(context,face,image) {
			context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
			context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, bg.base.TextureFilter.LINEAR);
			context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MAG_FILTER, bg.base.TextureFilter.LINEAR);
			context.texImage2D(face, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
		}

		setCubemapRaw(context,face,rawImage,w,h) {
			let type = context.RGBA;
			let format = context.UNSIGNED_BYTE;
			context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, bg.base.TextureFilter.LINEAR);
			context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MAG_FILTER, bg.base.TextureFilter.LINEAR);
			context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
			context.texImage2D(face, 0, type, w, h, 0, type, format, rawImage);
		}

		setVideo(context,target,texture,video,flipY) {
			context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, flipY);
			context.texParameteri(target, context.TEXTURE_MAG_FILTER, context.LINEAR);
			context.texParameteri(target, context.TEXTURE_MIN_FILTER, context.LINEAR);
			context.texParameteri(target, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
			context.texParameteri(target, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
			context.texImage2D(target,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE,video);
		}

		updateVideoData(context,target,texture,video) {
			context.bindTexture(target, texture);
			context.texImage2D(target,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE,video);
			context.bindTexture(target,null);
		}

		destroy(context,texture) {
			context.deleteTexture(this._texture);
		}
	}
	
	bg.webgl1.TextureImpl = TextureImpl;
	
})();