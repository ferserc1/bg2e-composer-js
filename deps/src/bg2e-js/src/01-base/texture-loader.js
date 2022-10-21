(function() {
	let s_textureCache = {};
	
	let COLOR_TEXTURE_SIZE = 8;
	
	let s_whiteTexture = "static-white-color-texture";
	let s_blackTexture = "static-black-color-texture";
	let s_normalTexture = "static-normal-color-texture";
	let s_randomTexture = "static-random-color-texture";
	let s_whiteCubemap = "static-white-cubemap-texture";
	let s_blackCubemap = "static-white-cubemap-texture";

	class TextureCache {
		static SetColorTextureSize(size) { COLOR_TEXTURE_SIZE = size; }
		static GetColorTextureSize() { return COLOR_TEXTURE_SIZE; }

		static WhiteCubemap(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_whiteCubemap);

			if (!tex) {
				tex = bg.base.Texture.WhiteCubemap(context);
				cache.register(s_whiteCubemap,tex);
			}
			return tex;
		}

		static BlackCubemap(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_blackCubemap);

			if (!tex) {
				tex = bg.base.Texture.BlackCubemap(context);
				cache.register(s_blackCubemap,tex);
			}
			return tex;
		}
		
		static WhiteTexture(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_whiteTexture);
			
			if (!tex) {
				tex = bg.base.Texture.WhiteTexture(context,new bg.Vector2(COLOR_TEXTURE_SIZE));
				cache.register(s_whiteTexture,tex);
			}
			
			return tex;
		}
		
		static BlackTexture(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_blackTexture);
			
			if (!tex) {
				tex = bg.base.Texture.BlackTexture(context,new bg.Vector2(COLOR_TEXTURE_SIZE));
				cache.register(s_blackTexture,tex);
			}
			
			return tex;
		}
		
		static NormalTexture(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_normalTexture);
			
			if (!tex) {
				tex = bg.base.Texture.NormalTexture(context,new bg.Vector2(COLOR_TEXTURE_SIZE));
				cache.register(s_normalTexture,tex);
			}
			
			return tex;
		}

		static RandomTexture(context) {
			let cache = TextureCache.Get(context);
			let tex = cache.find(s_randomTexture);

			if (!tex) {
				tex = bg.base.Texture.RandomTexture(context,new bg.Vector2(64));
				cache.register(s_randomTexture,tex);
			}

			return tex;
		}
		
		static Get(context) {
			if (!s_textureCache[context.uuid]) {
				s_textureCache[context.uuid] = new TextureCache(context);
			}
			return s_textureCache[context.uuid];
		}

		static PrecomputedBRDFLookupTexture(context) {
			if (!s_textureCache["_bg_base_brdfLutData_"]) {
				s_textureCache["_bg_base_brdfLutData_"] = bg.base.Texture.PrecomputedBRDFLookupTexture(context);
			}
			return s_textureCache["_bg_base_brdfLutData_"];
		}
		
		constructor(context) {
			this._context = context;
			this._textures = {};
		}
		
		find(url) {
			return this._textures[url];
		}
		
		register(url,texture) {
			if (texture instanceof bg.base.Texture) {
				this._textures[url] = texture;
			}
		}
		
		unregister(url) {
			if (this._textures[url]) {
				delete this._textures[url];
			}
		}
		
		clear() {
			this._textures = {};
		}
	}
	
	bg.base.TextureCache = TextureCache;

	let g_wrapX = null;
	let g_wrapY = null;
	let g_minFilter = null;
	let g_magFilter = null;
	
	/* Extra data:
	 * 	wrapX
	 *  wrapY
	 *  minFilter
	 *  magFilter
	 */
	class TextureLoaderPlugin extends bg.base.LoaderPlugin {
		static GetWrapX() {
			return g_wrapX || bg.base.TextureWrap.REPEAT;
		}

		static GetWrapY() {
			return g_wrapY || bg.base.TextureWrap.REPEAT;
		}

		static GetMinFilter() {
			return g_minFilter || bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST;
		}

		static GetMagFilter() {
			return g_magFilter || bg.base.TextureFilter.LINEAR;
		}

		static SetMinFilter(f) {
			g_minFilter = f;
		}

		static SetMagFilter(f) {
			g_magFilter = f;
		}

		static SetWrapX(w) {
			g_wrapX = w;
		}

		static SetWrapY(w) {
			g_wrapY = w;
		}
		
		acceptType(url,data) {
			return bg.utils.Resource.IsImage(url);
		}
		
		load(context,url,data,extraData) {
			return new Promise((accept,reject) => {
				if (data) {
					let texture = bg.base.TextureCache.Get(context).find(url);
					if (!texture) {
						bg.log(`Texture ${url} not found. Loading texture`);
						texture = new bg.base.Texture(context);
						texture.create();
						texture.bind();
						texture.wrapX = extraData.wrapX || TextureLoaderPlugin.GetWrapX();
						texture.wrapY = extraData.wrapY || TextureLoaderPlugin.GetWrapY();
						texture.minFilter = extraData.minFilter || TextureLoaderPlugin.GetMinFilter();
						texture.magFilter = extraData.magFilter || TextureLoaderPlugin.GetMagFilter();
						texture.setImage(data);
						texture.fileName = url;
						bg.base.TextureCache.Get(context).register(url,texture);
					}
					accept(texture);
				}
				else {
					reject(new Error("Error loading texture image data"));
				}
			});
		}
	}
	
	bg.base.TextureLoaderPlugin = TextureLoaderPlugin;

	class VideoTextureLoaderPlugin extends bg.base.LoaderPlugin {
		acceptType(url,data) {
			return bg.utils.Resource.IsVideo(url);
		}

		load(context,url,video) {
			return new Promise((accept,reject) => {
				if (video) {
					let texture = new bg.base.Texture(context);
					texture.create();
					texture.bind();
					texture.setVideo(video);
					texture.fileName = url;
					accept(texture);
				}
				else {
					reject(new Error("Error loading video texture data"));
				}
			});
		}
	}

	bg.base.VideoTextureLoaderPlugin = VideoTextureLoaderPlugin;
})();