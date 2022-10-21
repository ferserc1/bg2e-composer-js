(function() {

	let shader = {};
	
	function initShaders() {
		shader[bg.webgl1.EngineId] = {
			vertex: `
			attribute vec3 inVertex;
			
			uniform mat4 inModelMatrix;
			uniform mat4 inViewMatrix;
			uniform mat4 inProjectionMatrix;
			
			void main() {
				gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
			}
			`,
			
			fragment:`
			precision highp float;
			
			uniform vec4 inColorId;
			
			void main() {
				gl_FragColor = inColorId;
			}
			`
		};
	}
	
	class ColorPickEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);
			initShaders();
		}
		
		get inputVars() {
			return {
				vertex:'inVertex'
			}
		}
		
		set matrixState(m) { this._matrixState = m; }
		get matrixState() {
			return this._matrixState;
		}
		
		set pickId(p) { this._pickId = p; }
		get pickId() { return this._pickId || bg.Color.Transparent(); }
		
		get shader() {
			if (!this._shader) {
				this._shader = new bg.base.Shader(this.context);
				this._shader.addShaderSource(bg.base.ShaderType.VERTEX, shader[bg.webgl1.EngineId].vertex);
				this._shader.addShaderSource(bg.base.ShaderType.FRAGMENT, shader[bg.webgl1.EngineId].fragment);
				this._shader.link();
				if (!this._shader.status) {
					console.log(this._shader.compileError);
					console.log(this._shader.linkError);
				}
				else {
					this._shader.initVars([
						'inVertex'
					],[
						'inModelMatrix',
						'inViewMatrix',
						'inProjectionMatrix',
						'inColorId'
					]);
				}
			}
			return this._shader
		}
		
		setupVars() {
			this.shader.setMatrix4('inModelMatrix',this.matrixState.modelMatrixStack.matrixConst);
			this.shader.setMatrix4('inViewMatrix',new bg.Matrix4(this.matrixState.viewMatrixStack.matrixConst));
			this.shader.setMatrix4('inProjectionMatrix',this.matrixState.projectionMatrixStack.matrixConst);
			this.shader.setVector4('inColorId', this.pickId);
		}
		
	}
	
	bg.manipulation.ColorPickEffect = ColorPickEffect;

	class FindPickIdVisitor extends bg.scene.NodeVisitor {
		constructor(target) {
			super()
			this._target = target;
		}
		
		get target() { return this._target; }
		set target(t) { this._target = t; this._result = null; }
		
		get result() { return this._result; }
		
		visit(node) {
			let selectable = node.component("bg.manipulation.Selectable");
			let gizmo = node.component("bg.manipulation.Gizmo");
			if (gizmo && !gizmo.visible) {
				gizmo = null;
			}
			this._result = 	this._result ||
							(selectable && selectable.findId(this.target)) ||
							(gizmo && gizmo.findId(this.target));
		}
	}
	
	bg.manipulation.FindPickIdVisitor = FindPickIdVisitor;
	
	class MousePicker extends bg.app.ContextObject {
		
		constructor(context) {
			super(context);
		}
		
		get pipeline() {
			if (!this._pipeline) {
				this._pipeline = new bg.base.Pipeline(this.context);
				
				this._pipeline.effect = new ColorPickEffect(this.context);
				this._renderSurface = new bg.base.TextureSurface(this.context);
				this._renderSurface.create();
				this._pipeline.renderSurface = this._renderSurface;
				this._pipeline.clearColor = new bg.Color(0,0,0,0);
			}
			return this._pipeline;
		}
		
		get matrixState() {
			if (!this._matrixState) {
				this._matrixState = new bg.base.MatrixState();
			}
			return this._matrixState;
		}
		
		get drawVisitor() {
			if (!this._drawVisitor) {
				this._drawVisitor = new bg.scene.DrawVisitor(this.pipeline,this.matrixState);
			}
			return this._drawVisitor;
		}
		
		pick(sceneRoot,camera,mousePosition) {
			let restorePipeline = bg.base.Pipeline.Current();
			let restoreMatrixState = bg.base.MatrixState.Current();
			bg.base.Pipeline.SetCurrent(this.pipeline);
			bg.base.MatrixState.SetCurrent(this.matrixState);
			this.pipeline.viewport = camera.viewport;
			this.pipeline.effect.matrixState = this.matrixState;
			
			
			this.pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
			
			this.matrixState.projectionMatrixStack.set(camera.projection);
			this.matrixState.viewMatrixStack.set(camera.viewMatrix);										
			
			let opacityLayer = this.pipeline.opacityLayer;
			this.pipeline.opacityLayer = bg.base.OpacityLayer.SELECTION;
			sceneRoot.accept(this.drawVisitor);
			this.pipeline.opacityLayer = bg.base.OpacityLayer.GIZMOS_SELECTION;
			this.pipeline.clearBuffers(bg.base.ClearBuffers.DEPTH);
			sceneRoot.accept(this.drawVisitor);
			this.pipeline.opacityLayer = opacityLayer;
			
			let buffer = this.pipeline.renderSurface.readBuffer(new bg.Viewport(mousePosition.x, mousePosition.y,1,1));
			let pickId = {
				r: buffer[3],
				g: buffer[2],
				b: buffer[1],
				a: buffer[0]
			};
			
			let findIdVisitor = new FindPickIdVisitor(pickId);
			sceneRoot.accept(findIdVisitor);
			
			if (restorePipeline) {
				bg.base.Pipeline.SetCurrent(restorePipeline);
			}
			if (restoreMatrixState) {
				bg.base.MatrixState.SetCurrent(restoreMatrixState);
			}
	
			return findIdVisitor.result;
		}
	}
	
	bg.manipulation.MousePicker = MousePicker;
	
})();
