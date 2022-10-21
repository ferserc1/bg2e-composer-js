(function() {
	
	let Action = {
		ROTATE:0,
		PAN:1,
		ZOOM:2
	};
	
	function getOrbitAction(cameraCtrl) {
		let left = bg.app.Mouse.LeftButton(),
			middle = bg.app.Mouse.MiddleButton(),
			right = bg.app.Mouse.RightButton();
				
		switch (true) {
			case left==cameraCtrl._rotateButtons.left &&
				 middle==cameraCtrl._rotateButtons.middle &&
				 right==cameraCtrl._rotateButtons.right:
				 return Action.ROTATE;
			case left==cameraCtrl._panButtons.left &&
				 middle==cameraCtrl._panButtons.middle &&
				 right==cameraCtrl._panButtons.right:
				 return Action.PAN;
			case left==cameraCtrl._zoomButtons.left &&
				 middle==cameraCtrl._zoomButtons.middle &&
				 right==cameraCtrl._zoomButtons.right:
				 return Action.ZOOM;
		}
	}

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
		let x = this.minX;
		let X = this.maxX;
		let y = this.minY;
		let Y = this.maxY;
		let z = this.minZ;
		let Z = this.maxZ;
		let vertex = [
			x,y,z, X,y,z, X,y,z, X,Y,z, X,Y,z, x,Y,z, x,Y,z, x,y,z,	// back
			x,y,Z, X,y,Z, X,y,Z, X,Y,Z, X,Y,Z, x,Y,Z, x,Y,Z, x,y,Z,	// front
			x,y,z, x,y,Z,	// edge 1
			X,y,z, X,y,Z,	// edge 2
			X,Y,z, X,Y,Z,	// edge 3
			x,Y,z, x,Y,Z	// edge 4
		];
		let color = [];
		for (let i = 0; i<vertex.length; i+=3) {
			color.push(this._limitGizmoColor.r);
			color.push(this._limitGizmoColor.g);
			color.push(this._limitGizmoColor.b);
			color.push(this._limitGizmoColor.a);
		}
		if (!this._plist) {
			this._plist = buildPlist(this.node.context,vertex,color);
		}
		else {
			this._plist.updateBuffer(bg.base.BufferType.VERTEX,vertex);
			this._plist.updateBuffer(bg.base.BufferType.COLOR,color);
		}
		return this._plist;
	}
	
	class OrbitCameraController extends bg.scene.Component {
		static DisableAll(sceneRoot) {
			let ctrl = sceneRoot.component("bg.manipulation.OrbitCameraController");
			if (ctrl) {
				ctrl.enabled = false;
			}
			sceneRoot.children.forEach((ch) => OrbitCameraController.DisableAll(ch));
		}

		static SetUniqueEnabled(orbitCameraController,sceneRoot) {
			OrbitCameraController.DisableAll(sceneRoot);
			orbitCameraController.enabled = true;
		}

		constructor() {
			super();
			
			this._rotateButtons = { left:true, middle:false, right:false };
			this._panButtons = { left:false, middle:false, right:true };
			this._zoomButtons = { left:false, middle:true, right:false };
			
			this._rotation = new bg.Vector2();
			this._distance = 5;
			this._center = new bg.Vector3();
			this._rotationSpeed = 0.2;
			this._forward = 0;
			this._left = 0;
			this._wheelSpeed = 1;
			this._minFocus = 2;

			this._minPitch = 0.1;
			this._maxPitch = 85.0;
			this._minDistance = 0.4;
			this._maxDistance = 24.0;
			
			this._maxX = 15;
			this._minX = -15;
			this._minY = 0.1;
			this._maxY = 2.0;
			this._maxZ = 15;
			this._minZ = -15;

			this._displacementSpeed = 0.1;

			this._enabled = true;

			// Do not serialize/deserialize this:
			this._keys = {};
			this._showLimitGizmo = true;
			this._limitGizmoColor = bg.Color.Green();

			// This is used for orthographic projections
			this._viewWidth = 50;

			this._lastTouch = [];
		}

		clone() {
			let result = new OrbitCameraController();
			let compData = {};
			this.serialize(compData,[],"");
			result.deserialize(null,compData,"");
			return result;
		}
		
		setRotateButtons(left,middle,right) {
			this._rotateButtons = { left:left, middle:middle, right:right };
		}
		
		setPanButtons(left,middle,right) {
			this._panButtons = { left:left, middle:middle, right:right };
		}
		
		setZoomButtons(left,middle,right) {
			this._zoomButtons = { left:left, middle:middle, right:right };
		}
		
		get rotation() { return this._rotation; }
		set rotation(r) { this._rotation = r; }
		get distance() { return this._distance; }
		set distance(d) { this._distance = d; }
		get center() { return this._center; }
		set center(c) { this._center = c; }
		get whellSpeed() { this._wheelSpeed; }
		set wheelSpeed(w) { this._wheelSpeed = w; }

		get viewWidth() { return this._viewWidth; }
		
		get minCameraFocus() { return this._minFocus; }
		set minCameraFocus(f) { this._minFocus = f; }
		get minPitch() { return this._minPitch; }
		set minPitch(p) { this._minPitch = p; }
		get maxPitch() { return this._maxPitch; }
		set maxPitch(p) { this._maxPitch = p; }
		get minDistance() { return this._minDistance; }
		set minDistance(d) { this._minDistance = d; }
		get maxDistance() { return this._maxDistance; }
		set maxDistance(d) { this._maxDistance = d; }

		get minX() { return this._minX; }
		get maxX() { return this._maxX; }
		get minY() { return this._minY; }
		get maxY() { return this._maxY; }
		get minZ() { return this._minZ; }
		get maxZ() { return this._maxZ; }

		set minX(val) { this._minX = val; }
		set maxX(val) { this._maxX = val; }
		set minY(val) { this._minY = val; }
		set maxY(val) { this._maxY = val; }
		set minZ(val) { this._minZ = val; }
		set maxZ(val) { this._maxZ = val; }

		get displacementSpeed() { return this._displacementSpeed; }
		set displacementSpeed(s) { this._displacementSpeed = s; }

		get enabled() { return this._enabled; }
		set enabled(e) { this._enabled = e; }

		get showLimitGizmo() { return this._showLimitGizmo; }
		set showLimitGizmo(l) { this._showLimitGizmo = l; }
		get limitGizmoColor() { return this._limitGizmoColor; }
		set limitGizmoColor(c) { this._limitGizmoColor = c; }

		displayGizmo(pipeline,matrixState) {
			if (!this._showLimitGizmo) return;
			let plist = getGizmo.apply(this);
			matrixState.modelMatrixStack.push();
			matrixState.modelMatrixStack.identity();
			if (plist) {
				pipeline.draw(plist);
			}
			matrixState.modelMatrixStack.pop();
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			componentData.rotateButtons = this._rotateButtons;
			componentData.panButtons = this._panButtons;
			componentData.zoomButtons = this._zoomButtons;
			componentData.rotation = this._rotation.toArray();
			componentData.distance = this._distance;
			componentData.center = this._center.toArray();
			componentData.rotationSpeed = this._rotationSpeed;
			componentData.forward = this._forward;
			componentData.left = this._left;
			componentData.wheelSpeed = this._wheelSpeed;
			componentData.minFocus = this._minFocus;
			componentData.minPitch = this._minPitch;
			componentData.maxPitch = this._maxPitch;
			componentData.minDistance = this._minDistance;
			componentData.maxDistance = this._maxDistance;
			componentData.maxX = this._maxX;
			componentData.minX = this._minX;
			componentData.minY = this._minY;
			componentData.maxY = this._maxY;
			componentData.maxZ = this._maxZ;
			componentData.minZ = this._minZ;
			componentData.displacementSpeed = this._displacementSpeed;
			componentData.enabled = this._enabled;
		}

		deserialize(context,componentData,url) {
			this._rotateButtons = componentData.rotateButtons || this._rotateButtons;
			this._panButtons = componentData.panButtons || this._panButtons;
			this._zoomButtons = componentData.zoomButtons || this._zoomButtons;
			this._rotation = new bg.Vector2(componentData.rotation) || this._rotation;
			this._distance = componentData.distance!==undefined ? componentData.distance : this._distance;
			this._center = new bg.Vector3(componentData.center) || this._center;
			this._rotationSpeed = componentData.rotationSpeed!==undefined ? componentData.rotationSpeed : this._rotationSpeed;
			this._forward = componentData.forward!==undefined ? componentData.forward : this._forward;
			this._left = componentData.left!==undefined ? componentData.left : this._left;
			this._wheelSpeed = componentData.wheelSpeed!==undefined ? componentData.wheelSpeed : this._wheelSpeed;
			this._minFocus = componentData.minFocus!==undefined ? componentData.minFocus : this._minFocus;
			this._minPitch = componentData.minPitch!==undefined ? componentData.minPitch : this._minPitch;
			this._maxPitch = componentData.maxPitch!==undefined ? componentData.maxPitch : this._maxPitch;
			this._minDistance = componentData.minDistance!==undefined ? componentData.minDistance : this._minDistance;
			this._maxDistance = componentData.maxDistance!==undefined ? componentData.maxDistance : this._maxDistance;
			this._maxX = componentData.maxX!==undefined ? componentData.maxX : this._maxX;
			this._minX = componentData.minX!==undefined ? componentData.minX : this._minX;
			this._minY = componentData.minY!==undefined ? componentData.minY : this._minY;
			this._maxY = componentData.maxY!==undefined ? componentData.maxY : this._maxY;
			this._maxZ = componentData.maxZ!==undefined ? componentData.maxZ : this._maxZ;
			this._minZ = componentData.minZ!==undefined ? componentData.minZ : this._minZ;
			this._displacementSpeed = componentData.displacementSpeed!==undefined ? componentData.displacementSpeed : this._displacementSpeed;
			this._enabled = componentData.enabled!==undefined ? componentData.enabled : this._enabled;
		}

		frame(delta) {
			let orthoStrategy = this.camera && typeof(this.camera.projectionStrategy)=="object" &&
								this.camera.projectionStrategy instanceof bg.scene.OrthographicProjectionStrategy ?
									this.camera.projectionStrategy : null;
			

			if (this.transform && this.enabled) {
				let forward = this.transform.matrix.forwardVector;
				let left = this.transform.matrix.leftVector;
				forward.scale(this._forward);
				left.scale(this._left);
				this._center.add(forward).add(left);
				
				let pitch = this._rotation.x>this._minPitch ? this._rotation.x:this._minPitch;
				pitch = pitch<this._maxPitch ? pitch : this._maxPitch;
				this._rotation.x = pitch;

				this._distance = this._distance>this._minDistance ? this._distance:this._minDistance;
				this._distance = this._distance<this._maxDistance ? this._distance:this._maxDistance;

				if (this._mouseButtonPressed) {
					let displacement = new bg.Vector3();
					if (this._keys[bg.app.SpecialKey.UP_ARROW]) {
						displacement.add(this.transform.matrix.backwardVector);
						bg.app.MainLoop.singleton.windowController.postRedisplay();
					}
					if (this._keys[bg.app.SpecialKey.DOWN_ARROW]) {
						displacement.add(this.transform.matrix.forwardVector);
						bg.app.MainLoop.singleton.windowController.postRedisplay();
					}
					if (this._keys[bg.app.SpecialKey.LEFT_ARROW]) {
						displacement.add(this.transform.matrix.leftVector);
						bg.app.MainLoop.singleton.windowController.postRedisplay();
					}
					if (this._keys[bg.app.SpecialKey.RIGHT_ARROW]) {
						displacement.add(this.transform.matrix.rightVector);
						bg.app.MainLoop.singleton.windowController.postRedisplay();
					}
					displacement.scale(this._displacementSpeed);
					this._center.add(displacement);
				}

				if (this._center.x<this._minX) this._center.x = this._minX;
				else if (this._center.x>this._maxX) this._center.x = this._maxX;

				if (this._center.y<this._minY) this._center.y = this._minY;
				else if (this._center.y>this._maxY) this._center.y = this._maxY;

				if (this._center.z<this._minZ) this._center.z = this._minZ;
				else if (this._center.z>this._maxZ) this._center.z = this._maxZ;

				this.transform.matrix
						.identity()
						.translate(this._center)
						.rotate(bg.Math.degreesToRadians(this._rotation.y), 0,1,0)
						.rotate(bg.Math.degreesToRadians(pitch), -1,0,0);

				if (orthoStrategy) {
					orthoStrategy.viewWidth = this._viewWidth;
				}
				else {
					this.transform.matrix.translate(0,0,this._distance);
				}
			}
			
			if (this.camera) {
				this.camera.focus = this._distance>this._minFocus ? this._distance:this._minFocus;
				
			}
		}

		mouseDown(evt) {
			if (!this.enabled) return;
			this._mouseButtonPressed = true;
			this._lastPos = new bg.Vector2(evt.x,evt.y);
		}

		mouseUp(evt) {
			this._mouseButtonPressed = false;
		}
		
		mouseDrag(evt) {
			if (this.transform && this._lastPos && this.enabled) {
				let delta = new bg.Vector2(this._lastPos.y - evt.y,
										 this._lastPos.x - evt.x);
				this._lastPos.set(evt.x,evt.y);
				let orthoStrategy = this.camera && typeof(this.camera.projectionStrategy)=="object" &&
								this.camera.projectionStrategy instanceof bg.scene.OrthographicProjectionStrategy ?
								true : false;

				switch (getOrbitAction(this)) {
					case Action.ROTATE:
						delta.x = delta.x * -1;
						this._rotation.add(delta.scale(0.5));
						break;
					case Action.PAN:
						let up = this.transform.matrix.upVector;
						let left = this.transform.matrix.leftVector;
						
						if (orthoStrategy) {
							up.scale(delta.x * -0.0005 * this._viewWidth);
							left.scale(delta.y * -0.0005 * this._viewWidth);
						}
						else {
							up.scale(delta.x * -0.001 * this._distance);
							left.scale(delta.y * -0.001 * this._distance);
						}
						this._center.add(up).add(left);
						break;
					case Action.ZOOM:
						this._distance += delta.x * 0.01 * this._distance;
						this._viewWidth += delta.x * 0.01 * this._viewWidth;
						if (this._viewWidth<0.5) this._viewWidth = 0.5;
						break;
				}				
			}
		}

		mouseWheel(evt) {
			if (!this.enabled) return;
			let mult = this._distance>0.01 ? this._distance:0.01;
			let wMult = this._viewWidth>1 ? this._viewWidth:1;
			this._distance += evt.delta * 0.001 * mult * this._wheelSpeed;
			this._viewWidth += evt.delta * 0.0001 * wMult * this._wheelSpeed;
			if (this._viewWidth<0.5) this._viewWidth = 0.5;
		}
		
		touchStart(evt) {
			if (!this.enabled) return;
			this._lastTouch = evt.touches;
		}
		
		touchMove(evt) {
			if (this._lastTouch.length==evt.touches.length && this.transform && this.enabled) {
				if (this._lastTouch.length==1) {
					// Rotate
					let last = this._lastTouch[0];
					let t = evt.touches[0];
					let delta = new bg.Vector2((last.y - t.y)  * -1.0, last.x - t.x);
					
					this._rotation.add(delta.scale(0.5));
				}
				else if (this._lastTouch.length==2) {
					// Pan/zoom
					let l0 = this._lastTouch[0];
					let l1 = this._lastTouch[1];
					let t0 = null;
					let t1 = null;
					evt.touches.forEach((touch) => {
						if (touch.identifier==l0.identifier) {
							t0 = touch;
						}
						else if (touch.identifier==l1.identifier) {
							t1 = touch;
						}
					});
					let dist0 = Math.round((new bg.Vector2(l0.x,l0.y)).sub(new bg.Vector3(l1.x,l1.y)).magnitude());
					let dist1 = Math.round((new bg.Vector2(t0.x,t0.y)).sub(new bg.Vector3(t1.x,t1.y)).magnitude());
					let delta = new bg.Vector2(l0.y - t0.y, l1.x - t1.x);
					let up = this.transform.matrix.upVector;
					let left = this.transform.matrix.leftVector;
					
					up.scale(delta.x * -0.001 * this._distance);
					left.scale(delta.y * -0.001 * this._distance);
					this._center.add(up).add(left);
						
					this._distance += (dist0 - dist1) * 0.005 * this._distance;
				}
			}
			this._lastTouch = evt.touches;
		}

		keyDown(evt) {
			if (!this.enabled) return;
			this._keys[evt.key] = true;
			bg.app.MainLoop.singleton.windowController.postRedisplay();
		}

		keyUp(evt) {
			if (!this.enabled) return;
			this._keys[evt.key] = false;
		}
	}
	
	class FPSCameraController extends bg.scene.Component {
		
	}
	
	class TargetCameraController extends bg.scene.Component {
		
	}
	
	bg.scene.registerComponent(bg.manipulation,OrbitCameraController,"bg.manipulation.OrbitCameraController");
	bg.scene.registerComponent(bg.manipulation,FPSCameraController,"bg.manipulation.FPSCameraController");
	bg.scene.registerComponent(bg.manipulation,TargetCameraController,"bg.manipulation.TargetCameraController");
	
})();
