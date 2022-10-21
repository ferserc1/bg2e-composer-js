(function() {

	let s_ubyteGbufferVertex = null;
	let s_ubyteGbufferFragment = null;
	let s_floatGbufferVertex = null;
	let s_floatGbufferFragment = null;
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	let deferredShaders = {
		gbuffer_ubyte_vertex() {
			if (!s_ubyteGbufferVertex) {
				s_ubyteGbufferVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
				
				s_ubyteGbufferVertex.addParameter([
					lib().inputs.buffers.vertex,
					lib().inputs.buffers.normal,
					lib().inputs.buffers.tangent,
					lib().inputs.buffers.tex0,
					lib().inputs.buffers.tex1
				]);
				
				s_ubyteGbufferVertex.addParameter(lib().inputs.matrix.all);
				
				s_ubyteGbufferVertex.addParameter([
					{ name:"fsPosition", dataType:"vec3", role:"out" },
					{ name:"fsTex0Coord", dataType:"vec2", role:"out" },
					{ name:"fsTex1Coord", dataType:"vec2", role:"out" },
					{ name:"fsNormal", dataType:"vec3", role:"out" },
					{ name:"fsTangent", dataType:"vec3", role:"out" },
					{ name:"fsBitangent", dataType:"vec3", role:"out" }
				]);
				
				if (bg.Engine.Get().id=="webgl1") {
					s_ubyteGbufferVertex.setMainBody(`
					vec4 viewPos = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
					gl_Position = inProjectionMatrix * viewPos;
					
					fsNormal = normalize((inNormalMatrix  * vec4(inNormal,1.0)).xyz);
					fsTangent = normalize((inNormalMatrix * vec4(inTangent,1.0)).xyz);
					fsBitangent = cross(fsNormal,fsTangent);
					
					fsTex0Coord = inTex0;
					fsTex1Coord = inTex1;
					fsPosition = viewPos.xyz;`);
				}
			}
			return s_ubyteGbufferVertex;
		},
		
		gbuffer_ubyte_fragment() {
			if (!s_ubyteGbufferFragment) {
				s_ubyteGbufferFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				s_ubyteGbufferFragment.appendHeader("#extension GL_EXT_draw_buffers : require");
				
				s_ubyteGbufferFragment.addParameter([
					{ name:"fsPosition", dataType:"vec3", role:"in" },
					{ name:"fsTex0Coord", dataType:"vec2", role:"in" },
					{ name:"fsTex1Coord", dataType:"vec2", role:"in" },
					{ name:"fsNormal", dataType:"vec3", role:"in" },
					{ name:"fsTangent", dataType:"vec3", role:"in" },
					{ name:"fsBitangent", dataType:"vec3", role:"int" }
				]);
				
				s_ubyteGbufferFragment.addParameter(lib().inputs.material.all);
				
				s_ubyteGbufferFragment.addFunction(lib().functions.materials.all);
				
				if (bg.Engine.Get().id=="webgl1") {
					s_ubyteGbufferFragment.setMainBody(`
						vec4 lightMap = samplerColor(inLightMap,fsTex1Coord,inLightMapOffset,inLightMapScale);
						vec4 diffuse = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale) * inDiffuseColor * lightMap;
						if (diffuse.a>=inAlphaCutoff) {
							vec3 normal = samplerNormal(inNormalMap,fsTex0Coord,inNormalMapOffset,inNormalMapScale);
							normal = combineNormalWithMap(fsNormal,fsTangent,fsBitangent,normal);
							vec4 specular = specularColor(inSpecularColor,inShininessMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inShininessMaskChannel,inShininessMaskInvert);
							float lightEmission = applyTextureMask(inLightEmission,
															inLightEmissionMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inLightEmissionMaskChannel,inLightEmissionMaskInvert);
							
							float reflectionMask = applyTextureMask(inReflection,
															inReflectionMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inReflectionMaskChannel,inReflectionMaskInvert);
							
							float roughnessMask = applyTextureMask(inRoughness,
															inRoughnessMask,fsTex0Coord,inTextureOffset,inTextureScale,
															inRoughnessMaskChannel,inRoughnessMaskInvert);

							gl_FragData[0] = diffuse;
							gl_FragData[1] = vec4(specular.rgb,roughnessMask); // Store roughness on A component of specular
							if (!gl_FrontFacing) {	// Flip the normal if back face
								normal *= -1.0;
							}
							gl_FragData[2] = vec4(normal * 0.5 + 0.5, inUnlit ? 0.0 : 1.0);	// Store !unlit parameter on A component of normal
							gl_FragData[3] = vec4(lightEmission,inShininess/255.0,reflectionMask,float(inCastShadows));
						}
						else {
							gl_FragData[0] = vec4(0.0);
							gl_FragData[1] = vec4(0.0);
							gl_FragData[2] = vec4(0.0);
							gl_FragData[3] = vec4(0.0);
							discard;
						}`);
				}
			}
			return s_ubyteGbufferFragment;
		},
		
		gbuffer_float_vertex() {
			if (!s_floatGbufferVertex) {
				s_floatGbufferVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
				
				s_floatGbufferVertex.addParameter([
					lib().inputs.buffers.vertex,
					lib().inputs.buffers.tex0,
					null,
					lib().inputs.matrix.model,
					lib().inputs.matrix.view,
					lib().inputs.matrix.projection,
					null,
					{ name:"fsPosition", dataType:"vec4", role:"out" },
					{ name:"fsTex0Coord", dataType:"vec2", role:"out" }
				]);
				
				if (bg.Engine.Get().id=="webgl1") {
					s_floatGbufferVertex.setMainBody(`
					fsPosition = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
					fsTex0Coord = inTex0;
					
					gl_Position = inProjectionMatrix * fsPosition;`);
				}
			}
			return s_floatGbufferVertex;
		},
		
		gbuffer_float_fragment() {
			if (!s_floatGbufferFragment) {
				s_floatGbufferFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				s_floatGbufferFragment.addParameter([
					lib().inputs.material.texture,
					lib().inputs.material.textureScale,
					lib().inputs.material.textureOffset,
					lib().inputs.material.alphaCutoff,
					null,
					{ name:"fsPosition", dataType:"vec4", role:"in" },
					{ name:"fsTex0Coord", dataType:"vec2", role:"in" }
				]);
				
				s_floatGbufferFragment.addFunction(lib().functions.materials.samplerColor);
				
				if (bg.Engine.Get().id=="webgl1") {
					s_floatGbufferFragment.setMainBody(`
					float alpha = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale).a;
					if (alpha<inAlphaCutoff) {
						discard;
					}
					else {
						gl_FragColor = vec4(fsPosition.xyz,gl_FragCoord.z);
					}
					`)
				}
			}
			return s_floatGbufferFragment;
		}
	}
	
	
	class GBufferEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);
			
			let ubyte_shaders = [
				deferredShaders.gbuffer_ubyte_vertex(),
				deferredShaders.gbuffer_ubyte_fragment()
			];
			
			this._material = null;
			this.setupShaderSource(ubyte_shaders);
		}
		
		get material() { return this._material; }
		set material(m) { this._material = m; }
		
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
				let texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);//s_whiteTexture;
				let lightMap = this.material.lightmap || bg.base.TextureCache.WhiteTexture(this.context);//s_whiteTexture;
				let normalMap = this.material.normalMap || bg.base.TextureCache.NormalTexture(this.context);//s_normalTexture;
				this.shader.setVector4('inDiffuseColor',this.material.diffuse);
				this.shader.setVector4('inSpecularColor',this.material.specular);
				this.shader.setValueFloat('inShininess',this.material.shininess);
				this.shader.setValueFloat('inLightEmission',this.material.lightEmission);
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
				
				let shininessMask = this.material.shininessMask || bg.base.TextureCache.WhiteTexture(this.context);
				let lightEmissionMask = this.material.lightEmissionMask || bg.base.TextureCache.WhiteTexture(this.context);
				let reflectionMask = this.material.reflectionMask || bg.base.TextureCache.WhiteTexture(this.context);
				let roughnessMask = this.material.roughnessMask || bg.base.TextureCache.WhiteTexture(this.context);
				this.shader.setTexture('inShininessMask',shininessMask,bg.base.TextureUnit.TEXTURE_3);
				this.shader.setVector4('inShininessMaskChannel',this.material.shininessMaskChannelVector);
				this.shader.setValueInt('inShininessMaskInvert',this.material.shininessMaskInvert);

				this.shader.setTexture('inLightEmissionMask',lightEmissionMask,bg.base.TextureUnit.TEXTURE_4);
				this.shader.setVector4('inLightEmissionMaskChannel',this.material.lightEmissionMaskChannelVector);
				this.shader.setValueInt('inLightEmissionMaskInvert',this.material.lightEmissionMaskInvert);
				
				this.shader.setValueFloat('inReflection',this.material.reflectionAmount);
				this.shader.setTexture('inReflectionMask',reflectionMask,bg.base.TextureUnit.TEXTURE_5);
				this.shader.setVector4('inReflectionMaskChannel',this.material.reflectionMaskChannelVector);
				this.shader.setValueInt('inReflectionMaskInvert',this.material.reflectionMaskInvert);

				this.shader.setValueFloat('inRoughness',this.material.roughness);
				this.shader.setTexture('inRoughnessMask',roughnessMask,bg.base.TextureUnit.TEXTURE_6);
				this.shader.setVector4('inRoughnessMaskChannel',this.material.roughnessMaskChannelVector);
				this.shader.setValueInt('inRoughnessMaskInvert',this.material.roughnessMaskInvert);
				
				this.shader.setValueInt('inCastShadows',this.material.castShadows);

				this.shader.setValueInt('inUnlit',this.material.unlit);
				// Other settings
				//this.shader.setValueInt('inSelectMode',false);
			}
		}
	}
	
	class PositionGBufferEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);
			let ubyte_shaders = [
				deferredShaders.gbuffer_float_vertex(),
				deferredShaders.gbuffer_float_fragment()
			];
			
			this._material = null;
			this.setupShaderSource(ubyte_shaders);
		}
		
		get material() { return this._material; }
		set material(m) { this._material = m; }

		setupVars() {
			if (this.material) {
				// Matrix state
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
				this.shader.setMatrix4('inModelMatrix',matrixState.modelMatrixStack.matrixConst);
				this.shader.setMatrix4('inViewMatrix',viewMatrix);
				this.shader.setMatrix4('inProjectionMatrix',matrixState.projectionMatrixStack.matrixConst);
				
				// Material
				let texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);//s_whiteTexture;
				this.shader.setTexture('inTexture',texture,bg.base.TextureUnit.TEXTURE_0);
				this.shader.setVector2('inTextureOffset',this.material.textureOffset);
				this.shader.setVector2('inTextureScale',this.material.textureScale);
				this.shader.setValueFloat('inAlphaCutoff',this.material.alphaCutoff);
			}
		}
	}
	
	bg.render.PositionGBufferEffect = PositionGBufferEffect;
	bg.render.GBufferEffect = GBufferEffect;
})();
