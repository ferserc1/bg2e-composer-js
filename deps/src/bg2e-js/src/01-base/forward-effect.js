(function() {
	let shaders = {};
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}
	
	let s_vertexSource = null;
	let s_fragmentSource = null;
	
	function vertexShaderSource() {
		if (!s_vertexSource) {
			s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
			
			s_vertexSource.addParameter([
				lib().inputs.buffers.vertex,
				lib().inputs.buffers.normal,
				lib().inputs.buffers.tangent,
				lib().inputs.buffers.tex0,
				lib().inputs.buffers.tex1
			]);
			
			s_vertexSource.addParameter(lib().inputs.matrix.all);
			
			s_vertexSource.addParameter([
				{ name:"inLightProjectionMatrix", dataType:"mat4", role:"value" },
				{ name:"inLightViewMatrix", dataType:"mat4", role:"value" },
			]);
			
			s_vertexSource.addParameter([
				{ name:"fsPosition", dataType:"vec3", role:"out" },
				{ name:"fsTex0Coord", dataType:"vec2", role:"out" },
				{ name:"fsTex1Coord", dataType:"vec2", role:"out" },
				{ name:"fsNormal", dataType:"vec3", role:"out" },
				{ name:"fsTangent", dataType:"vec3", role:"out" },
				{ name:"fsBitangent", dataType:"vec3", role:"out" },
				{ name:"fsSurfaceToView", dataType:"vec3", role:"out" },
				
				{ name:"fsVertexPosFromLight", dataType:"vec4", role:"out" }
			]);
			
			if (bg.Engine.Get().id=="webgl1") {
				s_vertexSource.setMainBody(`
					mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0,
											0.0, 0.5, 0.0, 0.0,
											0.0, 0.0, 0.5, 0.0,
											0.5, 0.5, 0.5, 1.0);
					
					vec4 viewPos = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
					gl_Position = inProjectionMatrix * viewPos;
					
					fsNormal = normalize((inNormalMatrix * vec4(inNormal,1.0)).xyz);
					fsTangent = normalize((inNormalMatrix * vec4(inTangent,1.0)).xyz);
					fsBitangent = cross(fsNormal,fsTangent);
					
					fsVertexPosFromLight = ScaleMatrix * inLightProjectionMatrix * inLightViewMatrix * inModelMatrix * vec4(inVertex,1.0);
					
					fsTex0Coord = inTex0;
					fsTex1Coord = inTex1;
					fsPosition = viewPos.xyz;`);
			}
		}
		return s_vertexSource;
	}
	
	function fragmentShaderSource() {
		if (!s_fragmentSource) {
			s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);

			s_fragmentSource.addParameter(lib().inputs.material.all);
			s_fragmentSource.addParameter(lib().inputs.lightingForward.all);
			s_fragmentSource.addParameter(lib().inputs.shadows.all);
			s_fragmentSource.addParameter(lib().inputs.colorCorrection.all);
			s_fragmentSource.addParameter([
				{ name:"fsPosition", dataType:"vec3", role:"in" },
				{ name:"fsTex0Coord", dataType:"vec2", role:"in" },
				{ name:"fsTex1Coord", dataType:"vec2", role:"in" },
				{ name:"fsNormal", dataType:"vec3", role:"in" },
				{ name:"fsTangent", dataType:"vec3", role:"in" },
				{ name:"fsBitangent", dataType:"vec3", role:"in" },
				{ name:"fsSurfaceToView", dataType:"vec3", role:"in" },
				
				{ name:"fsVertexPosFromLight", dataType:"vec4", role:"in" },

				{ name:"inCubeMap", dataType:"samplerCube", role:"value" },
				{ name:"inLightEmissionFactor", dataType:"float", role:"value" }
			]);
			
			s_fragmentSource.addFunction(lib().functions.materials.all);
			s_fragmentSource.addFunction(lib().functions.colorCorrection.all);
			s_fragmentSource.addFunction(lib().functions.utils.unpack);
			s_fragmentSource.addFunction(lib().functions.utils.random);
			s_fragmentSource.addFunction(lib().functions.lighting.all);
			s_fragmentSource.addFunction(lib().functions.blur.blurCube);
			
			if (bg.Engine.Get().id=="webgl1") {	
				s_fragmentSource.setMainBody(`
					vec4 diffuseColor = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale);
					vec4 lightmapColor = samplerColor(inLightMap,fsTex1Coord,inLightMapOffset,inLightMapScale);

					if (inUnlit && diffuseColor.a>=inAlphaCutoff) {
						gl_FragColor = diffuseColor * lightmapColor;
					}
					else if (diffuseColor.a>=inAlphaCutoff) {
						vec3 normalMap = samplerNormal(inNormalMap,fsTex0Coord,inNormalMapOffset,inNormalMapScale);
						// This doesn't work on many Mac Intel GPUs
						// vec3 frontFacingNormal = fsNormal;
						// if (!gl_FrontFacing) {
						// 	frontFacingNormal *= -1.0;
						// }
						normalMap = combineNormalWithMap(fsNormal,fsTangent,fsBitangent,normalMap);
						vec4 shadowColor = vec4(1.0);
						if (inReceiveShadows) {
							shadowColor = getShadowColor(fsVertexPosFromLight,inShadowMap,inShadowMapSize,inShadowType,inShadowStrength,inShadowBias,inShadowColor);
						}

						vec4 specular = specularColor(inSpecularColor,inShininessMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inShininessMaskChannel,inShininessMaskInvert);
						float lightEmission = applyTextureMask(inLightEmission,
															inLightEmissionMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inLightEmissionMaskChannel,inLightEmissionMaskInvert);
						diffuseColor = diffuseColor * inDiffuseColor * lightmapColor;
						
						vec4 light = vec4(0.0,0.0,0.0,1.0);
						vec4 specularColor = vec4(0.0,0.0,0.0,1.0);
						// This doesn't work on A11 and A12 chips on Apple devices.
						// for (int i=0; i<${ bg.base.MAX_FORWARD_LIGHTS}; ++i) {
						// 	if (i>=inNumLights) break;
						// 	light.rgb += getLight(
						// 		inLightType[i],
						// 		inLightAmbient[i], inLightDiffuse[i], inLightSpecular[i],inShininess,
						// 		inLightPosition[i],inLightDirection[i],
						// 		inLightAttenuation[i].x,inLightAttenuation[i].y,inLightAttenuation[i].z,
						// 		inSpotCutoff[i],inSpotExponent[i],inLightCutoffDistance[i],
						// 		fsPosition,normalMap,
						// 		diffuseColor,specular,shadowColor,
						// 		specularColor
						// 	).rgb;
						// 	light.rgb += specularColor.rgb;
						// }

						// Workaround for A11 and A12 chips
						if (inNumLights>0) {
							light.rgb += getLight(
								inLightType[0],
								inLightAmbient[0], inLightDiffuse[0], inLightSpecular[0],inShininess,
								inLightPosition[0],inLightDirection[0],
								inLightAttenuation[0].x,inLightAttenuation[0].y,inLightAttenuation[0].z,
								inSpotCutoff[0],inSpotExponent[0],inLightCutoffDistance[0],
								fsPosition,normalMap,
								diffuseColor,specular,shadowColor,
								specularColor
							).rgb;
							light.rgb += specularColor.rgb;
						}
						if (inNumLights>1) {
							light.rgb += getLight(
								inLightType[1],
								inLightAmbient[1], inLightDiffuse[1], inLightSpecular[1],inShininess,
								inLightPosition[1],inLightDirection[1],
								inLightAttenuation[1].x,inLightAttenuation[1].y,inLightAttenuation[1].z,
								inSpotCutoff[0],inSpotExponent[1],inLightCutoffDistance[1],
								fsPosition,normalMap,
								diffuseColor,specular,shadowColor,
								specularColor
							).rgb;
							light.rgb += specularColor.rgb;
						}

						vec3 cameraPos = vec3(0.0);
						vec3 cameraVector = fsPosition - cameraPos;
						vec3 lookup = reflect(cameraVector,normalMap);

						// Roughness using gaussian blur has been deactivated because it is very inefficient
						//float dist = distance(fsPosition,cameraPos);
						//float maxRough = 50.0;
						//float rough = max(inRoughness * 10.0,1.0);
						//rough = max(rough*dist,rough);
						//float blur = min(rough,maxRough);
						//vec3 cubemapColor = blurCube(inCubeMap,lookup,int(blur),vec2(10),dist).rgb;

						vec3 cubemapColor = textureCube(inCubeMap,lookup).rgb;

						float reflectionAmount = applyTextureMask(inReflection,
														inReflectionMask,fsTex0Coord,inTextureOffset,inTextureScale,
														inReflectionMaskChannel,inReflectionMaskInvert);

						light.rgb = clamp(light.rgb + (lightEmission * diffuseColor.rgb * 10.0), vec3(0.0), vec3(1.0));
						

						gl_FragColor = vec4(light.rgb * (1.0 - reflectionAmount) + cubemapColor * reflectionAmount * diffuseColor.rgb, diffuseColor.a);
					}
					else {
						discard;
					}`
				);
			}
		}
		return s_fragmentSource;
	}
	
	class ColorCorrectionSettings {
		constructor() {
			this._hue = 1;
			this._saturation = 1;
			this._lightness = 1;
			this._brightness = 0.5;
			this._contrast = 0.5;
		}

		set hue(h) { this._hue = h; }
		get hue() { return this._hue; }
		set saturation(s) { this._saturation = s; }
		get saturation() { return this._saturation; }
		set lightness(l) { this._lightness = l; }
		get lightness() { return this._lightness; }
		set brightness(b) { this._brightness = b; }
		get brightness() { return this._brightness; }
		set contrast(c) { this._contrast = c; }
		get contrast() { return this._contrast; }

		apply(shader,varNames={ hue:'inHue',
								saturation:'inSaturation',
								lightness:'inLightness',
								brightness:'inBrightness',
								contrast:'inContrast' })
		{
			shader.setValueFloat(varNames['hue'], this._hue);
			shader.setValueFloat(varNames['saturation'], this._saturation);
			shader.setValueFloat(varNames['lightness'], this._lightness);
			shader.setValueFloat(varNames['brightness'], this._brightness);
			shader.setValueFloat(varNames['contrast'], this._contrast);
		}
	}

	bg.base.ColorCorrectionSettings = ColorCorrectionSettings;

	class ForwardEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);
			this._material = null;
			this._light = null;
			this._lightTransform = bg.Matrix4.Identity();

			this._lightArray = new bg.base.LightArray();

			this._shadowMap = null;
			
			let sources = [
				vertexShaderSource(),
				fragmentShaderSource()
			];
			this.setupShaderSource(sources);
			this._colorCorrection = new bg.base.ColorCorrectionSettings();
		}
		
		get material() { return this._material; }
		set material(m) { this._material = m; }
				
		// Individual light mode
		get light() { return this._light; }
		set light(l) { this._light = l; this._lightArray.reset(); }
		get lightTransform() { return this._lightTransform; }
		set lightTransform(trx) { this._lightTransform = trx; this._lightArray.reset();}

		// Multiple light mode: use light arrays
		get lightArray() { return this._lightArray; }
		
		set shadowMap(sm) { this._shadowMap = sm; }
		get shadowMap() { return this._shadowMap; }

		get colorCorrection() { return this._colorCorrection; }
		set colorCorrection(cc) { this._colorCorrection = cc; }
		
		beginDraw() {
			if (this._light) {
				// Individual mode: initialize light array
				this.lightArray.reset();
				this.lightArray.push(this.light,this.lightTransform);
			}

			if (this.lightArray.numLights) {
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);

				// Update lights positions and directions using the current view matrix
				this.lightArray.updatePositionAndDirection(viewMatrix);
				
				// Forward render only supports one shadow map
				let lightTransform = this.shadowMap ? this.shadowMap.viewMatrix : this.lightArray.shadowLightTransform;
				this.shader.setMatrix4("inLightProjectionMatrix", this.shadowMap ? this.shadowMap.projection : this.lightArray.shadowLight.projection);
				let shadowColor = this.shadowMap ? this.shadowMap.shadowColor : bg.Color.Transparent();
				
				let blackTex = bg.base.TextureCache.BlackTexture(this.context);
				this.shader.setMatrix4("inLightViewMatrix",lightTransform);
				this.shader.setValueInt("inShadowType",this._shadowMap ? this._shadowMap.shadowType : 0);
				this.shader.setTexture("inShadowMap",this._shadowMap ? this._shadowMap.texture : blackTex,bg.base.TextureUnit.TEXTURE_5);
				this.shader.setVector2("inShadowMapSize",this._shadowMap ? this._shadowMap.size : new bg.Vector2(32,32));
				this.shader.setValueFloat("inShadowStrength",this.lightArray.shadowLight.shadowStrength);
				this.shader.setVector4("inShadowColor",shadowColor);
				this.shader.setValueFloat("inShadowBias",this.lightArray.shadowLight.shadowBias);
				this.shader.setValueInt("inCastShadows",this.lightArray.shadowLight.castShadows);
			
				this.shader.setVector4Ptr('inLightAmbient',this.lightArray.ambient);
				this.shader.setVector4Ptr('inLightDiffuse',this.lightArray.diffuse);
				this.shader.setVector4Ptr('inLightSpecular',this.lightArray.specular);
				this.shader.setValueIntPtr('inLightType',this.lightArray.type);
				this.shader.setVector3Ptr('inLightAttenuation',this.lightArray.attenuation);
				this.shader.setValueFloatPtr('inLightCutoffDistance',this.lightArray.cutoffDistance);

				// TODO: promote this value to a variable
				let lightEmissionFactor = 10;
				this.shader.setValueFloat('inLightEmissionFactor',lightEmissionFactor);

				this.shader.setTexture('inCubeMap',bg.scene.Cubemap.Current(this.context),bg.base.TextureUnit.TEXTURE_6);
				
				this.shader.setVector3Ptr('inLightDirection',this.lightArray.direction);
				this.shader.setVector3Ptr('inLightPosition',this.lightArray.position);
				this.shader.setValueFloatPtr('inSpotCutoff',this.lightArray.spotCutoff);
				this.shader.setValueFloatPtr('inSpotExponent',this.lightArray.spotExponent);

				this.shader.setValueInt('inNumLights',this.lightArray.numLights);
			}
			else {
				let BLACK = bg.Color.Black();
				this.shader.setVector4Ptr('inLightAmbient',BLACK.toArray());
				this.shader.setVector4Ptr('inLightDiffuse',BLACK.toArray());
				this.shader.setVector4Ptr('inLightSpecular',BLACK.toArray());
				this.shader.setVector3Ptr('inLightDirection',(new bg.Vector3(0,0,0)).toArray());
				this.shader.setValueInt('inNumLights',0);
			}
			
			this.colorCorrection.apply(this.shader);
		}
		
		setupVars() {
			if (this.material) {
				// Matrix state
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
				this.shader.setMatrix4('inModelMatrix',matrixState.modelMatrixStack.matrixConst);
				this.shader.setMatrix4('inViewMatrix',viewMatrix);
				this.shader.setMatrix4('inProjectionMatrix',matrixState.projectionMatrixStack.matrixConst);
				this.shader.setMatrix4('inNormalMatrix',matrixState.normalMatrix);
				this.shader.setMatrix4('inViewMatrixInv',matrixState.viewMatrixInvert);
				
				// Material				
				//	Prepare textures
				let whiteTex = bg.base.TextureCache.WhiteTexture(this.context);
				let blackTex = bg.base.TextureCache.BlackTexture(this.context);
				let normalTex = bg.base.TextureCache.NormalTexture(this.context);
				let texture = this.material.texture || whiteTex;
				let lightMap = this.material.lightmap || whiteTex;
				let normalMap = this.material.normalMap || normalTex;
				let shininessMask = this.material.shininessMask || whiteTex;
				let lightEmissionMask = this.material.lightEmissionMask || whiteTex;

				this.shader.setVector4('inDiffuseColor',this.material.diffuse);
				this.shader.setVector4('inSpecularColor',this.material.specular);
				this.shader.setValueFloat('inShininess',this.material.shininess);
				this.shader.setTexture('inShininessMask',shininessMask,bg.base.TextureUnit.TEXTURE_3);
				this.shader.setVector4('inShininessMaskChannel',this.material.shininessMaskChannelVector);
				this.shader.setValueInt('inShininessMaskInvert',this.material.shininessMaskInvert);
				this.shader.setValueFloat('inLightEmission',this.material.lightEmission);
				this.shader.setTexture('inLightEmissionMask',lightEmissionMask,bg.base.TextureUnit.TEXTURE_4);
				this.shader.setVector4('inLightEmissionMaskChannel',this.material.lightEmissionMaskChannelVector);
				this.shader.setValueInt('inLightEmissionMaskInvert',this.material.lightEmissionMaskInvert);
				this.shader.setValueFloat('inAlphaCutoff',this.material.alphaCutoff);
				
				this.shader.setTexture('inTexture',texture,bg.base.TextureUnit.TEXTURE_0);
				this.shader.setVector2('inTextureOffset',this.material.textureOffset);
				this.shader.setVector2('inTextureScale',this.material.textureScale);
				
				this.shader.setTexture('inLightMap',lightMap,bg.base.TextureUnit.TEXTURE_1);
				this.shader.setVector2('inLightMapOffset',this.material.lightmapOffset);
				this.shader.setVector2('inLightMapScale',this.material.lightmapScale);
				
				this.shader.setTexture('inNormalMap',normalMap,bg.base.TextureUnit.TEXTURE_2);
				this.shader.setVector2('inNormalMapScale',this.material.normalMapScale);
				this.shader.setVector2('inNormalMapOffset',this.material.normalMapOffset);
				
				this.shader.setValueInt('inReceiveShadows',this.material.receiveShadows);

				let reflectionMask = this.material.reflectionMask || whiteTex;
				this.shader.setValueFloat('inReflection',this.material.reflectionAmount);
				this.shader.setTexture('inReflectionMask',reflectionMask,bg.base.TextureUnit.TEXTURE_7);
				this.shader.setVector4('inReflectionMaskChannel',this.material.reflectionMaskChannelVector);
				this.shader.setValueInt('inReflectionMaskInvert',this.material.reflectionMaskInvert);

				let roughnessMask = this.material.roughnessMask || whiteTex;
				this.shader.setValueFloat('inRoughness',this.material.roughness);
				if (this.context.getParameter(this.context.MAX_TEXTURE_IMAGE_UNITS)<9) {
					this.shader.setTexture('inRoughnessMask',roughnessMask,bg.base.TextureUnit.TEXTURE_7);
				}
				else {
					this.shader.setTexture('inRoughnessMask',roughnessMask,bg.base.TextureUnit.TEXTURE_8);
				}
				this.shader.setVector4('inRoughnessMaskChannel',this.material.roughnessMaskChannelVector);
				this.shader.setValueInt('inRoughnessMaskInvert',this.material.roughnessMaskInvert);

				// Other settings
				this.shader.setValueInt('inSelectMode',false);

				this.shader.setValueInt('inUnlit',this.material.unlit);
			}
		}
		
	}
	
	bg.base.ForwardEffect = ForwardEffect;

	// Define the maximum number of lights that can be used in forward render
	bg.base.MAX_FORWARD_LIGHTS = 4;
	
})();
