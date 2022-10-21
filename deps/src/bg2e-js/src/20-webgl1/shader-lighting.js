(function() {
	
	bg.webgl1.shaderLibrary
		.functions
		.lighting = {
			beckmannDistribution: {
				returnType:"float", name:"beckmannDistribution", params: {
					x:"float", roughness:"float"
				}, body: `
					float NdotH = max(x,0.0001);
					float cos2Alpha = NdotH * NdotH;
					float tan2Alpha = (cos2Alpha - 1.0) / cos2Alpha;
					float roughness2 = roughness * roughness;
					float denom = 3.141592653589793 * roughness2 * cos2Alpha * cos2Alpha;
					return exp(tan2Alpha / roughness2) / denom;
				`
			},

			beckmannSpecular: {
				returnType:"float", name:"beckmannSpecular", params:{
					lightDirection:"vec3", viewDirection:"vec3", surfaceNormal:"vec3", roughness:"float"
				}, body: `
					return beckmannDistribution(dot(surfaceNormal, normalize(lightDirection + viewDirection)), roughness);
				`
			},

			getDirectionalLight: {
				returnType:"vec4", name:"getDirectionalLight", params:{
					ambient:"vec4", diffuse:"vec4", specular:"vec4", shininess:"float",
					direction:"vec3", vertexPos:"vec3", normal:"vec3", matDiffuse:"vec4", matSpecular:"vec4",
					shadowColor:"vec4",
					specularOut:"out vec4"
				}, body: `
				vec3 color = ambient.rgb * matDiffuse.rgb;
				vec3 diffuseWeight = max(0.0, dot(normal,direction)) * diffuse.rgb;
				color += min(diffuseWeight,shadowColor.rgb) * matDiffuse.rgb;
				specularOut = vec4(0.0,0.0,0.0,1.0);
				if (shininess>0.0) {
					vec3 eyeDirection = normalize(-vertexPos);
					vec3 reflectionDirection = normalize(reflect(-direction,normal));
					float specularWeight = clamp(pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess), 0.0, 1.0);
					//sspecularWeight = beckmannSpecular(direction,eyeDirection,normal,0.01);
					vec3 specularColor = specularWeight * pow(shadowColor.rgb,vec3(10.0));
					//color += specularColor * specular.rgb * matSpecular.rgb;
					specularOut = vec4(specularColor * specular.rgb * matSpecular.rgb,1.0);
				}
				return vec4(color,1.0);`
			},

			getPointLight: {
				returnType:"vec4", name:"getPointLight", params: {
					ambient: "vec4", diffuse: "vec4", specular: "vec4", shininess: "float",
					position: "vec3", constAtt: "float", linearAtt: "float", expAtt: "float",
					vertexPos: "vec3", normal: "vec3", matDiffuse: "vec4", matSpecular: "vec4",
					specularOut:"out vec4"
				}, body: `
				vec3 pointToLight = position - vertexPos;
				float distance = length(pointToLight);
				vec3 lightDir = normalize(pointToLight);
				float attenuation = 1.0 / (constAtt + linearAtt * distance + expAtt * distance * distance);
				vec3 color = ambient.rgb * matDiffuse.rgb;
				vec3 diffuseWeight = max(0.0,dot(normal,lightDir)) * diffuse.rgb * attenuation;
				color += diffuseWeight * matDiffuse.rgb;
				specularOut = vec4(0.0,0.0,0.0,1.0);
				if (shininess>0.0) {
					vec3 eyeDirection = normalize(-vertexPos);
					vec3 reflectionDirection = normalize(reflect(-lightDir, normal));
					float specularWeight = clamp(pow(max(dot(reflectionDirection,eyeDirection),0.0), shininess), 0.0, 1.0);
					//color += specularWeight * specular.rgb * matSpecular.rgb * attenuation;
					specularOut = vec4(specularWeight * specular.rgb * matSpecular.rgb * attenuation,1.0);
				}
				return vec4(color,1.0);`
			},

			getSpotLight: {
				returnType:"vec4", name:"getSpotLight", params: {
					ambient:"vec4", diffuse:"vec4", specular:"vec4", shininess:"float",
					position:"vec3", direction:"vec3",
					constAtt:"float", linearAtt:"float", expAtt:"float",
					spotCutoff:"float", spotExponent:"float",
					vertexPos:"vec3", normal:"vec3",
					matDiffuse:"vec4", matSpecular:"vec4", shadowColor:"vec4",
					specularOut:"out vec4"
				}, body: `
				vec4 matAmbient = vec4(1.0);
				vec3 s = normalize(position - vertexPos);
				float angle = acos(dot(-s, direction));
				float cutoff = radians(clamp(spotCutoff / 2.0,0.0,90.0));
				float distance = length(position - vertexPos);
				float attenuation = 1.0 / (constAtt );//+ linearAtt * distance + expAtt * distance * distance);
				if (angle<cutoff) {
					float spotFactor = pow(dot(-s, direction), spotExponent);
					vec3 v = normalize(vec3(-vertexPos));
					vec3 h = normalize(v + s);
					vec3 diffuseAmount = matDiffuse.rgb * diffuse.rgb * max(dot(s, normal), 0.0);
					specularOut = vec4(0.0,0.0,0.0,1.0);
					if (shininess>0.0) {
						specularOut.rgb = matSpecular.rgb * specular.rgb * pow(max(dot(h,normal), 0.0),shininess);
						specularOut.rgb *= pow(shadowColor.rgb,vec3(10.0));
						//diffuseAmount += matSpecular.rgb * specular.rgb * pow(max(dot(h,normal), 0.0),shininess);
						//diffuseAmount *= pow(shadowColor.rgb,vec3(10.0));
					}
					diffuseAmount.r = min(diffuseAmount.r, shadowColor.r);
					diffuseAmount.g = min(diffuseAmount.g, shadowColor.g);
					diffuseAmount.b = min(diffuseAmount.b, shadowColor.b);
					return vec4(ambient.rgb * matDiffuse.rgb + attenuation * spotFactor * diffuseAmount,1.0);
				}
				else {
					return vec4(ambient.rgb * matDiffuse.rgb,1.0);
				}`
			},

			getLight: {
				returnType:"vec4", name:"getLight", params: {
					lightType:"int",
					ambient:"vec4", diffuse:"vec4", specular:"vec4", shininess:"float",
					lightPosition:"vec3", lightDirection:"vec3",
					constAtt:"float", linearAtt:"float", expAtt:"float",
					spotCutoff:"float", spotExponent:"float",cutoffDistance:"float",
					vertexPosition:"vec3", vertexNormal:"vec3",
					matDiffuse:"vec4", matSpecular:"vec4", shadowColor:"vec4",
					specularOut:"out vec4"
				}, body: `
					vec4 light = vec4(0.0);
					if (lightType==${ bg.base.LightType.DIRECTIONAL }) {
						light = getDirectionalLight(ambient,diffuse,specular,shininess,
										-lightDirection,vertexPosition,vertexNormal,matDiffuse,matSpecular,shadowColor,specularOut);
					}
					else if (lightType==${ bg.base.LightType.SPOT }) {
						float d = distance(vertexPosition,lightPosition);
						if (d<=cutoffDistance || cutoffDistance==-1.0) {
							light = getSpotLight(ambient,diffuse,specular,shininess,
											lightPosition,lightDirection,
											constAtt,linearAtt,expAtt,
											spotCutoff,spotExponent,
											vertexPosition,vertexNormal,matDiffuse,matSpecular,shadowColor,specularOut);
						}
					}
					else if (lightType==${ bg.base.LightType.POINT }) {
						float d = distance(vertexPosition,lightPosition);
						if (d<=cutoffDistance || cutoffDistance==-1.0) {
							light = getPointLight(ambient,diffuse,specular,shininess,
											lightPosition,
											constAtt,linearAtt,expAtt,
											vertexPosition,vertexNormal,matDiffuse,matSpecular,specularOut);
						}
					}
					return light;
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
					vec2 poissonDisk[4];
					poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
					poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
					poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
					poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
					
					for (int i=0; i<4; ++i) {
						float shadowDepth = unpack(texture2D(shadowMap, depth.xy + poissonDisk[i]/1000.0));
						
						if (shadowDepth<depth.z - bias
							&& (depth.x>0.0 && depth.x<1.0 && depth.y>0.0 && depth.y<1.0)) {
							visibility -= (shadowStrength) * 0.25;
						}
					}
					shadow = clamp(shadowColor + visibility,0.0,1.0);
				}
				return shadow;`
			}
		}	
})();