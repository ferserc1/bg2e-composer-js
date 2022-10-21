(function() {
	class Effect extends bg.app.ContextObject {
		constructor(context) {
			super(context);
			this._shader = null;
			this._inputVars = [];
			this._shaders = [];
		}
		
		/*
		 * Override the following functions to create a custom effect:
		 * 	get inputVars(): returns an object with the input attribute for each
		 * 					 vertex buffer in the shader
		 *  get shader(): 	 create and initialize the shader if not exists
		 *  setupVars():	 bind the input vars in the shader
		 */
		get inputVars() {
			// Return the corresponding names for input vars
			//this._inputVars = {
			//	vertex:null,
			//	normal:null,
			//	tex0:null,
			//	tex1:null,
			//	tex2:null,
			//	color:null,
			//	tangent:null
			//};
			
			return this._inputVars;
		}

		get numberOfShaders() {
			return this._shaders.length;
		}

		setCurrentShader(i) {
			this._shader = this._shaders[i];
		}
		
		get shader() {
			// Create and initialize the shader if not exists.
			return this._shader;
		}
		
		// Automatic method: with ShaderSource objects it isn't necesary to
		// overrdide the previous functions
		setupShaderSource(sourceArray,append=true) {
			let shaderIndex = append ? this._shaders.length : 0;
			let shader = new bg.base.Shader(this.context);
			this._inputVars = [];
			let inputAttribs = [];
			let inputVars = [];
			
			sourceArray.forEach((source) => {
				source.params.forEach((param) => {
					if (param) {
						if (param.role=="buffer") {
							this._inputVars[param.target] = param.name;
							inputAttribs.push(param.name);
						}
						else if (param.role=="value") {
							inputVars.push(param.name);
						}
					}
				});
				
				shader.addShaderSource(source.type,source.toString());
			});
			shader.link();
			if (!shader.status) {
				bg.log(shader.compileError);
				if (shader.compileErrorSource) {
					bg.log("Shader source:");
					bg.log(shader.compileErrorSource);
				}
				bg.log(shader.linkError);
			}
			else {
				shader.initVars(inputAttribs,inputVars);
			}

			if (append) {
				this._shaders.push(shader);
				if (!this._shader) {
					this._shader = shader;
				}
			}
			else {
				this._shaders = [shader];
				this._shader = shader;
			}
			return shaderIndex;
		}
		
		// This function is used to setup shader variables that are the same for all
		// scene object, such as lights or color correction
		beginDraw() {
			
		}
		
		// This function is called before draw each polyList. The material properties will be
		// set in this.material
		setupVars() {
			// pass the input vars values to this.shader
		}
		
		setActive() {
			this.shader.setActive();
			this.beginDraw();
		}
		
		clearActive() {
			this.shader.clearActive();
		}
		
		bindPolyList(plist) {
			var s = this.shader;
			if (this.inputVars.vertex) {
				s.setInputBuffer(this.inputVars.vertex, plist.vertexBuffer, 3);
			}
			if (this.inputVars.normal) {
				s.setInputBuffer(this.inputVars.normal, plist.normalBuffer, 3);
			}
			if (this.inputVars.tex0) {
				s.setInputBuffer(this.inputVars.tex0, plist.texCoord0Buffer, 2);
			}
			if (this.inputVars.tex1) {
				s.setInputBuffer(this.inputVars.tex1, plist.texCoord1Buffer, 2);
			}
			if (this.inputVars.tex2) {
				s.setInputBuffer(this.inputVars.tex2, plist.texCoord2Buffer, 2);
			}
			if (this.inputVars.color) {
				s.setInputBuffer(this.inputVars.color, plist.colorBuffer, 4);
			}
			if (this.inputVars.tangent) {
				s.setInputBuffer(this.inputVars.tangent, plist.tangentBuffer, 3);
			}
			this.setupVars();
		}
		
		unbind() {
			var s = this.shader;	
			if (this.inputVars.vertex) {
				s.disableInputBuffer(this.inputVars.vertex);
			}
			if (this.inputVars.normal) {
				s.disableInputBuffer(this.inputVars.normal);
			}
			if (this.inputVars.tex0) {
				s.disableInputBuffer(this.inputVars.tex0);
			}
			if (this.inputVars.tex1) {
				s.disableInputBuffer(this.inputVars.tex1);
			}
			if (this.inputVars.tex2) {
				s.disableInputBuffer(this.inputVars.tex2);
			}
			if (this.inputVars.color) {
				s.disableInputBuffer(this.inputVars.color);
			}
			if (this.inputVars.tangent) {
				s.disableInputBuffer(this.inputVars.tangent);
			}
		}		
	}
	
	bg.base.Effect = Effect;
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}
	
	class TextureEffect extends Effect {
		constructor(context) {
			super(context);

			this._frame = new bg.base.PolyList(context);
			
			this._frame.vertex = [ 1, 1, 0, -1, 1, 0, -1,-1, 0,1,-1, 0 ];
			this._frame.texCoord0 = [ 1, 1, 0, 1, 0, 0, 1, 0 ];
			this._frame.index = [ 0, 1, 2,  2, 3, 0 ];
			
			this._frame.build();
			
			this.rebuildShaders();
		}

		rebuildShaders() {
			this.setupShaderSource([
				this.vertexShaderSource,
				this.fragmentShaderSource
			]);
		}
		
		get vertexShaderSource() {
			if (!this._vertexShaderSource) {
				this._vertexShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
				this._vertexShaderSource.addParameter([
					lib().inputs.buffers.vertex,
					lib().inputs.buffers.tex0,
					{ name:"fsTexCoord", dataType:"vec2", role:"out" }
				]);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._vertexShaderSource.setMainBody(`
					gl_Position = vec4(inVertex,1.0);
					fsTexCoord = inTex0;`);
				}
			}
			return this._vertexShaderSource;
		}
		
		get fragmentShaderSource() {
			if (!this._fragmentShaderSource) {
				this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
				this._fragmentShaderSource.addParameter(
					{ name:"fsTexCoord", dataType:"vec2", role:"in" }
				);
				
				if (bg.Engine.Get().id=="webgl1") {
					this._fragmentShaderSource.setMainBody(`
					gl_FragColor = vec4(0.0,0.0,0.0,1.0);`);
				}
			}
			return this._fragmentShaderSource;
		}
		
		//setupVars() {
		// this._surface contains the surface passed to drawSurface
		//}

		drawSurface(surface) {
			this.setActive();
			this._surface = surface;
			this.bindPolyList(this._frame);
			this._frame.draw();
			this.unbind();
			this.clearActive();
		}
		
	}
	
	bg.base.TextureEffect = TextureEffect;
	
})();