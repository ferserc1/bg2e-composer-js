(function() {
	let shaders = {};
	
	function lib() {
		return bg.base.ShaderLibrary.Get();
	}
	
	let s_vertexSource = null;
	let s_fragmentSource = null;
	
	function vertexShaderSource() {
		if (!s_vertexSource) {
			s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
			
			s_vertexSource.addParameter([
				lib().inputs.buffers.vertex
			]);
			
			s_vertexSource.addParameter(lib().inputs.matrix.all);
			
			if (bg.Engine.Get().id=="webgl1") {
				s_vertexSource.setMainBody(`
					gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
				`);
			}
		}
		return s_vertexSource;
	}
	
	function fragmentShaderSource() {
		if (!s_fragmentSource) {
			s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
		
			if (bg.Engine.Get().id=="webgl1") {	
				s_fragmentSource.setMainBody(`
					gl_FragColor = vec4(1.0,0.0,0.0,1.0);
				`);
			}
		}
		return s_fragmentSource;
	}
	
	class RedEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);			
			let sources = [
				vertexShaderSource(),
				fragmentShaderSource()
			];
			this.setupShaderSource(sources);
		}
		
		beginDraw() {
		}
		
		setupVars() {
			let matrixState = bg.base.MatrixState.Current();
			let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
			this.shader.setMatrix4('inModelMatrix',matrixState.modelMatrixStack.matrixConst);
			this.shader.setMatrix4('inViewMatrix',viewMatrix);
			this.shader.setMatrix4('inProjectionMatrix',matrixState.projectionMatrixStack.matrixConst);
		}
		
	}
	
	bg.base.RedEffect = RedEffect;
})();