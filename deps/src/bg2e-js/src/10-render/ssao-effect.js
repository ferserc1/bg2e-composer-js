(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	let MAX_KERN_OFFSETS = 64;

	class SSAOEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
		}
		
		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				
				this._fragmentShaderSource.addParameter([
					{ name:"inViewportSize", dataType:"vec2", role:"value" },
					{ name:"inPositionMap", dataType:"sampler2D", role:"value"},
					{ name:"inNormalMap", dataType:"sampler2D", role:"value"},
					{ name:"inProjectionMatrix", dataType:"mat4", role:"value"},
					{ name:"inRandomMap", dataType:"sampler2D", role:"value"},
					{ name:"inRandomMapSize", dataType:"vec2", role:"value"},
					{ name:"inSampleRadius", dataType:"float", role:"value" },
					{ name:"inKernelOffsets", dataType:"vec3", role:"value", vec:MAX_KERN_OFFSETS },
					{ name:"inKernelSize", dataType:"int", role:"value" },
					{ name:"inSSAOColor", dataType:"vec4", role:"value" },
					{ name:"inEnabled", dataType:"bool", role:"value"},
					{ name:"inMaxDistance", dataType:"float", role:"value" },

					{ name:"fsTexCoord", dataType:"vec2", role:"in" }	// vTexturePosition
				]);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._fragmentShaderSource.setMainBody(`
					if (!inEnabled) discard;
					else {
						vec4 normalTex = texture2D(inNormalMap,fsTexCoord);
						vec3 normal = normalTex.xyz * 2.0 - 1.0;
						vec4 vertexPos = texture2D(inPositionMap,fsTexCoord);
						if (distance(vertexPos.xyz,vec3(0))>inMaxDistance || vertexPos.w==1.0 || normalTex.a==0.0) {
							discard;
						}
						else {
							vec2 noiseScale = vec2(inViewportSize.x/inRandomMapSize.x,inViewportSize.y/inRandomMapSize.y);
							vec3 randomVector = texture2D(inRandomMap, fsTexCoord * noiseScale).xyz * 2.0 - 1.0;
							vec3 tangent = normalize(randomVector - normal * dot(randomVector, normal));
							vec3 bitangent = cross(normal,tangent);
							mat3 tbn = mat3(tangent, bitangent, normal);

							float occlusion = 0.0;
							for (int i=0; i<${ MAX_KERN_OFFSETS }; ++i) {
								if (inKernelSize==i) break;
								vec3 samplePos = tbn * inKernelOffsets[i];
								samplePos = samplePos * inSampleRadius + vertexPos.xyz;

								vec4 offset = inProjectionMatrix * vec4(samplePos, 1.0);	// -w, w
								offset.xyz /= offset.w;	// -1, 1
								offset.xyz = offset.xyz * 0.5 + 0.5;	// 0, 1

								vec4 sampleRealPos = texture2D(inPositionMap, offset.xy);
								if (samplePos.z<sampleRealPos.z) {
									float dist = distance(vertexPos.xyz, sampleRealPos.xyz);
									occlusion += dist<inSampleRadius ? 1.0:0.0;
								}
								
							}
							occlusion = 1.0 - (occlusion / float(inKernelSize));
							gl_FragColor = clamp(vec4(occlusion, occlusion, occlusion, 1.0) + inSSAOColor, 0.0, 1.0);
						}
					}`);
				}
			}
			return this._fragmentShaderSource;
		}
		
		setupVars() {
			if (this.settings.kernelSize>MAX_KERN_OFFSETS) {
				this.settings.kernelSize = MAX_KERN_OFFSETS;
			}
			this.shader.setVector2("inViewportSize",new bg.Vector2(this.viewport.width, this.viewport.height));

			// Surface map parameters
			this.shader.setTexture("inPositionMap",this._surface.position,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setTexture("inNormalMap",this._surface.normal,bg.base.TextureUnit.TEXTURE_1);

			this.shader.setMatrix4("inProjectionMatrix",this.projectionMatrix);
			this.shader.setTexture("inRandomMap",this.randomMap,bg.base.TextureUnit.TEXTURE_2);
			this.shader.setVector2("inRandomMapSize",this.randomMap.size);
			this.shader.setValueFloat("inSampleRadius",this.settings.sampleRadius);
			this.shader.setVector3Ptr("inKernelOffsets",this.kernelOffsets);
			this.shader.setValueInt("inKernelSize",this.settings.kernelSize);
			this.shader.setVector4("inSSAOColor",this.settings.color);
			this.shader.setValueInt("inEnabled",this.settings.enabled);
			this.shader.setValueFloat("inMaxDistance",this.settings.maxDistance);
		}
		
		// The following parameters in this effect are required, and the program will crash if
		// some of them are not set
		get viewport() { return this._viewport; }
		set viewport(vp) { this._viewport = vp; }

		get projectionMatrix() { return this._projectionMatrix; }
		set projectionMatrix(p) { this._projectionMatrix = p; }

		// randomMap is optional. By default, it takes the default random texture from TextureCache
		get randomMap() {
			if (!this._randomMap) {
				this._randomMap = bg.base.TextureCache.RandomTexture(this.context);
			}
			return this._randomMap;
		}

		set randomMap(rm) { this._randomMap = rm; }

		// Settings: the following parameters are group in a settings object that can be exposed outside
		// the renderer object.
		get settings() {
			if (!this._settings) {
				this._currentKernelSize = 0;
				this._settings = {
					kernelSize: 32,
					sampleRadius: 0.3,
					color: bg.Color.Black(),
					blur: 4,
					maxDistance: 100.0,
					enabled: true
				}
			}
			return this._settings;
		}

		// This parameter is generated automatically using the kernelSize setting
		get kernelOffsets() {
			if (this._currentKernelSize!=this.settings.kernelSize) {
				this._kernelOffsets = [];
				for (let i=0; i<this.settings.kernelSize*3; i+=3) {
					let kernel = new bg.Vector3(bg.Math.random() * 2.0 - 1.0,
												bg.Math.random() * 2.0 - 1.0,
												bg.Math.random());
					kernel.normalize();

					let scale = (i/3) / this.settings.kernelSize;
					scale = bg.Math.lerp(0.1,1.0, scale * scale);
					kernel.scale(scale);
					this._kernelOffsets.push(kernel.x);
					this._kernelOffsets.push(kernel.y);
					this._kernelOffsets.push(kernel.z);
				}
				this._currentKernelSize = this.settings.kernelSize;
			}
			return this._kernelOffsets;
		}
	}
	
	bg.render.SSAOEffect = SSAOEffect;
})();