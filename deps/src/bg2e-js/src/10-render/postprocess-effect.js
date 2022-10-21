
(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	class PostprocessEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
		}

		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				this._fragmentShaderSource.addParameter([
					{ name:"inTexture", dataType:"sampler2D", role:"value" },
					{ name:"inFrameSize", dataType:"vec2", role:"value"},
					{ name:"inBorderAntiAlias", dataType:"int", role:"value"},

					{ name:"fsTexCoord", dataType:"vec2", role:"in" }	// vTexturePosition
				]);
				
				if (bg.Engine.Get().id=="webgl1") {

					this._fragmentShaderSource.addFunction(lib().functions.utils.texOffset);
					this._fragmentShaderSource.addFunction(lib().functions.utils.luminance);
					this._fragmentShaderSource.addFunction(lib().functions.utils.borderDetection);
					this._fragmentShaderSource.addFunction(lib().functions.blur.textureDownsample);
					this._fragmentShaderSource.addFunction(lib().functions.blur.gaussianBlur);
					this._fragmentShaderSource.addFunction(lib().functions.blur.antiAlias);

					
					this._fragmentShaderSource.setMainBody(`
						vec4 result = vec4(0.0,0.0,0.0,1.0);
						if (inBorderAntiAlias==1) {
							result = antiAlias(inTexture,fsTexCoord,inFrameSize,0.1,3);
						}
						else {
							result = texture2D(inTexture,fsTexCoord);
						}
						gl_FragColor = result;
						`);
				}
			}
			return this._fragmentShaderSource;
		}

		setupVars() {
			this.shader.setTexture("inTexture",this._surface.texture,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setVector2("inFrameSize",this._surface.texture.size);
			this.shader.setValueInt("inBorderAntiAlias",0);
		}

		get settings() {
			if (!this._settings) {
				this._currentKernelSize = 0;
				this._settings = {
					refractionAmount: 0.01
				}
			}
			return this._settings;
		}

	}

	bg.render.PostprocessEffect = PostprocessEffect;	
})();