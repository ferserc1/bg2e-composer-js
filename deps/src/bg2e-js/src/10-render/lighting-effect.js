(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	class LightingEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
		}
		
		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				this._fragmentShaderSource.appendHeader("#extension GL_EXT_draw_buffers : require");

				this._fragmentShaderSource.addParameter([
					{ name:"inDiffuse", dataType:"sampler2D", role:"value"},
					{ name:"inSpecular", dataType:"sampler2D", role:"value"},
					{ name:"inNormal", dataType:"sampler2D", role:"value"},
					{ name:"inMaterial", dataType:"sampler2D", role:"value"},
					{ name:"inPosition", dataType:"sampler2D", role:"value"},
					{ name:"inShadowMap", dataType:"sampler2D", role:"value" },
					{ name:"inLightEmissionFactor", dataType:"float", role:"value" },
					{ name:"fsTexCoord", dataType:"vec2", role:"in" }
				]);
				this._fragmentShaderSource.addParameter(lib().inputs.lighting.all);
				this._fragmentShaderSource.addFunction(lib().functions.utils.all);
				this._fragmentShaderSource.addFunction(lib().functions.lighting.all);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._fragmentShaderSource.setMainBody(`
					vec4 diffuse = texture2D(inDiffuse,fsTexCoord);
					vec4 specular = vec4(texture2D(inSpecular,fsTexCoord).rgb,1.0);
					vec4 normalTex = texture2D(inNormal,fsTexCoord);
					vec3 normal = normalTex.xyz * 2.0 - 1.0;
					vec4 material = texture2D(inMaterial,fsTexCoord);
					vec4 position = texture2D(inPosition,fsTexCoord);
					
					vec4 shadowColor = texture2D(inShadowMap,fsTexCoord);
					float shininess = material.g * 255.0;
					float lightEmission = material.r;
					bool unlit = normalTex.a == 0.0;
					vec4 specularColor = vec4(0.0,0.0,0.0,1.0);
					if (unlit) {
						gl_FragData[0] = vec4(diffuse.rgb * min(inLightEmissionFactor,1.0),1.0);
					}
					else {
						vec4 light = getLight(
							inLightType,
							inLightAmbient, inLightDiffuse, inLightSpecular,shininess,
							inLightPosition,inLightDirection,
							inLightAttenuation.x,inLightAttenuation.y,inLightAttenuation.z,
							inSpotCutoff,inSpotExponent,inLightCutoffDistance,
							position.rgb,normal,
							diffuse,specular,shadowColor,
							specularColor
						);
						light.rgb = light.rgb + (lightEmission * diffuse.rgb * inLightEmissionFactor);
						gl_FragData[0] = light;
						gl_FragData[1] = specularColor;
						gl_FragData[2] = vec4((light.rgb - vec3(1.0,1.0,1.0)) * 2.0,1.0);
					}
					`);
				}
			}
			return this._fragmentShaderSource;
		}
		
		setupVars() {
			this.shader.setTexture("inDiffuse",this._surface.diffuse,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setTexture("inSpecular",this._surface.specular,bg.base.TextureUnit.TEXTURE_1);
			this.shader.setTexture("inNormal",this._surface.normal,bg.base.TextureUnit.TEXTURE_2);
			this.shader.setTexture("inMaterial",this._surface.material,bg.base.TextureUnit.TEXTURE_3);
			this.shader.setTexture("inPosition",this._surface.position,bg.base.TextureUnit.TEXTURE_4);
			this.shader.setTexture("inShadowMap",this._shadowMap,bg.base.TextureUnit.TEXTURE_5);
		
			if (this.light) {
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
				
				this.shader.setVector4('inLightAmbient',this._light.ambient);
				this.shader.setVector4('inLightDiffuse',this._light.diffuse);
				this.shader.setVector4('inLightSpecular',this._light.specular);
				this.shader.setValueInt('inLightType',this._light.type);
				this.shader.setVector3('inLightAttenuation',this._light.attenuationVector);
				this.shader.setValueFloat('inLightEmissionFactor',this.lightEmissionFactor);
				this.shader.setValueFloat('inLightCutoffDistance',this._light.cutoffDistance);

				
				let dir = viewMatrix
								.mult(this._lightTransform)
								.rotation
								.multVector(this._light.direction)
								.xyz;
				let pos = viewMatrix
								//.mult(this._lightTransform)
								.position;
				this.shader.setVector3('inLightDirection',dir);
				this.shader.setVector3('inLightPosition',pos);
				this.shader.setValueFloat('inSpotCutoff',this._light.spotCutoff);
				this.shader.setValueFloat('inSpotExponent',this._light.spotExponent);
				// TODO: Type and other light properties.
			}
		}
		
		get lightEmissionFactor() { return this._lightEmissionFactor; }
		set lightEmissionFactor(f) { this._lightEmissionFactor = f; }
		
		get light() { return this._light; }
		set light(l) { this._light = l; }
		
		get lightTransform() { return this._lightTransform; }
		set lightTransform(t) { this._lightTransform = t; }
		
		get shadowMap() { return this._shadowMap; }
		set shadowMap(sm) { this._shadowMap = sm; }
	}
	
	bg.render.LightingEffect = LightingEffect;
})();