(function() {
	
	bg.webgl1.shaderLibrary
		.functions
		.materials = {
			samplerColor: {
				returnType:"vec4", name:"samplerColor", params: {
					sampler:"sampler2D",
					uv:"vec2", offset:"vec2", scale:"vec2"
				}, body:`
				return texture2D(sampler,uv * scale + offset);`
			},
			
			samplerNormal: {
				returnType:"vec3", name:"samplerNormal", params:{
					sampler:"sampler2D",
					uv:"vec2", offset:"vec2", scale:"vec2"
				}, body:`
				return normalize(samplerColor(sampler,uv,offset,scale).xyz * 2.0 - 1.0);
				`
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
			
			applyTextureMask:{
				returnType:"float", name:"applyTextureMask", params: {
					value:"float",
					textureMask:"sampler2D",
					uv:"vec2", offset:"vec2", scale:"vec2",
					channelMask:"vec4",
					invert:"bool"
				}, body:`
				float mask;
				vec4 color = samplerColor(textureMask,uv,offset,scale);
				mask = color.r * channelMask.r +
						 color.g * channelMask.g +
						 color.b * channelMask.b +
						 color.a * channelMask.a;
				if (invert) {
					mask = 1.0 - mask;
				}
				return value * mask;`
			},
			
			specularColor:{
				returnType:"vec4", name:"specularColor", params:{
					specular:"vec4",
					shininessMask:"sampler2D",
					uv:"vec2", offset:"vec2", scale:"vec2",
					channelMask:"vec4",
					invert:"bool"
				}, body:`
				float maskValue = applyTextureMask(1.0, shininessMask,uv,offset,scale,channelMask,invert);
				return vec4(specular.rgb * maskValue, 1.0);`
			}
		};
	
})();
