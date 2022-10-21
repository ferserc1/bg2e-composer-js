(function() {
	
	class ProjectionStrategy extends bg.MatrixStrategy {
		static Factory(jsonData) {
			let result = null;
			if (jsonData) {
				if (jsonData.type=="PerspectiveProjectionMethod") {
					result = new PerspectiveProjectionStrategy();
				}
				else if (jsonData.type=="OpticalProjectionMethod") {
					result = new OpticalProjectionStrategy();
				}
				else if (jsonData.type=="OrthographicProjectionStrategy") {
					result = new OrthographicProjectionStrategy();
				}

				if (result) {
					result.deserialize(jsonData);
				}
			}
			return result;
		}

		constructor(target) {
			super(target);

			this._near = 0.1;
			this._far = 100.0;
			this._viewport = new bg.Viewport(0,0,512,512);
		}

		clone() { console.log("WARNING: ProjectionStrategy::clone() method not implemented by child class."); }

		get near() { return this._near; }
		set near(n) { this._near = n; }
		get far() { return this._far; }
		set far(f) { this._far = f; }
		get viewport() { return this._viewport; }
		set viewport(vp) { this._viewport = vp; }

		get fov() { return 0; }

		serialize(jsonData) {
			jsonData.near = this.near;
			jsonData.far = this.far;
		}
	}

	bg.scene.ProjectionStrategy = ProjectionStrategy;

	class PerspectiveProjectionStrategy extends ProjectionStrategy {
		constructor(target) {
			super(target);
			this._fov = 60;
		}

		clone() {
			let result = new PerspectiveProjectionStrategy();
			result.near = this.near;
			result.far = this.far;
			result.viewport = this.viewport;
			result.fov = this.fov;
			return result;
		}

		get fov() { return this._fov; }
		set fov(f) { this._fov = f; }

		apply() {
			if (this.target) {
				this.target.perspective(this.fov, this.viewport.aspectRatio, this.near, this.far);
			}
		}

		deserialize(jsonData) {
			this.near = jsonData.near;
			this.far = jsonData.far;
			this.fov = jsonData.fov;
		}

		serialize(jsonData) {
			jsonData.type = "PerspectiveProjectionMethod";
			jsonData.fov = this.fov;
			super.serialize(jsonData);
		}
	}

	bg.scene.PerspectiveProjectionStrategy = PerspectiveProjectionStrategy;

	class OpticalProjectionStrategy extends ProjectionStrategy {
		constructor(target) {
			super(target);
			this._focalLength = 50;
			this._frameSize = 35;
		}

		clone() {
			let result = new OpticalProjectionStrategy();
			result.near = this.near;
			result.far = this.far;
			result.viewport = this.viewport;
			result.focalLength = this.focalLength;
			result.frameSize = this.frameSize;
			return result;
		}

		get focalLength() { return this._focalLength; }
		set focalLength(fl) { this._focalLength = fl; }
		get frameSize() { return this._frameSize; }
		set frameSize(s) { this._frameSize = s; }

		get fov() {
			return 2 * bg.Math.atan(this.frameSize / (this.focalLength / 2));
		}

		apply() {
			if (this.target) {
				let fov = this.fov;
				fov = bg.Math.radiansToDegrees(fov);
				this.target.perspective(fov, this.viewport.aspectRatio, this.near, this.far);
			}
		}

		deserialize(jsonData) {
			this.frameSize = jsonData.frameSize;
			this.focalLength = jsonData.focalLength;
			this.near = jsonData.near;
			this.far = jsonData.far;
		}

		serialize(jsonData) {
			jsonData.type = "OpticalProjectionMethod";
			jsonData.frameSize = this.frameSize;
			jsonData.focalLength = this.focalLength;
			super.serialize(jsonData);
		}
	}

	bg.scene.OpticalProjectionStrategy = OpticalProjectionStrategy;

	class OrthographicProjectionStrategy extends ProjectionStrategy {
		constructor(target) {
			super(target);
			this._viewWidth = 100;
		}

		clone() {
			let result = new OrthographicProjectionStrategy();
			result.near = this.near;
			result.far = this.far;
			result.viewWidth = this.viewWidth;
			return result;
		}

		get viewWidth() { return this._viewWidth; }
		set viewWidth(w) { this._viewWidth = w; }

		apply() {
			if (this.target) {
				let ratio = this.viewport.aspectRatio;
				let height = this.viewWidth / ratio;
				let x = this.viewWidth / 2;
				let y = height / 2;
				this.target.ortho(-x, x, -y, y, -this._far, this._far);
			}
		}

		deserialize(jsonData) {
			this.viewWidth = jsonData.viewWidth;
			this.near = jsonData.near;
			this.far = jsonData.far;
		}

		serialize(jsonData) {
			jsonData.type = "OrthographicProjectionStrategy";
			jsonData.viewWidth = this.viewWidth;
			jsonData.near = this.near;
			jsonData.far = this.far;
			super.serialize(jsonData);
		}
	}

	bg.scene.OrthographicProjectionStrategy = OrthographicProjectionStrategy;

	function buildPlist(context,vertex,color) {
		let plist = new bg.base.PolyList(context);
		let normal = [];
		let texCoord0 = [];
		let index = [];
		let currentIndex = 0;
		for (let i=0; i<vertex.length; i+=3) {
			normal.push(0); normal.push(0); normal.push(1);
			texCoord0.push(0); texCoord0.push(0);
			index.push(currentIndex++);
		}
		plist.vertex = vertex;
		plist.normal = normal;
		plist.texCoord0 = texCoord0;
		plist.color = color;
		plist.index = index;
		plist.drawMode = bg.base.DrawMode.LINES;
		plist.build();
		return plist;
	}

	function getGizmo() {
		if (!this._gizmo) {
			let alpha = this.projectionStrategy ? this.projectionStrategy.fov : bg.Math.PI_4;
			alpha *= 0.5;
			let d = this.focus;
			let aspectRatio = bg.app.MainLoop.singleton.canvas.width / bg.app.MainLoop.singleton.canvas.height;
			let sx = bg.Math.sin(alpha) * d;
			let sy = (bg.Math.sin(alpha) * d) / aspectRatio;
			let vertex = [
				0, 0, 0, sx, sy, -d, 0, 0, 0, -sx, sy, -d, 0, 0, 0, sx,-sy, -d, 0, 0, 0, -sx,-sy, -d,

				sx,sy,-d, -sx,sy,-d, -sx,sy,-d, -sx,-sy,-d, -sx,-sy,-d, sx,-sy,-d, sx,-sy,-d, sx,sy,-d
			];
			let color = [
				1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
				1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1
			];
			this._gizmo = buildPlist(this.node.context,vertex,color);
		}
		return this._gizmo;
	}

	function clearMain(node) {
		if (node.camera) {
			node.camera.isMain = false;
		}
		node.children.forEach((child) => clearMain(child));
	}

	class Camera extends bg.scene.Component {

		static SetAsMainCamera(mainCamera,sceneRoot) {
			clearMain(sceneRoot);
			if (mainCamera instanceof Camera) {
				mainCamera.isMain = true;
			}
			else if (mainCamera instanceof bg.scene.Node && mainCamera.camera) {
				mainCamera.camera.isMain = true;
			}
			else {
				throw new Error("Error setting main camera: invalid camera node.");
			}
		}

		constructor() {
			super();
			
			this._projection = bg.Matrix4.Perspective(60,1,0.1,100.0);
			this._viewport = new bg.Viewport(0,0,512,512);
			
			this._visitor = new bg.scene.TransformVisitor();
			this._rebuildTransform = true;

			this._position = new bg.Vector3(0);
			this._rebuildPosition = true;
			
			this._clearBuffers = bg.base.ClearBuffers.COLOR_DEPTH;
			
			this._focus = 5;	// default 5 meters

			this._projectionStrategy = null;

			this._isMain = false;
		}
		
		clone() {
			let newCamera = new bg.scene.Camera();
			newCamera._projection = new bg.Matrix4(this._projection);
			newCamera._viewport = new bg.Matrix4(this._viewport);
			newCamera._projectionStrategy = this._projectionStrategy ? this._projectionStrategy.clone() : null;
			return newCamera;
		}
		
		get projection() { return this._projection; }
		set projection(p) {
			if (!this._projectionStrategy) {
				this._projection = p;
			}
		}
		
		get viewport() { return this._viewport; }
		set viewport(v) {
			this._viewport = v;
			if (this._projectionStrategy) {
				this._projectionStrategy.viewport = v;
				this._projectionStrategy.apply();
			}
		}
		
		get focus() { return this._focus; }
		set focus(f) { this._focus = f; this.recalculateGizmo() }

		get isMain() { return this._isMain; }
		set isMain(m) {
			this._isMain = m;
		}

		get projectionStrategy() { return this._projectionStrategy; }
		set projectionStrategy(ps) {
			this._projectionStrategy = ps;
			if (this._projectionStrategy) {
				this._projectionStrategy.target = this._projection;
			}
			this.recalculateGizmo()
		}
		
		get clearBuffers() { return this._clearBuffers; }
		set clearBuffers(c) { this._clearBuffers = c; }
		
		get modelMatrix() {
			if (this._rebuildTransform && this.node) {
				this._visitor.matrix.identity();
				this.node.acceptReverse(this._visitor);
				this._rebuildTransform = false;
			}
			return this._visitor.matrix;
		}
		
		get viewMatrix() {
			if (!this._viewMatrix || this._rebuildTransform) {
				this._viewMatrix = new bg.Matrix4(this.modelMatrix);
				this._viewMatrix.invert();
			}
			return this._viewMatrix;
		}

		get worldPosition() {
			if (this._rebuildPosition) {
				this._position = this.modelMatrix.multVector(new bg.Vector3(0)).xyz
				this._rebuildPosition = false;
				this._rebuildTransform = true;
			}
			return this._position;
		}

		recalculateGizmo() {
			if (this._gizmo) {
				this._gizmo.destroy();
				this._gizmo = null;
			}
		}
		
		frame(delta) {
			this._rebuildPosition = true;
			this._rebuildTransform = true;
		}

		displayGizmo(pipeline,matrixState) {
			if (this.isMain) return; // Do not render the main camera plist
			let plist = getGizmo.apply(this);
			if (plist) {
				pipeline.draw(plist);
			}
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			componentData.isMain = this.isMain;
			if (this.projectionStrategy) {
				let projMethod = {};
				componentData.projectionMethod = projMethod;
				this.projectionStrategy.serialize(projMethod);
			}
		}

		deserialize(context,sceneData,url) {
			sceneData.isMain = sceneData.isMain || false;
			this.projectionStrategy = ProjectionStrategy.Factory(sceneData.projectionMethod || {});
		}
	}
	
	bg.scene.registerComponent(bg.scene,Camera,"bg.scene.Camera");
})();