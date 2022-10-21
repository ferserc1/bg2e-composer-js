(function() {
	
	bg.webgl1.shaderLibrary
		.functions
		.colorCorrection = {
			rgb2hsv: {
				returnType:"vec3", name:"rgb2hsv", params:{ c:"vec3" }, body:`
				vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
				vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
				vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

				float d = q.x - min(q.w, q.y);
				float e = 1.0e-10;
				return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);`
			},
			hsv2rgb: {
				returnType:"vec3", name:"hsv2rgb", params: { c:"vec3" }, body:`
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);`
			},
			applyBrightness: {
				returnType:"vec4", name:"applyBrightness", params: { color:"vec4", brightness:"float" }, body:`
					return clamp(vec4(color.rgb + brightness - 0.5,1.0),0.0,1.0);
				`
			},
			applyContrast: {
				returnType:"vec4", name:"applyContrast", params:{ color:"vec4", contrast:"float" }, body:`
				return clamp(vec4((color.rgb * max(contrast + 0.5,0.0)),1.0),0.0,1.0);`
			},
			applySaturation: {
				returnType:"vec4", name:"applySaturation", params:{ color:"vec4", hue:"float", saturation:"float", lightness:"float" }, body:`
				vec3 fragRGB = clamp(color.rgb + vec3(0.001),0.0,1.0);
				vec3 fragHSV = rgb2hsv(fragRGB);
				lightness -= 0.01;
				float h = hue;
				fragHSV.x *= h;
				fragHSV.yz *= vec2(saturation,lightness);
				fragHSV.x = mod(fragHSV.x, 1.0);
				fragHSV.y = mod(fragHSV.y, 1.0);
				fragHSV.z = mod(fragHSV.z, 1.0);
				fragRGB = hsv2rgb(fragHSV);
				return clamp(vec4(hsv2rgb(fragHSV), color.w),0.0,1.0);`
			},
			colorCorrection: {
				returnType:"vec4", name:"colorCorrection", params:{
					fragColor:"vec4", hue:"float", saturation:"float",
					lightness:"float", brightness:"float", contrast:"float" },
				body:`
				return applyContrast(applyBrightness(applySaturation(fragColor,hue,saturation,lightness),brightness),contrast);`
			},
			brightnessMatrix: {
				returnType:"mat4", name:"brightnessMatrix", params: {
					brightness: "float"
				}, body: `
				return mat4( 1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					brightness, brightness, brightness, 1 );
				`
			},
			contrastMatrix: {
				returnType:"mat4", name:"contrastMatrix", params: {
					contrast: "float"
				}, body: `
				float t = ( 1.0 - contrast ) / 2.0;
				return mat4( contrast, 0, 0, 0,
					0, contrast, 0, 0,
					0, 0, contrast, 0,
					t, t, t, 1 );
				`
			},
			saturationMatrix: {
				returnType:"mat4", name:"saturationMatrix", params: {
					saturation: "float"
				}, body: `
				vec3 luminance = vec3( 0.3086, 0.6094, 0.0820 );
    
				float oneMinusSat = 1.0 - saturation;
				
				vec3 red = vec3( luminance.x * oneMinusSat );
				red+= vec3( saturation, 0, 0 );
				
				vec3 green = vec3( luminance.y * oneMinusSat );
				green += vec3( 0, saturation, 0 );
				
				vec3 blue = vec3( luminance.z * oneMinusSat );
				blue += vec3( 0, 0, saturation );
				
				return mat4( red,     0,
							green,   0,
							blue,    0,
							0, 0, 0, 1 );
				`
			}
		}
	
})();