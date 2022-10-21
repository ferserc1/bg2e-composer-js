(function() {
	
	bg.webgl1.shaderLibrary
		.inputs = {
			// Input buffers
			buffers: {
				vertex: { name:"inVertex", dataType:"vec3", role:"buffer", target:"vertex" },	// role:buffer => attribute
				normal: { name:"inNormal", dataType:"vec3", role:"buffer", target:"normal" },
				tangent: { name:"inTangent", dataType:"vec3", role:"buffer", target:"tangent" },
				tex0: { name:"inTex0", dataType:"vec2", role:"buffer", target:"tex0" },
				tex1: { name:"inTex1", dataType:"vec2", role:"buffer", target:"tex1" },
				tex2: { name:"inTex2", dataType:"vec2", role:"buffer", target:"tex2" },
				color: { name:"inColor", dataType:"vec4", role:"buffer", target:"color" }
			},
			
			// Matrixes
			matrix: {
				model: { name:"inModelMatrix", dataType:"mat4", role:"value" },	// role:value => uniform
				view: { name:"inViewMatrix", dataType:"mat4", role:"value" },
				projection: { name:"inProjectionMatrix", dataType:"mat4", role:"value" },
				normal: { name:"inNormalMatrix", dataType:"mat4", role:"value" },
				viewInv: { name:"inViewMatrixInv", dataType:"mat4", role:"value" }
			},
			
			///// Material properties
			material: {
				// 		Color
				diffuse: { name:"inDiffuseColor", dataType:"vec4", role:"value" },
				specular: { name:"inSpecularColor", dataType:"vec4", role:"value" },
				
				// 		Shininess
				shininess: { name:"inShininess", dataType:"float", role:"value" },
				shininessMask: { name:"inShininessMask", dataType:"sampler2D", role:"value" },
				shininessMaskChannel: { name:"inShininessMaskChannel", dataType:"vec4", role:"value" },
				shininessMaskInvert: { name:"inShininessMaskInvert", dataType:"bool", role:"value" },
				
				// 		Light emission
				lightEmission: { name:"inLightEmission", dataType:"float", role:"value" },
				lightEmissionMask: { name:"inLightEmissionMask", dataType:"sampler2D", role:"value" },
				lightEmissionMaskChannel: { name:"inLightEmissionMaskChannel", dataType:"vec4", role:"value" },
				lightEmissionMaskInvert: { name:"inLightEmissionMaskInvert", dataType:"bool", role:"value" },
				
				
				// 		Textures
				texture: { name:"inTexture", dataType:"sampler2D", role:"value" },
				textureOffset: { name:"inTextureOffset", dataType:"vec2", role:"value" },
				textureScale: { name:"inTextureScale", dataType:"vec2", role:"value" },
				alphaCutoff: { name:"inAlphaCutoff", dataType:"float", role:"value" },
				
				lightMap: { name:"inLightMap", dataType:"sampler2D", role:"value" },
				lightMapOffset: { name:"inLightMapOffset", dataType:"vec2", role:"value" },
				lightMapScale: { name:"inLightMapScale", dataType:"vec2", role:"value" },
				
				normalMap: { name:"inNormalMap", dataType:"sampler2D", role:"value" },
				normalMapOffset: { name:"inNormalMapOffset", dataType:"vec2", role:"value" },
				normalMapScale: { name:"inNormalMapScale", dataType:"vec2", role:"value" },
				
				//		Reflection
				reflection: { name:"inReflection", dataType:"float", role:"value" },
				reflectionMask: { name:"inReflectionMask", dataType:"sampler2D", role:"value" },
				reflectionMaskChannel: { name:"inReflectionMaskChannel", dataType:"vec4", role:"value" },
				reflectionMaskInvert: { name:"inReflectionMaskInvert", dataType:"bool", role:"value" },
				
				//		Shadows
				castShadows: { name:"inCastShadows", dataType:"bool", role:"value" },
				receiveShadows: { name:"inReceiveShadows", dataType:"bool", role:"value" },

				//		Roughness
				roughness: { name:"inRoughness", dataType:"float", role:"value" },
				roughnessMask: { name:"inRoughnessMask", dataType:"sampler2D", role:"value" },
				roughnessMaskChannel: { name:"inRoughnessMaskChannel", dataType:"vec4", role:"value" },
				roughnessMaskInvert: { name:"inRoughnessMaskInvert", dataType:"bool", role:"value" },

				unlit: { name:"inUnlit", dataType:"bool", role:"value" }
			},
			
			// Lighting
			lighting: {
				type: { name:"inLightType", dataType:"int", role:"value" },
				position: { name:"inLightPosition", dataType:"vec3", role:"value" },
				direction: { name:"inLightDirection", dataType:"vec3", role:"value" },
				ambient: { name:"inLightAmbient", dataType:"vec4", role:"value" },
				diffuse: { name:"inLightDiffuse", dataType:"vec4", role:"value" },
				specular: { name:"inLightSpecular", dataType:"vec4", role:"value" },
				attenuation: { name:"inLightAttenuation", dataType:"vec3", role:"value" },	// const, linear, exp
				spotExponent: { name:"inSpotExponent", dataType:"float", role:"value" },
				spotCutoff: { name:"inSpotCutoff", dataType:"float", role:"value" },
				cutoffDistance: { name:"inLightCutoffDistance", dataType:"float", role:"value" },
				exposure: { name:"inLightExposure", dataType:"float", role:"value" },
				castShadows: { name:"inLightCastShadows", dataType:"bool", role:"value" }
			},

			lightingForward: {
				type: { name:"inLightType", dataType:"int", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				position: { name:"inLightPosition", dataType:"vec3", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				direction: { name:"inLightDirection", dataType:"vec3", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				ambient: { name:"inLightAmbient", dataType:"vec4", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				diffuse: { name:"inLightDiffuse", dataType:"vec4", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				specular: { name:"inLightSpecular", dataType:"vec4", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				attenuation: { name:"inLightAttenuation", dataType:"vec3", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },	// const, linear, exp
				spotExponent: { name:"inSpotExponent", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				spotCutoff: { name:"inSpotCutoff", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				cutoffDistance: { name:"inLightCutoffDistance", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				exposure: { name:"inLightExposure", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				castShadows: { name:"inLightCastShadows", dataType:"bool", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
				numLights: { name:"inNumLights", dataType:"int", role:"value" }
			},
			
			// Shadows
			shadows: {
				shadowMap: { name:"inShadowMap", dataType:"sampler2D", role:"value" },
				shadowMapSize: { name:"inShadowMapSize", dataType:"vec2", role:"value" },
				shadowStrength: { name:"inShadowStrength", dataType:"float", role:"value" },
				shadowColor: { name:"inShadowColor", dataType:"vec4", role:"value" },
				shadowBias: { name:"inShadowBias", dataType:"float", role:"value" },
				shadowType: { name:"inShadowType", dataType:"int", role:"value" }
			},
			
			// Color correction
			colorCorrection: {
				hue: { name:"inHue", dataType:"float", role:"value" },
				saturation: { name:"inSaturation", dataType:"float", role:"value" },
				lightness: { name:"inLightness", dataType:"float", role:"value" },
				brightness: { name:"inBrightness", dataType:"float", role:"value" },
				contrast: { name:"inContrast", dataType:"float", role:"value" }
			}

		}
})();