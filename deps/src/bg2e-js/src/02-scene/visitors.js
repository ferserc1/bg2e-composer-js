(function() {
	
	class DrawVisitor extends bg.scene.NodeVisitor {
		constructor(pipeline,matrixState) {
			super();
			this._pipeline = pipeline || bg.base.Pipeline.Current();
			this._matrixState = matrixState || bg.base.MatrixState.Current();
			this._forceDraw = false;
		}

		get forceDraw() { return this._forceDraw; }
		set forceDraw(f) { this._forceDraw = f; }
		
		get pipeline() { return this._pipeline; }
		get matrixState() { return this._matrixState; }
		
		visit(node) {
			node.willDisplay(this.pipeline,this.matrixState);
			node.display(this.pipeline,this.matrixState,this.forceDraw);
		}
		
		didVisit(node) {
			node.didDisplay(this.pipeline,this.matrixState);
		}
	}
	
	bg.scene.DrawVisitor = DrawVisitor;

	class RenderQueueVisitor extends bg.scene.NodeVisitor {
		constructor(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			super();
			this._modelMatrixStack = modelMatrixStack || new bg.base.MatrixStack();
			this._viewMatrixStack = viewMatrixStack || new bg.base.MatrixStack();
			this._projectionMatrixStack = projectionMatrixStack || new bg.base.MatrixStack();
			this._renderQueue = new bg.base.RenderQueue();
		}

		get modelMatrixStack() { return this._modelMatrixStack; }
		set modelMatrixStack(m) { this._modelMatrixStack = m; }

		get viewMatrixStack() { return this._viewMatrixStack; }
		set viewMatrixStack(m) { this._viewMatrixStack = m; }

		get projectionMatrixStack() { return this._projectionMatrixStack }
		set projectionMatrixStack(m) { this._projectionMatrixStack = m; }

		get renderQueue() { return this._renderQueue; }

		visit(node) {
			node.willUpdate(this._modelMatrixStack);
			node.draw(this._renderQueue,this._modelMatrixStack, this._viewMatrixStack, this._projectionMatrixStack);
		}

		didVisit(node) {
			node.didUpdate(this._modelMatrixStack, this._viewMatrixStack, this._projectionMatrixStack);
		}
	}

	bg.scene.RenderQueueVisitor = RenderQueueVisitor;
	
	class FrameVisitor extends bg.scene.NodeVisitor {
		constructor() {
			super();
			this._delta = 0;
		}
		
		get delta() { return this._delta; }
		set delta(d) { this._delta = d; }

		visit(node) {
			node.frame(this.delta);
		}
	}
	
	bg.scene.FrameVisitor = FrameVisitor;
	
	class TransformVisitor extends bg.scene.NodeVisitor {
		constructor() {
			super();
			this._matrix = bg.Matrix4.Identity();
		}
		
		get matrix() { return this._matrix; }
		
		clear() {
			this._matrix = bg.Matrix4.Identity();
		}

		visit(node) {
			let trx = node.component("bg.scene.Transform");
			if (trx) {
				this._matrix.mult(trx.matrix);
			}
		}
	}
	
	bg.scene.TransformVisitor = TransformVisitor;
	
	class InputVisitor extends bg.scene.NodeVisitor {
		
		visit(node) {
			if (this._operation) {
				node[this._operation](this._event);
			}
		}
		
		keyDown(scene,evt) {
			this._operation = "keyDown";
			this._event = evt;
			scene.accept(this);
		}
		
		keyUp(scene,evt) {
			this._operation = "keyUp";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseUp(scene,evt) {
			this._operation = "mouseUp";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseDown(scene,evt) {
			this._operation = "mouseDown";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseMove(scene,evt) {
			this._operation = "mouseMove";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseOut(scene,evt) {
			this._operation = "mouseOut";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseDrag(scene,evt) {
			this._operation = "mouseDrag";
			this._event = evt;
			scene.accept(this);
		}
		
		mouseWheel(scene,evt) {
			this._operation = "mouseWheel";
			this._event = evt;
			scene.accept(this);
		}
		
		touchStart(scene,evt) {
			this._operation = "touchStart";
			this._event = evt;
			scene.accept(this);
		}
		
		touchMove(scene,evt) {
			this._operation = "touchMove";
			this._event = evt;
			scene.accept(this);
		}
		
		touchEnd(scene,evt) {
			this._operation = "touchEnd";
			this._event = evt;
			scene.accept(this);
		}
	}
	
	bg.scene.InputVisitor = InputVisitor;

	class BoundingBoxVisitor extends bg.scene.NodeVisitor {
		constructor() {
			super();
			this.clear();
		}

		get min() {
			return this._min;
		}

		get max() {
			return this._max;
		}

		get size() {
			return this._size;
		}

		clear() {
			// left, right, bottom, top, back, front
			this._min = new bg.Vector3(bg.Math.FLOAT_MAX,bg.Math.FLOAT_MAX,bg.Math.FLOAT_MAX);
			this._max = new bg.Vector3(-bg.Math.FLOAT_MAX,-bg.Math.FLOAT_MAX,-bg.Math.FLOAT_MAX);
			this._size = new bg.Vector3(0,0,0);
		}

		visit(node) {
			let trx = bg.Matrix4.Identity();
			if (node.component("bg.scene.Transform")) {
				trx = node.component("bg.scene.Transform").globalMatrix;
			}
			if (node.component("bg.scene.Drawable")) {
				let bb = new bg.tools.BoundingBox(node.component("bg.scene.Drawable"),new bg.Matrix4(trx));
				this._min = bg.Vector.MinComponents(this._min,bb.min);
				this._max = bg.Vector.MaxComponents(this._max,bb.max);
				this._size = bg.Vector3.Sub(this._max, this._min);
			}
		}
	}

	bg.scene.BoundingBoxVisitor = BoundingBoxVisitor;


	class FindComponentVisitor extends bg.scene.NodeVisitor {
		constructor(componentId) {
			super();
			this.componentId = componentId;
			this.clear();
		}

		get result() {
			return this._result;
		}

		clear() {
			this._result = [];
		}

		visit(node) {
			if (node.component(this.componentId)) {
				this._result.push(node);
			}
		}
	}

	bg.scene.FindComponentVisitor = FindComponentVisitor;
})();