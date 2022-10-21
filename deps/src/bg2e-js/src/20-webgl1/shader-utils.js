(function() {
	
	bg.webgl1.shaderLibrary
		.functions
		.utils = {
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

			texOffset: {
				returnType: 'vec4', name:'texOffset', params: {
					sampler:'sampler2D',
					texCoord:'vec2',
					offset:'vec2',
					frameSize:'vec2'
				}, body: `
				return texture2D(sampler,texCoord + vec2(offset.x * 1.0/frameSize.x,offset.y * 1.0 / frameSize.y));
				`
			},

			luminance: {
				returnType: 'float', name:'luminance', params: { color:'vec3' }, body: `
				return dot(vec3(0.2126,0.7152,0.0722), color);
				`
			},

			// Require: colorCorrection.luminance and utils.texOffset
			borderDetection:{
				returnType: 'float', name:'borderDetection', params: {
					sampler:'sampler2D', texCoord:'vec2', frameSize:'vec2'
				}, body: `
				float s00 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 1.0),frameSize).rgb);
				float s10 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 0.0),frameSize).rgb);
				float s20 = luminance(texOffset(sampler,texCoord,vec2(-1.0,-1.0),frameSize).rgb);
				float s01 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 1.0),frameSize).rgb);
				float s21 = luminance(texOffset(sampler,texCoord,vec2( 0.0,-1.0),frameSize).rgb);
				float s02 = luminance(texOffset(sampler,texCoord,vec2( 1.0, 1.0),frameSize).rgb);
				float s12 = luminance(texOffset(sampler,texCoord,vec2( 1.0, 0.0),frameSize).rgb);
				float s22 = luminance(texOffset(sampler,texCoord,vec2( 1.0,-1.0),frameSize).rgb);

				float sx = s00 + 2.0 * s10 + s20 - (s02 + 2.0 * s12 + s22);
				float sy = s00 + 2.0 * s01 + s02 - (s20 + 2.0 * s21 + s22);

				return sx * sx + sy * sy;
				`
			},

			applyConvolution:{
				returnType:'vec4', name:'applyConvolution', params: {
					texture:'sampler2D', texCoord:'vec2', texSize:'vec2', convMatrix:'float[9]', radius:'float'
				}, body: `
				vec2 onePixel = vec2(1.0,1.0) / texSize * radius;
				vec4 colorSum = 
					texture2D(texture, texCoord + onePixel * vec2(-1, -1)) * convMatrix[0] +
					texture2D(texture, texCoord + onePixel * vec2( 0, -1)) * convMatrix[1] +
					texture2D(texture, texCoord + onePixel * vec2( 1, -1)) * convMatrix[2] +
					texture2D(texture, texCoord + onePixel * vec2(-1,  0)) * convMatrix[3] +
					texture2D(texture, texCoord + onePixel * vec2( 0,  0)) * convMatrix[4] +
					texture2D(texture, texCoord + onePixel * vec2( 1,  0)) * convMatrix[5] +
					texture2D(texture, texCoord + onePixel * vec2(-1,  1)) * convMatrix[6] +
					texture2D(texture, texCoord + onePixel * vec2( 0,  1)) * convMatrix[7] +
					texture2D(texture, texCoord + onePixel * vec2( 1,  1)) * convMatrix[8];
				float kernelWeight =
					convMatrix[0] +
					convMatrix[1] +
					convMatrix[2] +
					convMatrix[3] +
					convMatrix[4] +
					convMatrix[5] +
					convMatrix[6] +
					convMatrix[7] +
					convMatrix[8];
				if (kernelWeight <= 0.0) {
					kernelWeight = 1.0;
				}
				return vec4((colorSum / kernelWeight).rgb, 1.0);
				`
			}
		}	
})();