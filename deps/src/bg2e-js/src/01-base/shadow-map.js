(function() {
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}
	
	let s_vertexSource = null;
	let s_fragmentSource = null;

	
	function vertexShaderSource() {
		if (!s_vertexSource) {
			s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
			
			s_vertexSource.addParameter([
				lib().inputs.buffers.vertex,
				lib().inputs.buffers.tex0,
				null,
				lib().inputs.matrix.model,
				lib().inputs.matrix.view,
				lib().inputs.matrix.projection,
				null,
				{ name:"fsTexCoord", dataType:"vec2", role:"out" }
			]);
			
			if (bg.Engine.Get().id=="webgl1") {
				s_vertexSource.setMainBody(`
				gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
				fsTexCoord = inTex0;
				`);
			}
		}
		return s_vertexSource;
	}
	
	function fragmentShaderSource() {
		if (!s_fragmentSource) {
			s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
			
			s_fragmentSource.addParameter([
				lib().inputs.material.castShadows,
				lib().inputs.material.texture,
				lib().inputs.material.textureOffset,
				lib().inputs.material.textureScale,
				lib().inputs.material.alphaCutoff,
				null,
				{ name:"fsTexCoord", dataType:"vec2", role:"in" }
			]);
			
			s_fragmentSource.addFunction(lib().functions.utils.pack);
			s_fragmentSource.addFunction(lib().functions.materials.samplerColor);
			
			if (bg.Engine.Get().id=="webgl1") {
				s_fragmentSource.setMainBody(`
				
				float alpha = samplerColor(inTexture,fsTexCoord,inTextureOffset,inTextureScale).a;
				if (inCastShadows && alpha>inAlphaCutoff) {
					gl_FragColor = pack(gl_FragCoord.z);
				}
				else {
					discard;
				}`);
			}
		}
		return s_fragmentSource;
	}
	
	class ShadowMapEffect extends bg.base.Effect {
		constructor(context) {
			super(context);
			
			this._material = null;
			this._light = null;
			this._lightTransform = null;
			
			this.setupShaderSource([
				vertexShaderSource(),
				fragmentShaderSource()
			]);

			this._offset = new bg.Vector2(0);
		}
		
		get material() { return this._material; }
		set material(m) { this._material = m; }
		
		get light() { return this._light; }
		set light(l) { this._light = l; }
		
		get lightTransform() { return this._lightTransform; }
		set lightTransform(t) { this._lightTransform = t; }
		
		setupVars() {
			if (this.material && this.light && this.lightTransform) {
				let matrixState = bg.base.MatrixState.Current();
				this.shader.setMatrix4("inModelMatrix",matrixState.modelMatrixStack.matrixConst);
				this.shader.setMatrix4("inViewMatrix",this.lightTransform);
				this.shader.setMatrix4("inProjectionMatrix",this.light.projection);
				
				if (this.material instanceof bg.base.Material) {
					this.shader.setValueInt("inCastShadows",this.material.castShadows);
					let texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
					this.shader.setTexture("inTexture",texture,bg.base.TextureUnit.TEXTURE_0);
					this.shader.setVector2("inTextureOffset",this.material.diffuseOffset || this.material.textureOffset);
					this.shader.setVector2("inTextureScale",this.material.diffuseScale || this.material.textureScale);
					this.shader.setValueFloat("inAlphaCutoff",this.material.alphaCutoff);
				}
				else if (this.material instanceof bg.base.PBRMaterial) {
					this.shader.setValueInt("inCastShadows",this.material.castShadows);
					this.shader.setTexture("inTexture",this.material.getShaderParameters(this.context).diffuse.map,bg.base.TextureUnit.TEXTURE_0);
					this.shader.setVector2("inTextureOffset",this._offset);
					this.shader.setVector2("inTextureScale",this.material.diffuseScale || this.material.textureScale);
					this.shader.setValueFloat("inAlphaCutoff",this.material.alphaCutoff);
				}
			}
		}
	}
	
	bg.base.ShadowMapEffect = ShadowMapEffect;
	
	bg.base.ShadowType = {
		HARD: 0,
		SOFT: 1,
		STRATIFIED: 2
	};

	bg.base.ShadowCascade = {
		NEAR: 0,
		FAR: 1,
		MID: 2
	}

	function updateDirectional(scene,camera,light,lightTransform,cascade) {
		let ms = bg.base.MatrixState.Current();
		bg.base.MatrixState.SetCurrent(this._matrixState);
		this._pipeline.effect.light = light;
		this._viewMatrix = new bg.Matrix4(lightTransform);

		let rotation = this._viewMatrix.rotation;
		let cameraTransform = camera.transform ? new bg.Matrix4(camera.transform.matrix) : bg.Matrix4.Identity();
		let cameraPos = cameraTransform.position;
		let target = cameraPos.add(cameraTransform.forwardVector.scale(-camera.focus))
		
		this._viewMatrix
			.identity()
			.translate(target)
			.mult(rotation)
			.translate(0,0,10)
			.invert();

		this._pipeline.effect.lightTransform = this._viewMatrix;
					
		bg.base.Pipeline.SetCurrent(this._pipeline);
		this._pipeline.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);

		let mult = 1;
		// Far cascade
		if (cascade==bg.base.ShadowCascade.FAR) {
			mult = 20;
			light.shadowBias = 0.0001;
		}
		// Near cascade
		else if (cascade==bg.base.ShadowCascade.NEAR) {
			mult = 2;
			light.shadowBias = 0.00002;
		}
		else if (cascade==bg.base.ShadowCascade.MID) {
			mult = 4;
			light.shadowBias = 0.0001;
		}
		light.projection = bg.Matrix4.Ortho(-camera.focus * mult ,camera.focus * mult,-camera.focus * mult,camera.focus * mult,1,300*camera.focus);
		this._projection = light.projection;
		scene.accept(this._drawVisitor);

		bg.base.MatrixState.SetCurrent(ms);
	}

	function updateSpot(scene,camera,light,lightTransform) {
		let ms = bg.base.MatrixState.Current();
		bg.base.MatrixState.SetCurrent(this._matrixState);
		this._pipeline.effect.light = light;
		this._viewMatrix = new bg.Matrix4(lightTransform);

		let cutoff = light.spotCutoff;
		light.projection = bg.Matrix4.Perspective(cutoff * 2,1,0.1,200.0);
		light.shadowBias = 0.0005;
		this._viewMatrix.invert();

		this._projection = light.projection;
		this._pipeline.effect.lightTransform = this._viewMatrix;
					
		bg.base.Pipeline.SetCurrent(this._pipeline);
		this._pipeline.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);
		
		scene.accept(this._drawVisitor);
		bg.base.MatrixState.SetCurrent(ms);
	}

	class ShadowMap extends bg.app.ContextObject {
		constructor(context) {
			super(context);
			
			this._pipeline = new bg.base.Pipeline(context);
			this._pipeline.renderSurface = new bg.base.TextureSurface(context);
			this._pipeline.renderSurface.create();
			this._pipeline.effect = new bg.base.ShadowMapEffect(context);
		
			this._matrixState = new bg.base.MatrixState();
			this._drawVisitor = new bg.scene.DrawVisitor(this._pipeline,this._matrixState);
			
			this._shadowMapSize = new bg.Vector2(2048);
			this._pipeline.viewport = new bg.Viewport(0,0,this._shadowMapSize.width,this._shadowMapSize.height);
			
			this._shadowType = bg.base.ShadowType.SOFT;
			
			this._projection = bg.Matrix4.Ortho(-15,15,-15,15,1,50);
			this._viewMatrix = bg.Matrix4.Identity();
			
			this._shadowColor = bg.Color.Black();
		}
		
		get size() { return this._shadowMapSize; }
		set size(s) {
			this._shadowMapSize = s;
			this._pipeline.viewport = new bg.Viewport(0,0,s.width,s.height);
		}
		
		get shadowType() { return this._shadowType; }
		set shadowType(t) { this._shadowType = t; }
		
		get shadowColor() { return this._shadowColor; }
		set shadowColor(c) { this._shadowColor = c; }
		
		get viewMatrix() { return this._viewMatrix; }
		get projection() { return this._projection; }
		
		get texture() { return this._pipeline.renderSurface.getTexture(0); }
		
		// it's important that the camera has set the focus to calculate the projection of the directional lights
		update(scene,camera,light,lightTransform,cascade=bg.base.ShadowCascade.NEAR) {
			if (light.type==bg.base.LightType.DIRECTIONAL) {
				updateDirectional.apply(this,[scene,camera,light,lightTransform,cascade]);
			}
			else if (light.type==bg.base.LightType.SPOT) {
				updateSpot.apply(this,[scene,camera,light,lightTransform]);
			}
		}
	}
	
	bg.base.ShadowMap = ShadowMap;
	
})();