(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	let MAX_KERN_OFFSETS = 64;

	class DeferredMixEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);

			this._ssrtScale = 0.5;
			this._frameScale = 1.0;
		}
		
		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				this._fragmentShaderSource.addParameter([
					{ name:"inLighting", dataType:"sampler2D", role:"value"},
					{ name:"inDiffuse", dataType:"sampler2D", role:"value"},
					{ name:"inPositionMap", dataType:"sampler2D", role:"value"},
					{ name:"inSSAO", dataType:"sampler2D", role:"value"},
					{ name:"inReflection", dataType:"sampler2D", role:"value"},
					{ name:"inSpecularMap", dataType:"sampler2D", role:"value" },
					{ name:"inMaterial", dataType:"sampler2D", role:"value"},
					{ name:"inOpaqueDepthMap", dataType:"sampler2D", role:"value"},
					{ name:"inShininessColor", dataType:"sampler2D", role:"value" }, 
					{ name:"inViewSize", dataType:"vec2", role:"value"},
					{ name:"inSSAOBlur", dataType:"int", role:"value"},
					{ name:"inSSRTScale", dataType:"float", role:"value" },

					{ name:"fsTexCoord", dataType:"vec2", role:"in" }	// vTexturePosition
				]);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._fragmentShaderSource.addFunction(lib().functions.blur.textureDownsample);
					this._fragmentShaderSource.addFunction(lib().functions.blur.blur);
					this._fragmentShaderSource.addFunction(lib().functions.blur.glowBlur);

					//this._fragmentShaderSource.addFunction(lib().functions.colorCorrection.all);

					this._fragmentShaderSource.setMainBody(`
					vec4 lighting = clamp(texture2D(inLighting,fsTexCoord),vec4(0.0),vec4(1.0));
					vec4 diffuse = texture2D(inDiffuse,fsTexCoord);
					vec4 pos = texture2D(inPositionMap,fsTexCoord);
					vec4 shin = texture2D(inShininessColor,fsTexCoord);
					vec4 ssao = blur(inSSAO,fsTexCoord,inSSAOBlur * 20,inViewSize);
					vec4 material = texture2D(inMaterial,fsTexCoord);

					vec4 specular = texture2D(inSpecularMap,fsTexCoord);	// The roughness parameter is stored on A component, inside specular map
					
					vec4 opaqueDepth = texture2D(inOpaqueDepthMap,fsTexCoord);
					if (pos.z<opaqueDepth.z && opaqueDepth.w<1.0) {
						discard;
					}
					else {
						float roughness = specular.a;
						float ssrtScale = inSSRTScale;
						roughness *= 250.0 * ssrtScale;
						vec4 reflect = blur(inReflection,fsTexCoord,int(roughness),inViewSize * ssrtScale);

						float reflectionAmount = material.b;
						vec3 finalColor = lighting.rgb * (1.0 - reflectionAmount);
						finalColor += reflect.rgb * reflectionAmount * diffuse.rgb + shin.rgb;
						finalColor *= ssao.rgb;
						gl_FragColor = vec4(finalColor,diffuse.a);
					}`);
				}
			}
			return this._fragmentShaderSource;
		}
		
		setupVars() {
			this.shader.setVector2("inViewSize",new bg.Vector2(this.viewport.width, this.viewport.height));

			this.shader.setTexture("inLighting",this._surface.lightingMap,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setTexture("inDiffuse",this._surface.diffuseMap,bg.base.TextureUnit.TEXTURE_1);
			this.shader.setTexture("inPositionMap",this._surface.positionMap,bg.base.TextureUnit.TEXTURE_2);
			this.shader.setTexture("inSSAO",this._surface.ssaoMap,bg.base.TextureUnit.TEXTURE_3);
			this.shader.setTexture("inReflection",this._surface.reflectionMap,bg.base.TextureUnit.TEXTURE_4);
			this.shader.setTexture("inMaterial",this._surface.materialMap,bg.base.TextureUnit.TEXTURE_5);
			this.shader.setTexture("inSpecularMap",this._surface.specularMap,bg.base.TextureUnit.TEXTURE_6);
			this.shader.setTexture("inOpaqueDepthMap",this._surface.opaqueDepthMap,bg.base.TextureUnit.TEXTURE_7);
			this.shader.setTexture("inShininessColor",this._surface.shininess,bg.base.TextureUnit.TEXTURE_8);
	
			this.shader.setValueInt("inSSAOBlur",this.ssaoBlur);
			this.shader.setValueFloat("inSSRTScale",this.ssrtScale * this.frameScale);
		}

		set viewport(vp) { this._viewport = vp; }
		get viewport() { return this._viewport; }

		set clearColor(c) { this._clearColor = c; }
		get clearColor() { return this._clearColor; }
		
		set ssaoBlur(b) { this._ssaoBlur = b; }
		get ssaoBlur() { return this._ssaoBlur; }

		set ssrtScale(s) { this._ssrtScale = s; }
		get ssrtScale() { return this._ssrtScale; }

		set frameScale(s) { this._frameScale = s; }
		get frameScale() { return this._frameScale; }

		get colorCorrection() {
			if (!this._colorCorrection) {
				this._colorCorrection = {
					hue: 1.0,
					saturation: 1.0,
					lightness: 1.0,
					brightness: 0.5,
					contrast: 0.5
				};
			}
			return this._colorCorrection;
		}
	}
	
	bg.render.DeferredMixEffect = DeferredMixEffect;
})();