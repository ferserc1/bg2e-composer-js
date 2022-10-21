(function() {
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	bg.render.RaytracerQuality = {
		low : { maxSamples: 50, rayIncrement: 0.025 },
		mid: { maxSamples: 100, rayIncrement: 0.0125 },
		high: { maxSamples: 200, rayIncrement: 0.0062 },
		extreme: { maxSamples: 300, rayIncrement: 0.0031 }
	}; 

	class SSRTEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
			this._basic = false;
			this._viewportSize = new bg.Vector2(1920,1080);
			this._frameIndex = 0;
		}
		
		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				let q = this.quality;

				this._fragmentShaderSource.addParameter([
					{ name:"inPositionMap", dataType:"sampler2D", role:"value"},
					{ name:"inSpecularMap", dataType:"sampler2D", role:"value" },
					{ name:"inNormalMap", dataType:"sampler2D", role:"value"},
					{ name:"inLightingMap", dataType:"sampler2D", role:"value"},
					{ name:"inMaterialMap", dataType:"sampler2D", role:"value"},
					{ name:"inSamplePosMap", dataType:"sampler2D", role:"value"},
					{ name:"inProjectionMatrix", dataType:"mat4", role:"value"},
					{ name:"inCameraPos", dataType:"vec3", role:"value" },
					{ name:"inRayFailColor", dataType:"vec4", role:"value" },
					{ name:"inBasicMode", dataType:"bool", role:"value" },
					{ name:"inFrameIndex", dataType:"float", role:"value" },
					{ name:"inCubeMap", dataType:"samplerCube", role:"value" },

					{ name:"inRandomTexture", dataType:"sampler2D", role:"value" },

					{ name:"fsTexCoord", dataType:"vec2", role:"in" }	// vTexturePosition
				]);

				this._fragmentShaderSource.addFunction(lib().functions.utils.random);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._fragmentShaderSource.setMainBody(`
						vec2 p = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
						bool renderFrame = false;
						if (inFrameIndex==0.0 && mod(p.x,2.0)==0.0 && mod(p.y,2.0)==0.0) {
							renderFrame = true;
						}
						else if (inFrameIndex==1.0 && mod(p.x,2.0)==0.0 && mod(p.y,2.0)!=0.0) {
							renderFrame = true;
						}
						else if (inFrameIndex==2.0 && mod(p.x,2.0)!=0.0 && mod(p.y,2.0)==0.0) {
							renderFrame = true;
						}
						else if (inFrameIndex==3.0 && mod(p.x,2.0)!=0.0 && mod(p.y,2.0)!=0.0) {
							renderFrame = true;
						}

						vec4 material = texture2D(inMaterialMap,fsTexCoord);
						if (renderFrame && material.b>0.0) {	// material[2] is reflectionAmount
							vec3 normal = texture2D(inNormalMap,fsTexCoord).xyz * 2.0 - 1.0;
							
							vec4 specular = texture2D(inSpecularMap,fsTexCoord);
							float roughness = specular.a * 0.3;
							vec3 r = texture2D(inRandomTexture,fsTexCoord*200.0).xyz * 2.0 - 1.0;
							vec3 roughnessFactor = normalize(r) * roughness;
							normal = normal + roughnessFactor;
							vec4 vertexPos = texture2D(inPositionMap,fsTexCoord);
							vec3 cameraVector = vertexPos.xyz - inCameraPos;
							vec3 rayDirection = reflect(cameraVector,normal);
							vec4 lighting = texture2D(inLightingMap,fsTexCoord);
							
							vec4 rayFailColor = inRayFailColor;
	
							vec3 lookup = reflect(cameraVector,normal);
							rayFailColor = textureCube(inCubeMap, lookup);
							
							float increment = ${q.rayIncrement};
							vec4 result = rayFailColor;
							if (!inBasicMode) {
								result = rayFailColor;
								for (float i=0.0; i<${q.maxSamples}.0; ++i) {
									if (i==${q.maxSamples}.0) {
										break;
									}
	
									float radius = i * increment;
									increment *= 1.01;
									vec3 ray = vertexPos.xyz + rayDirection * radius;
	
									vec4 offset = inProjectionMatrix * vec4(ray, 1.0);	// -w, w
									offset.xyz /= offset.w;	// -1, 1
									offset.xyz = offset.xyz * 0.5 + 0.5;	// 0, 1
	
									vec4 rayActualPos = texture2D(inSamplePosMap, offset.xy);
									float hitDistance = rayActualPos.z - ray.z;
									if (offset.x>1.0 || offset.y>1.0 || offset.x<0.0 || offset.y<0.0) {
										result = rayFailColor;
										break;
									}
									else if (hitDistance>0.02 && hitDistance<0.15) {
										result = texture2D(inLightingMap,offset.xy);
										break;
									}
								}
							}
							if (result.a==0.0) {
								gl_FragColor = rayFailColor;
							}
							else {
								gl_FragColor = result;
							}
						}
						else {
							discard;
						}`);
				}
			}
			return this._fragmentShaderSource;
		}
		
		setupVars() {
			this._frameIndex = (this._frameIndex + 1) % 4;
			this.shader.setTexture("inPositionMap",this._surface.position,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setTexture("inNormalMap",this._surface.normal,bg.base.TextureUnit.TEXTURE_1);
			this.shader.setTexture("inLightingMap",this._surface.reflectionColor,bg.base.TextureUnit.TEXTURE_2);
			this.shader.setTexture("inMaterialMap",this._surface.material,bg.base.TextureUnit.TEXTURE_3);
			this.shader.setTexture("inSamplePosMap",this._surface.reflectionDepth, bg.base.TextureUnit.TEXTURE_4);
			this.shader.setMatrix4("inProjectionMatrix",this._projectionMatrix);
			this.shader.setVector3("inCameraPos",this._cameraPos);
			this.shader.setVector4("inRayFailColor",this.rayFailColor);
			this.shader.setValueInt("inBasicMode",this.basic);
			this.shader.setValueFloat("inFrameIndex",this._frameIndex);
			
			this.shader.setTexture("inCubeMap",bg.scene.Cubemap.Current(this.context), bg.base.TextureUnit.TEXTURE_5);
			
			
			if (!this._randomTexture) {
				this._randomTexture = bg.base.TextureCache.RandomTexture(this.context,new bg.Vector2(1024));
			}
			this.shader.setTexture("inRandomTexture",this._randomTexture, bg.base.TextureUnit.TEXTURE_6);

			this.shader.setTexture("inSpecularMap",this._surface.specular,bg.base.TextureUnit.TEXTURE_7);
		}

		get projectionMatrix() { return this._projectionMatrix; }
		set projectionMatrix(p) { this._projectionMatrix = p; }

		get cameraPosition() { return this._cameraPos; }
		set cameraPosition(c) { this._cameraPos = c; }

		get rayFailColor() { return this._rayFailColor || bg.Color.Black(); }
		set rayFailColor(c) { this._rayFailColor = c; }

		get viewportSize() { return this._viewportSize; }
		set viewportSize(s) { this._viewportSize = s; }

		get quality() { return this._quality || bg.render.RaytracerQuality.low; }
		set quality(q) {
			if (!this._quality || this._quality.maxSamples!=q.maxSamples ||
				this._quality.rayIncrement!=q.rayIncrement)
			{
				this._quality = q;
				this._fragmentShaderSource = null;
				this.rebuildShaders();
			}
		}

		get basic() { return this._basic; }
		set basic(b) { this._basic = b; }

		// TODO: SSRT settings
		get settings() {
			if (!this._settings) {
			}
			return this._settings;
		}
	}
	
	bg.render.SSRTEffect = SSRTEffect;
})();