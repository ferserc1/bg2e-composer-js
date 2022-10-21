(function() {

	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	class ShadowEffect extends bg.base.Effect {
		constructor(context) {
			super(context);
			
			let vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
			let fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
			
			vertex.addParameter([
				lib().inputs.buffers.vertex,
				lib().inputs.buffers.tex0,
				null,
				lib().inputs.matrix.model,
				lib().inputs.matrix.view,
				lib().inputs.matrix.projection,
				{ name:"inLightProjectionMatrix", dataType:"mat4", role:"value" },
				{ name:"inLightViewMatrix", dataType:"mat4", role:"value" },
				null,
				{ name:"fsTexCoord", dataType:"vec2", role:"out" },
				{ name:"fsVertexPosFromLight", dataType:"vec4", role:"out" }
			]);
			
			fragment.addParameter(lib().inputs.shadows.all);
			fragment.addFunction(lib().functions.utils.unpack);
			fragment.addFunction(lib().functions.lighting.getShadowColor);
			
			fragment.addParameter([
				lib().inputs.material.receiveShadows,
				lib().inputs.material.texture,
				lib().inputs.material.textureOffset,
				lib().inputs.material.textureScale,
				lib().inputs.material.alphaCutoff,
				null,
				{ name:"fsTexCoord", dataType:"vec2", role:"in" },
				{ name:"fsVertexPosFromLight", dataType:"vec4", role:"in" }
			]);
			
			fragment.addFunction(lib().functions.materials.samplerColor);
			
			if (bg.Engine.Get().id=="webgl1") {
				vertex.setMainBody(`
					mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0,
											0.0, 0.5, 0.0, 0.0,
											0.0, 0.0, 0.5, 0.0,
											0.5, 0.5, 0.5, 1.0);
					
					fsVertexPosFromLight = ScaleMatrix * inLightProjectionMatrix * inLightViewMatrix * inModelMatrix * vec4(inVertex,1.0);
					fsTexCoord = inTex0;
					
					gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);`);
				
				fragment.setMainBody(`
					float alpha = samplerColor(inTexture,fsTexCoord,inTextureOffset,inTextureScale).a;
					if (alpha>inAlphaCutoff) {
						vec4 shadowColor = vec4(1.0, 1.0, 1.0, 1.0);
						if (inReceiveShadows) {
							shadowColor = getShadowColor(fsVertexPosFromLight,inShadowMap,inShadowMapSize,
														 inShadowType,inShadowStrength,inShadowBias,inShadowColor);
						}
						gl_FragColor = shadowColor;
					}
					else {
						discard;
					}`);
			}
			
			this.setupShaderSource([ vertex, fragment ]);
		}
		
		beginDraw() {
			if (this.light && this.shadowMap) {
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
				let lightTransform = this.shadowMap.viewMatrix;
				
				this.shader.setMatrix4("inLightProjectionMatrix", this.shadowMap.projection);
				
				this.shader.setMatrix4("inLightViewMatrix",lightTransform);
				this.shader.setValueInt("inShadowType",this.shadowMap.shadowType);
				this.shader.setTexture("inShadowMap",this.shadowMap.texture,bg.base.TextureUnit.TEXTURE_1);
				this.shader.setVector2("inShadowMapSize",this.shadowMap.size);
				this.shader.setValueFloat("inShadowStrength",this.light.shadowStrength);
				this.shader.setVector4("inShadowColor",this.shadowMap.shadowColor);
				this.shader.setValueFloat("inShadowBias",this.light.shadowBias);
			}
		}
		
		setupVars() {
			if (this.material && this.light) {
				let matrixState = bg.base.MatrixState.Current();
				let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
				
				this.shader.setMatrix4("inModelMatrix",matrixState.modelMatrixStack.matrixConst);
				this.shader.setMatrix4("inViewMatrix",viewMatrix);
				this.shader.setMatrix4("inProjectionMatrix",matrixState.projectionMatrixStack.matrixConst);
				
				let texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
				this.shader.setTexture("inTexture",texture,bg.base.TextureUnit.TEXTURE_0);
				this.shader.setVector2("inTextureOffset",this.material.textureOffset);
				this.shader.setVector2("inTextureScale",this.material.textureScale);
				this.shader.setValueFloat("inAlphaCutoff",this.material.alphaCutoff);
				
				this.shader.setValueInt("inReceiveShadows",this.material.receiveShadows);
			}
		}
		
		get material() { return this._material; }
		set material(m) { this._material = m; }
		
		get light() { return this._light; }
		set light(l) { this._light = l; }
		
		get shadowMap() { return this._shadowMap; }
		set shadowMap(sm) { this._shadowMap = sm; }
	}
	
	bg.render.ShadowEffect = ShadowEffect;
	
})();