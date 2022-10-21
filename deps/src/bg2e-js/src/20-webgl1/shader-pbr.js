(function() {
    bg.webgl1.shaderLibrary
        .functions
        .pbr = {};
        
    bg.webgl1.shaderLibrary
        .inputs
        .pbr = {};

    // This file includes all the new pbr shader functions
    bg.webgl1.shaderLibrary
        .functions
        .pbr = {
        lighting: {
            processLight: {
                returnType: "vec4", name:"processLight", params: {
                    inAmbient:"vec3", inDiffuse:"vec3", inSpecular:"vec3", type:"int", specularType:"int",
                    direction:"vec3", position:"vec3",
                    inAttenuation:"vec3", spotCutoff:"float", spotOuterCutoff:"float",
                    surfaceNormal:"vec3", surfacePosition:"vec3", surfaceDiffuse:"vec3",
                    shadowColor:"vec3"
                },
                body:`
                    vec3 diffuse = vec3(0.0);
                    vec3 specular = vec3(0.0);
                    float attenuation = 1.0;
                    float shininess = 64.0;
                    if (type==${ bg.base.LightType.DIRECTIONAL }) {
                        vec3 lightDir = normalize(-direction);
                        diffuse = max(dot(normalize(surfaceNormal), lightDir), 0.0) * surfaceDiffuse;
                        vec3 viewDir = normalize(vec3(0.0) - surfacePosition);
                        vec3 reflectDir = reflect(-lightDir, surfaceNormal);
                        float spec = 0.0;
                        if (specularType==${ bg.base.SpecularType.PHONG}) {
                            spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                        }
                        else {
                            vec3 halfwayDir = normalize(lightDir + viewDir);
                            spec = pow(max(dot(surfaceNormal, halfwayDir), 0.0), shininess);
                        }
                        specular = spec * inSpecular;
                        specular *= pow(shadowColor,vec3(10.0));
                    }
                    else if (type==${ bg.base.LightType.POINT }) {
                        vec3 lightDir = normalize(position - surfacePosition);
                        float distance = length(position - surfacePosition);
                        attenuation = 1.0 / (
                            inAttenuation.x +
                            inAttenuation.y * distance +
                            inAttenuation.z * distance * distance
                        );
                        diffuse = max(dot(normalize(surfaceNormal), lightDir), 0.0) * inDiffuse;
                        vec3 viewDir = normalize(vec3(0.0) - surfacePosition);
                        vec3 reflectDir = reflect(-lightDir, surfaceNormal);

                        float spec = 0.0;
                        if (specularType==${ bg.base.SpecularType.PHONG}) {
                            spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                        }
                        else {
                            vec3 halfwayDir = normalize(lightDir + viewDir);
                            spec = pow(max(dot(surfaceNormal, halfwayDir), 0.0), shininess);
                        }

                        specular = spec * inSpecular;
                    }
                    else if (type==${ bg.base.LightType.SPOT }) {
                        vec3 lightDirToSurface = normalize(position - surfacePosition);
                        float theta = dot(lightDirToSurface,normalize(-direction));
                        if (theta > spotCutoff) {
                            float epsilon = spotCutoff - spotOuterCutoff;
                            float intensity = 1.0 - clamp((theta - spotOuterCutoff) / epsilon, 0.0, 1.0);
                            float distance = length(position - surfacePosition);
                            diffuse = max(dot(normalize(surfaceNormal), lightDirToSurface), 0.0) * inDiffuse * intensity;
                            vec3 viewDir = normalize(vec3(0.0) - surfacePosition);
                            vec3 reflectDir = reflect(-lightDirToSurface, surfaceNormal);
                            float spec = 0.0;
                            if (specularType==${ bg.base.SpecularType.PHONG}) {
                                spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                            }
                            else {
                                vec3 halfwayDir = normalize(lightDirToSurface + viewDir);
                                spec = pow(max(dot(surfaceNormal, halfwayDir), 0.0), shininess);
                            }
                            specular = spec * inSpecular * intensity;
                            specular *= pow(shadowColor,vec3(10.0));
                        }
                    }
                    vec3 shadowAmbient = clamp(shadowColor,inAmbient,vec3(1.0));
                    diffuse = min(diffuse,shadowAmbient);
                    return vec4((inAmbient + diffuse + specular) * attenuation,1.0);
                `
            },
            
            getShadowColor:{
				returnType:"vec4", name:"getShadowColor", params:{
					vertexPosFromLight:'vec4', shadowMap:'sampler2D', shadowMapSize:'vec2',
					shadowType:'int', shadowStrength:'float', shadowBias:'float', shadowColor:'vec4'
				}, body:`
				float visibility = 1.0;
				vec3 depth = vertexPosFromLight.xyz / vertexPosFromLight.w;
				const float kShadowBorderOffset = 3.0;
				float shadowBorderOffset = kShadowBorderOffset / shadowMapSize.x;
				float bias = shadowBias;
                vec4 shadow = vec4(1.0);
                
                float shadowDepth = unpack(texture2D(shadowMap,depth.xy));

				if (shadowType==${ bg.base.ShadowType.HARD }) {	// hard
                    float shadowDepth = unpack(texture2D(shadowMap,depth.xy));
					if (shadowDepth<depth.z - bias &&
						(depth.x>0.0 && depth.x<1.0 && depth.y>0.0 && depth.y<1.0))
					{
						visibility = 1.0 - shadowStrength;
					}
					shadow = clamp(shadowColor + visibility,0.0,1.0);
				}
				else if (shadowType>=${ bg.base.ShadowType.SOFT }) {	// soft / soft stratified (not supported on webgl, fallback to soft)
					vec2 poissonDisk[7];
                    poissonDisk[0] = vec2( -0.54201624, -0.19906216 );
                    poissonDisk[1] = vec2( 0.54558609, -0.46890725 );
                    poissonDisk[2] = vec2( -0.054184101, -0.52938870 );
                    poissonDisk[3] = vec2( 0.02495938, -0.14387760 );
                    poissonDisk[4] = vec2( -0.24495938, 0.14387760 );
                    poissonDisk[5] = vec2( 0.3495938, -0.74387760 );
                    poissonDisk[6] = vec2( -0.07495938, 0.54387760 );
                    
                    for (int i=0; i<7; ++i) {
                        float shadowDepth = unpack(texture2D(shadowMap, depth.xy + poissonDisk[i]/3000.0));
                        
                        if (shadowDepth<depth.z - bias
                            && (depth.x>0.0 && depth.x<1.0 && depth.y>0.0 && depth.y<1.0)) {
                            visibility -= (shadowStrength) * 0.14;
                        }
                    }
                    shadow = clamp(shadowColor + visibility,0.0,1.0);
				}
				return shadow;`
			}
        },

        material: {
            samplerColor: {
                returnType: "vec4", name:"samplerColor", params: {
                    sampler:"sampler2D",
                    uv:"vec2", scale:"vec2"
                }, body: `
                return texture2D(sampler,uv*scale);`
            },

            samplerNormal: {
				returnType:"vec3", name:"samplerNormal", params:{
					sampler:"sampler2D",
					uv:"vec2", scale:"vec2"
				}, body:`
				return normalize(samplerColor(sampler,uv,scale).xyz * 2.0 - 1.0);`
            },

            combineNormalWithMap:{
				returnType:"vec3", name:"combineNormalWithMap", params:{
					normalCoord:"vec3",
					tangent:"vec3",
					bitangent:"vec3",
					normalMapValue:"vec3"
				}, body:`
				mat3 tbnMat = mat3( tangent.x, bitangent.x, normalCoord.x,
							tangent.y, bitangent.y, normalCoord.y,
							tangent.z, bitangent.z, normalCoord.z
						);
				return normalize(normalMapValue * tbnMat);`
            },
            
            parallaxMapping: {
                returnType: "vec2", name:"parallaxMapping", params: {
                    height:"float", texCoords:"vec2", viewDir:"vec3", scale:"float", texScale:"vec2"
                }, body: `
                float height_scale = (0.01 * scale) / ((texScale.x + texScale.y) / 2.0);
                vec2 p = viewDir.xy / viewDir.z;
                p.x *= -1.0;
                p.y *= -1.0;
                p *= (height * height_scale);
                return texCoords - p;
                `
            }
        },

        utils: {
            pack: {
				returnType:"vec4", name:"pack", params:{ depth:"float" }, body: `
				const vec4 bitSh = vec4(256 * 256 * 256,
										256 * 256,
										256,
										1.0);
				const vec4 bitMsk = vec4(0,
										1.0 / 256.0,
										1.0 / 256.0,
										1.0 / 256.0);
				vec4 comp = fract(depth * bitSh);
				comp -= comp.xxyz * bitMsk;
				return comp;`
			},
			
			unpack: {
				returnType:"float", name:"unpack", params:{ color:"vec4" }, body:`
				const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),
											1.0 / (256.0 * 256.0),
											1.0 / 256.0,
											1.0);
				return dot(color, bitShifts);`
			},
			
			random: {
				returnType:"float", name:"random", params:{
					seed:"vec3", i:"int"
				}, body:`
				vec4 seed4 = vec4(seed,i);
				float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
				return fract(sin(dot_product) * 43758.5453);`
            },
            
            gammaCorrection: {
                returnType:"vec4", name:"gammaCorrection", params:{
                    color:"vec4", gamma:"float"
                }, body:`
                return pow(color,vec4(1.0/gamma));
                `
            },

            inverseGammaCorrection: {
                returnType:"vec4", name:"inverseGammaCorrection", params: {
                    color:"vec4", gamma:"float"
                }, body:`
                return pow(color,vec4(gamma));
                `
            }
        }
    }
        

    bg.webgl1.shaderLibrary
        .inputs
        .pbr.material = {
            diffuse: { name:"inDiffuse", dataType:"sampler2D", role:"value" },
            alphaCutoff: { name:"inAlphaCutoff", dataType:"float", role:"value" },            
            //fresnel: { name:"inFresnel", dataType:"sampler2D", role:"value" },
            fresnel: { name:"inFresnel", dataType:"vec4", role:"value" },
            height: { name:"inHeight", dataType:"sampler2D", role:"value" },
            heighMetallicRoughnessAO: { name:"inHeighMetallicRoughnessAO", dataType:"sampler2D", role:"value" },
            normal: { name:"inNormalMap", dataType:"sampler2D", role:"value" },
            
            diffuseUV: { name:"inDiffuseUV", dataType:"int", role:"value" },
            metallicUV: { name:"inMetallicUV", dataType:"int", role:"value" },
            roughnessUV: { name:"inRoughnessUV", dataType:"int", role:"value" },
            fresnelUV: { name:"inFresnelUV", dataType:"int", role:"value" },
            heightUV: { name:"inHeightUV", dataType:"int", role:"value" },
            ambientOcclussionUV: { name:"inAmbientOcclussionUV", dataType:"int", role:"value" },
            lightEmissionUV: { name:"inLightEmissionUV", dataType:"int", role:"value" },
            normalUV: { name:"inNormalUV", dataType:"int", role:"value" },
            
            diffuseScale: { name:"inDiffuseScale", dataType:"vec2", role:"value" },
            metallicScale: { name:"inMetallicScale", dataType:"vec2", role:"value" },
            roughnessScale: { name:"inRoughnessScale", dataType:"vec2", role:"value" },
            fresnelScale: { name:"inFresnelScale", dataType:"vec2", role:"value" },
            lightEmissionScale: { name:"inLightEmissionScale", dataType:"vec2", role:"value" },
            heightScale: { name:"inHeightScale", dataType:"vec2", role:"value" },
            normalScale: { name:"inNormalScale", dataType:"vec2", role:"value" },

            receiveShadows: { name:"inReceiveShadows", dataType:"bool", role:"value" },
            heightIntensity: { name:"inHeightIntensity", dataType:"float", role:"value" },

            unlit: { name:"inUnlit", dataType:"bool", role:"value" }
        };

    bg.webgl1.shaderLibrary
        .inputs
        .pbr.lighting = {
            ambient: { name:"inLightAmbient", dataType:"vec4", role:"value" }
        };

    
    bg.webgl1.shaderLibrary
        .inputs
        .pbr.lightingForward = {
            lightType: { name:"inLightType", dataType:"int", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            diffuse: { name:"inLightDiffuse", dataType:"vec4", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            specular: { name:"inLightSpecular", dataType:"vec4", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            position: { name:"inLightPosition", dataType:"vec3", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            direction: { name:"inLightDirection", dataType:"vec3", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            intensity: { name:"inLightIntensity", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            spotCutoff: { name:"inLightSpotCutoff", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS },
            outerSpotCutoff: { name:"inLightOuterSpotCutoff", dataType:"float", role:"value", vec:bg.base.MAX_FORWARD_LIGHTS }
        };

    bg.webgl1.shaderLibrary
        .inputs
        .pbr.shadows = {
            shadowMap: { name:"inShadowMap", dataType:"sampler2D", role:"value" },
            shadowMapSize: { name:"inShadowMapSize", dataType:"vec2", role:"value" },
            shadowStrength: { name:"inShadowStrength", dataType:"float", role:"value" },
            shadowColor: { name:"inShadowColor", dataType:"vec4", role:"value" },
            shadowBias: { name:"inShadowBias", dataType:"float", role:"value" },
            shadowType: { name:"inShadowType", dataType:"int", role:"value" }
        };
    
    bg.webgl1.shaderLibrary
        .inputs
        .pbr.colorCorrection = {
            gammaCorrection: { name:"inGammaCorrection", dataType:"float", role:"value" },
            saturation: { name:"inSaturation", dataType:"float", role:"value" },
            brightness: { name:"inBrightness", dataType:"float", role:"value" },
            contrast: { name:"inContrast", dataType:"float", role:"value" }
        }
})();
