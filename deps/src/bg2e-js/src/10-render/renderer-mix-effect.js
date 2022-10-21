
(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	class RendererMixEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
		}

		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				this._fragmentShaderSource.addParameter([
					{ name:"inOpaque", dataType:"sampler2D", role:"value" },
					{ name:"inTransparent", dataType:"sampler2D", role:"value"},
					{ name:"inTransparentNormal", dataType:"sampler2D", role:"value"},
					{ name:"inOpaqueDepth", dataType:"sampler2D", role:"value" },
					{ name:"inTransparentDepth", dataType:"sampler2D", role:"value" },
					{ name:"inRefractionAmount", dataType:"float", role:"value"},

					{ name:"fsTexCoord", dataType:"vec2", role:"in" }	// vTexturePosition
				]);
				
				if (bg.Engine.Get().id=="webgl1") {

					this._fragmentShaderSource.setMainBody(`
						vec4 opaque = texture2D(inOpaque,fsTexCoord);
						vec4 transparent = texture2D(inTransparent,fsTexCoord);
						vec3 normal = texture2D(inTransparentNormal,fsTexCoord).rgb * 2.0 - 1.0;
						if (transparent.a>0.0) {
							float refractionFactor = inRefractionAmount / texture2D(inTransparentDepth,fsTexCoord).z;
							vec2 offset = fsTexCoord - normal.xy * refractionFactor;
							vec4 opaqueDepth = texture2D(inOpaqueDepth,offset);
							vec4 transparentDepth = texture2D(inTransparentDepth,offset);
							//if (opaqueDepth.w>transparentDepth.w) {
								opaque = texture2D(inOpaque,offset);
							//}
						}
						vec3 color = opaque.rgb * (1.0 - transparent.a) + transparent.rgb * transparent.a;
						gl_FragColor = vec4(color, 1.0);
						`);
				}
			}
			return this._fragmentShaderSource;
		}

		setupVars() {
			this.shader.setTexture("inOpaque",this._surface.opaque,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setTexture("inTransparent",this._surface.transparent,bg.base.TextureUnit.TEXTURE_1);
			this.shader.setTexture("inTransparentNormal",this._surface.transparentNormal,bg.base.TextureUnit.TEXTURE_2);
			this.shader.setTexture("inOpaqueDepth",this._surface.opaqueDepth,bg.base.TextureUnit.TEXTURE_3);
			this.shader.setTexture("inTransparentDepth",this._surface.transparentDepth,bg.base.TextureUnit.TEXTURE_4);
			this.shader.setValueFloat("inRefractionAmount",this.settings.refractionAmount);
		}

		get settings() {
			if (!this._settings) {
				this._currentKernelSize = 0;
				this._settings = {
					refractionAmount: -0.05
				}
			}
			return this._settings;
		}

	}

	bg.render.RendererMixEffect = RendererMixEffect;	
})();