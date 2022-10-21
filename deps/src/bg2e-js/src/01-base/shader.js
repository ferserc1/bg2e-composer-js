(function() {
	
	class ShaderImpl {
		constructor(context) {
			this.initFlags(context);
		}
		
		initFlags(context) {}
		setActive(context,shaderProgram) {}
		create(context) {}
		addShaderSource(context,shaderProgram,shaderType,source) {}
		link(context,shaderProgram) {}
		initVars(context,shader,inputBufferVars,valueVars) {}
		setInputBuffer(context,shader,varName,vertexBuffer,itemSize) {}
		setValueInt(context,shader,name,v) {}
		setValueIntPtr(context,shader,name,v) {}
		setValueFloat(context,shader,name,v) {}
		setValueFloatPtr(context,shader,name,v) {}
		setValueVector2(context,shader,name,v) {}
		setValueVector3(context,shader,name,v) {}
		setValueVector4(context,shader,name,v) {}
		setValueVector2v(context,shader,name,v) {}
		setValueVector3v(context,shader,name,v) {}
		setValueVector4v(context,shader,name,v) {}
		setValueMatrix3(context,shader,name,traspose,v) {}
		setValueMatrix4(context,shader,name,traspose,v) {}
		setTexture(context,shader,name,texture,textureUnit) {}
	}
	
	bg.base.ShaderImpl = ShaderImpl;
	
	bg.base.ShaderType = {
		VERTEX: null,
		FRAGMENT: null
	};

	function addLineNumbers(source) {
		let result = "";
		source.split("\n").forEach((line,index) => {
			++index;
			let prefix = index<10 ? "00":index<100 ? "0":"";
			result += prefix + index + " | " + line + "\n";
		});
		return result;
	}

	let g_activeShader = null;
	
	class Shader extends bg.app.ContextObject {
		static ClearActive(context) { bg.Engine.Get().shader.setActive(context,null); }
		static GetActiveShader() {
			return g_activeShader;
		}

		constructor(context) {
			super(context);
			
			this._shader = bg.Engine.Get().shader.create(context);
			this._linked = false;
			
			this._compileError = null;
			this._linkError = null;
		}
		
		get shader() { return this._shader; }
		get compileError() { return this._compileError; }
		get compileErrorSource() { return this._compileErrorSource; }
		get linkError() { return this._linkError; }
		get status() { return this._compileError==null && this._linkError==null; }
		
		addShaderSource(shaderType, shaderSource) {
			if (this._linked) {
				this._compileError = "Tying to attach a shader to a linked program";
			}
			else if (!this._compileError) {
				this._compileError = bg.Engine.Get().shader.addShaderSource(
																this.context,
																this._shader,
																shaderType,shaderSource);
				if (this._compileError) {
					this._compileErrorSource = addLineNumbers(shaderSource);
				}
			}
			return this._compileError==null;
		}
		
		link() {
			this._linkError = null;
			if (this._linked) {
				this._linkError = "Shader already linked";
			}
			else  {
				this._linkError = bg.Engine.Get().shader.link(this.context,this._shader);
				this._linked = this._linkError==null;
			}
			return this._linked;
		}
		
		setActive() {
			bg.Engine.Get().shader.setActive(this.context,this._shader);
			g_activeShader = this;
		}
		
		clearActive() {
			Shader.ClearActive(this.context);
			g_activeShader = null;
		}
		
		initVars(inputBufferVars,valueVars) {
			bg.Engine.Get().shader.initVars(this.context,this._shader,inputBufferVars,valueVars);
		}
		
		setInputBuffer(name,vbo,itemSize) {
			bg.Engine.Get().shader
				.setInputBuffer(this.context,this._shader,name,vbo,itemSize);
		}
		
		disableInputBuffer(name) {
			bg.Engine.Get().shader
				.disableInputBuffer(this.context,this._shader,name);
		}
		
		setValueInt(name,v) {
			bg.Engine.Get().shader
				.setValueInt(this.context,this._shader,name,v);
		}

		setValueIntPtr(name,v) {
			bg.Engine.Get().shader
				.setValueIntPtr(this.context,this._shader,name,v);
		}
		
		setValueFloat(name,v) {
			bg.Engine.Get().shader
				.setValueFloat(this.context,this._shader,name,v);
		}

		setValueFloatPtr(name,v) {
			bg.Engine.Get().shader
				.setValueFloatPtr(this.context,this._shader,name,v);
		}
		
		setVector2(name,v) {
			bg.Engine.Get().shader
				.setValueVector2(this.context,this._shader,name,v);
		}
		
		setVector3(name,v) {
			bg.Engine.Get().shader
				.setValueVector3(this.context,this._shader,name,v);			
		}
		
		setVector4(name,v) {
			bg.Engine.Get().shader
				.setValueVector4(this.context,this._shader,name,v);
		}

		setVector2Ptr(name,v) {
			bg.Engine.Get().shader
				.setValueVector2v(this.context,this._shader,name,v);
		}
		
		setVector3Ptr(name,v) {
			bg.Engine.Get().shader
				.setValueVector3v(this.context,this._shader,name,v);			
		}
		
		setVector4Ptr(name,v) {
			bg.Engine.Get().shader
				.setValueVector4v(this.context,this._shader,name,v);
		}
		
		setMatrix3(name,v,traspose=false) {
			bg.Engine.Get().shader
				.setValueMatrix3(this.context,this._shader,name,traspose,v);
		}
		
		setMatrix4(name,v,traspose=false) {
			bg.Engine.Get().shader
				.setValueMatrix4(this.context,this._shader,name,traspose,v);
		}
		
		setTexture(name,texture,textureUnit) {
			bg.Engine.Get().shader
				.setTexture(this.context,this._shader,name,texture,textureUnit);
		}

		
		destroy() {
			console.warn("TODO: Shader.destroy(): not implemented.");
		}
	}
	
	bg.base.Shader = Shader;
})();