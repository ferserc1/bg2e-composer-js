(function() {
	let MAX_BLUR_ITERATIONS = 40;
	
	let BLUR_DOWNSAMPLE = 15 	;

	let textureCubeDownsampleParams = {
		textureInput:'samplerCube', texCoord:'vec3', size:'vec2', reduction:'vec2'
	};
	let textureCubeDownsampleBody = `
		float dx = reduction.x / size.x;
		float dy = reduction.y / size.y;
		vec2 coord = vec2(dx * texCoord.x / dx, dy * texCoord.y / dy);
		return textureCube(textureInput,coord);
	`;

	let textureDownsampleParams = {
		textureInput:'sampler2D', texCoord:'vec2', size:'vec2', reduction:'vec2'
	};
	let textureDownsampleBody = `
		float dx = reduction.x / size.x;
		float dy = reduction.y / size.y;
		vec2 coord = vec2(dx * texCoord.x / dx, dy * texCoord.y / dy);
		return texture2D(textureInput,coord);
	`;

	let blurParams = {
			textureInput:'sampler2D', texCoord:'vec2', size:'int', samplerSize:'vec2'
		};
	let blurBody = `
		int downsample = ${ BLUR_DOWNSAMPLE };
		vec2 texelSize = 1.0 / samplerSize;
		vec3 result = vec3(0.0);
		size = int(max(float(size / downsample),1.0));
		vec2 hlim = vec2(float(-size) * 0.5 + 0.5);
		vec2 sign = vec2(1.0);
		float blurFactor = 10.0 - 0.2 * float(size) * log(float(size));
		for (int x=0; x<${ MAX_BLUR_ITERATIONS }; ++x) {
			if (x==size) break;
			for (int y=0; y<${ MAX_BLUR_ITERATIONS }; ++y) {
				if (y==size) break;
				vec2 offset = (hlim + vec2(float(x), float(y))) * texelSize * float(downsample) / blurFactor;
				result += textureDownsample(textureInput, texCoord + offset,samplerSize,vec2(downsample)).rgb;
			}
		}
		return vec4(result / float(size * size), 1.0);
		`;
	
	let glowParams = {
			textureInput:'sampler2D', texCoord:'vec2', size:'int', samplerSize:'vec2'			
		};
	let glowBody = `
		int downsample = ${ BLUR_DOWNSAMPLE };
		vec2 texelSize = 1.0 / samplerSize;
		vec3 result = vec3(0.0);
		size = int(max(float(size / downsample),1.0));
		vec2 hlim = vec2(float(-size) * 0.5 + 0.5);
		vec2 sign = vec2(1.0);
		for (int x=0; x<${ MAX_BLUR_ITERATIONS }; ++x) {
			if (x==size) break;
			for (int y=0; y<${ MAX_BLUR_ITERATIONS }; ++y) {
				if (y==size) break;
				vec2 offset = (hlim + vec2(float(x), float(y))) * texelSize;
				result += textureDownsample(textureInput, texCoord + offset,samplerSize,vec2(downsample)).rgb;
			}
		}
		return vec4(result / float(size * size), 1.0);
	`;

	let blurCubeParams = {
		textureInput:'samplerCube', texCoord:'vec3', size:'int', samplerSize:'vec2', dist:'float'
	};
	let blurCubeBody = `
		int downsample = int(max(1.0,dist));
		vec2 texelSize = 1.0 / samplerSize;
		vec3 result = vec3(0.0);
		size = int(max(float(size / downsample),1.0));
		vec2 hlim = vec2(float(-size) * 0.5 + 0.5);
		vec2 sign = vec2(1.0);
		for (int x=0; x<40; ++x) {
			if (x==size) break;
			for (int y=0; y<40; ++y) {
				if (y==size) break;
				vec3 offset = vec3((hlim + vec2(float(x*downsample), float(y*downsample))) * texelSize,0.0);
				result += textureCube(textureInput, texCoord + offset,2.0).rgb;
			}
		}
		return vec4(result / float(size * size), 1.0);
		`;
	
	bg.webgl1.shaderLibrary
		.functions
		.blur = {
			textureDownsample:{
				returnType:"vec4", name:'textureDownsample', params:textureDownsampleParams, body:textureDownsampleBody
			},
			gaussianBlur:{
				returnType:"vec4", name:"gaussianBlur", params:blurParams, body:blurBody
			},
			blur:{
				returnType:"vec4", name:"blur", params:blurParams, body:blurBody
			},
			glowBlur:{
				returnType:"vec4", name:"glowBlur", params:glowParams, body:glowBody
			},
			blurCube:{
				returnType:"vec4", name:"blurCube", params:blurCubeParams, body:blurCubeBody
			},

			// Require: utils.borderDetection
			antiAlias:{
				returnType:'vec4', name:'antiAlias', params: {
					sampler:'sampler2D', texCoord:'vec2', frameSize:'vec2', tresshold:'float', iterations:'int'
				}, body: `
				return (borderDetection(sampler,texCoord,frameSize)>tresshold) ?
					gaussianBlur(sampler,texCoord,iterations,frameSize) :
					texture2D(sampler,texCoord);
				`
			}
		}
})();