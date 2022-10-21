
(function() {
	class MatrixStack {
		constructor() {
			this._matrix = bg.Matrix4.Identity();
			this._stack = [];
			this._changed = true;
		}
		
		get changed() { return this._changed; }
		set changed(c) { this._changed = c; }
		
		push() {
			this._stack.push(new bg.Matrix4(this._matrix));
		}
		
		set(m) {
			this._matrix.assign(m);
			this._changed = true;
			return this;
		}
		
		mult(m) {
			this._matrix.mult(m);
			this._changed = true;
			return this;
		}
		
		identity() {
			this._matrix.identity();
			this._changed = true;
			return this;
		}
		
		translate(x, y, z) {
			this._matrix.translate(x, y, z);
			this._changed = true;
			return this;
		}
		
		rotate(alpha, x, y, z) {
			this._matrix.rotate(alpha, x, y, z);
			this._changed = true;
			return this;
		}
		
		scale(x, y, z) {
			this._matrix.scale(x, y, z);
			this._changed = true;
			return this;
		}

		setScale(x, y, z) {
			this._matrix.setScale(x,y,z);
			this._changed = true;
			return this;
		}
		
		perspective(fov,aspect,near,far) {
			this._matrix
				.identity()
				.perspective(fov,aspect,near,far);
			this._changed = true;
			return this;
		}
		
		frustum(left, right, bottom, top, nearPlane, farPlane) {
			this._matrix
				.identity()
				.frustum(left,right,bottom,top,nearPlane,farPlane);
			this._changed = true;
			return this;
		}

		ortho(left, right, bottom, top, nearPlane, farPlane) {
			this._matrix
				.identity()
				.ortho(left,right,bottom,top,nearPlane,farPlane);
			this._changed = true;
			return this;
		}
		
		invert() {
			this._matrix.invert();
			this._changed = true;
			return this;
		}
		
		get matrix() {
			this._changed = true;
			return this._matrix;
		}
		
		// This accessor will return the current matrix without mark the internal state
		// to changed. There isn't any way in JavaScript to ensure that the returned matrix
		// will not be changed, therefore use this accessor carefully. It's recommended to use this
		// accessor ONLY to retrieve the matrix and pass it to the shaders. 
		get matrixConst() {
			return this._matrix;
		}
		
		pop() {
			if (this._stack.length) {
				this._matrix.assign(this._stack.pop());
				this._changed = true;
			}
			return this._matrix;
		}
	}
	
	bg.base.MatrixStack = MatrixStack;
	
	let s_MatrixState = null;
	
	class MatrixState {
		static Current() {
			if (!s_MatrixState) {
				s_MatrixState = new MatrixState();
			}
			return s_MatrixState;
		}
		
		static SetCurrent(s) {
			s_MatrixState = s;
			return s_MatrixState;
		}
		
		constructor() {
			// Matrixes
			this._modelMatrixStack = new MatrixStack();
			this._viewMatrixStack = new MatrixStack();
			this._projectionMatrixStack = new MatrixStack();
			this._modelViewMatrix = bg.Matrix4.Identity();
			this._normalMatrix = bg.Matrix4.Identity();
			this._cameraDistanceScale = null;
		}
		
		get modelMatrixStack() {
			return this._modelMatrixStack;
		}
		
		get viewMatrixStack() {
			return this._viewMatrixStack;
		}
		
		get projectionMatrixStack() {
			return this._projectionMatrixStack;
		}
		
		get modelViewMatrix() {
			if (!this._modelViewMatrix || this._modelMatrixStack.changed || this._viewMatrixStack.changed) {
				this._modelViewMatrix = new bg.Matrix4(this._viewMatrixStack._matrix);
				this._modelViewMatrix.mult(this._modelMatrixStack._matrix);
				this._modelMatrixStack.changed = false;
				this._viewMatrixStack.changed = false;
			}
			return this._modelViewMatrix;
		}
		
		get normalMatrix() {
			if (!this._normalMatrix || this._modelMatrixStack.changed || this._viewMatrixStack.changed) {
				this._normalMatrix = new bg.Matrix4(this.modelViewMatrix);
				this._normalMatrix.invert();
				this._normalMatrix.traspose();
				this._modelMatrixStack.changed = false;
			}
			return this._normalMatrix;
		}
		
		get viewMatrixInvert() {
			if (!this._viewMatrixInvert || this._viewMatrixStack.changed) {
				this._viewMatrixInvert = new bg.Matrix4(this.viewMatrixStack.matrixConst);
				this._viewMatrixInvert.invert();
			}
			return this._viewMatrixInvert;
		}

		// This function returns a number that represents the
		// distance from the camera to the model.
		get cameraDistanceScale() {
			return this._cameraDistanceScale = this._viewMatrixStack.matrix.position.magnitude();
		}
	}
	
	bg.base.MatrixState = MatrixState;
})();