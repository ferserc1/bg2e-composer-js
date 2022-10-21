(function() {
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}

	class DrawTextureEffect extends bg.base.TextureEffect {
		constructor(context) {
			super(context);
			
			let vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
			let fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
			vertex.addParameter([
				lib().inputs.buffers.vertex,
				lib().inputs.buffers.tex0,
				{ name:"fsTexCoord", dataType:"vec2", role:"out" }
			]);
			
			fragment.addParameter([
				lib().inputs.material.texture,
				{ name:"fsTexCoord", dataType:"vec2", role:"in" }
			]);
			
			if (bg.Engine.Get().id=="webgl1") {
				vertex.setMainBody(`
				gl_Position = vec4(inVertex,1.0);
				fsTexCoord = inTex0;`);
				fragment.setMainBody("gl_FragColor = texture2D(inTexture,fsTexCoord);");
			}
			
			this.setupShaderSource([
				vertex,
				fragment
			], false);
		}
		
		setupVars() {
			let texture = null;
			if (this._surface instanceof bg.base.Texture) {
				texture = this._surface;
			}
			else if (this._surface instanceof bg.base.RenderSurface) {
				texture = this._surface.getTexture(0);
			}
			
			if (texture) {
				this.shader.setTexture("inTexture",texture,bg.base.TextureUnit.TEXTURE_0);
			}
		}
	}
	
	bg.base.DrawTextureEffect = DrawTextureEffect;
})();