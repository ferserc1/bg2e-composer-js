(function() {
	
	let shaders = {};

	function initShaders() {
		shaders[bg.webgl1.EngineId] = {
			vertex: `
			attribute vec3 inVertex;
			attribute vec2 inTexCoord;
			attribute vec4 inVertexColor;
			
			uniform mat4 inModelMatrix;
			uniform mat4 inViewMatrix;
			uniform mat4 inProjectionMatrix;
			
			varying vec2 fsTexCoord;
			varying vec4 fsColor;
			
			void main() {
				fsTexCoord = inTexCoord;
				fsColor = inVertexColor;
				gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
			}
			`,
			
			fragment:`
			precision highp float;
			
			uniform vec4 inColor;
			uniform sampler2D inTexture;
			uniform float inOpacity;
			
			varying vec2 fsTexCoord;
			varying vec4 fsColor;
			
			void main() {
				vec4 tex = texture2D(inTexture,fsTexCoord);
				gl_FragColor = vec4(fsColor.rgb * tex.rgb * inColor.rgb,inOpacity * tex.a);
			}
			`
		};
	}
	
	class GizmoEffect extends bg.base.Effect {
		constructor(context) { 
			super(context);
			initShaders();
			this._gizmoOpacity = 1;
			this._color = bg.Color.White();
		}
		
		get inputVars() {
			return {
				vertex:'inVertex',
				color:'inVertexColor',
				tex0:'inTexCoord'
			}
		}
		
		set matrixState(m) { this._matrixState = m; }
		get matrixState() {
			return this._matrixState;
		}
		
		set texture(t) { this._texture = t; }
		get texture() { return this._texture; }
		
		set color(c) { this._color = c; }
		get color() { return this._color; }

		set gizmoOpacity(o) { this._gizmoOpacity = o; }
		get gizmoOpacity() { return this._gizmoOpacity; }
				
		get shader() {
			if (!this._shader) {
				this._shader = new bg.base.Shader(this.context);
				this._shader.addShaderSource(bg.base.ShaderType.VERTEX, shaders[bg.webgl1.EngineId].vertex);
				this._shader.addShaderSource(bg.base.ShaderType.FRAGMENT, shaders[bg.webgl1.EngineId].fragment);
				this._shader.link();
				if (!this._shader.status) {
					console.log(this._shader.compileError);
					console.log(this._shader.linkError);
				}
				else {
					this._shader.initVars([
						'inVertex',
						'inVertexColor',
						'inTexCoord'
					],[
						'inModelMatrix',
						'inViewMatrix',
						'inProjectionMatrix',
						'inColor',
						'inTexture',
						'inOpacity'
					]);
				}
			}
			return this._shader
		}
		
		setupVars() {
			let whiteTexture = bg.base.TextureCache.WhiteTexture(this.context);
			this.shader.setMatrix4('inModelMatrix',this.matrixState.modelMatrixStack.matrixConst);
			this.shader.setMatrix4('inViewMatrix',new bg.Matrix4(this.matrixState.viewMatrixStack.matrixConst));
			this.shader.setMatrix4('inProjectionMatrix',this.matrixState.projectionMatrixStack.matrixConst);
			this.shader.setVector4('inColor',this.color);
			this.shader.setTexture('inTexture', this.texture ? this.texture : whiteTexture,bg.base.TextureUnit.TEXTURE_0);
			this.shader.setValueFloat('inOpacity',this.gizmoOpacity);
		}
		
	}
	
	bg.manipulation.GizmoEffect = GizmoEffect;

	bg.manipulation.GizmoAction = {
		TRANSLATE: 1,
		ROTATE: 2,
		ROTATE_FINE: 3,
		SCALE: 4,
		TRANSLATE_X: 5,
		TRANSLATE_Y: 6,
		TRANSLATE_Z: 7,
		ROTATE_X: 8,
		ROTATE_Y: 9,
		ROTATE_Z: 10,
		SCALE_X: 11,
		SCALE_Y: 12,
		SCALE_Z: 13,

		NONE: 99
	};

	function getAction(plist) {
		if (/rotate.*fine/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.ROTATE_FINE;
		}
		if (/rotate.*x/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.ROTATE_X;
		}
		if (/rotate.*y/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.ROTATE_Y;
		}
		if (/rotate.*z/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.ROTATE_Z;
		}
		else if (/rotate/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.ROTATE;
		}
		else if (/translate.*x/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.TRANSLATE_X;
		}
		else if (/translate.*y/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.TRANSLATE_Y;
		}
		else if (/translate.*z/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.TRANSLATE_Z;		
		}
		else if (/translate/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.TRANSLATE;
		}
		else if (/scale.*x/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.SCALE_X;
		}
		else if (/scale.*y/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.SCALE_Y;
		}
		else if (/scale.*z/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.SCALE_Z;
		}
		else if (/scale/i.test(plist.name)) {
			return bg.manipulation.GizmoAction.SCALE;
		}
	}
	
	let s_gizmoCache = {}

	class GizmoCache {
		static Get(context) {
			if (!s_gizmoCache[context.uuid]) {
				s_gizmoCache[context.uuid] = new GizmoCache(context);
			}
			return s_gizmoCache[context.uuid];
 		}
		
		constructor(context) {
			this._context = context;
			this._gizmos = {};
		}
		
		find(url) {
			return this._gizmos[url];
		}
		
		register(url,gizmoItems) {
			this._gizmos[url] = gizmoItems;
		}
		
		unregister(url) {
			if (this._gizmos[url]) {
				delete this._gizmos[url];
			}
		}
		
		clear() {
			this._gizmos = {}
		}
	}
	
	bg.manipulation.GizmoCache = GizmoCache;

	function loadGizmo(context,gizmoUrl,gizmoNode) {
		return new Promise(function(accept,reject) {
			if (!gizmoUrl) {
				accept([]);
				return;
			}
			bg.base.Loader.Load(context,gizmoUrl)
				.then(function (node) {
					let drw = node.component("bg.scene.Drawable");
					let gizmoItems = [];
					if (drw) {
						drw.forEach(function (plist,material) {
							gizmoItems.push({
								id:bg.manipulation.Selectable.GetIdentifier(),
								type:bg.manipulation.SelectableType.GIZMO,
								plist:plist,
								material:material,
								action:getAction(plist),
								node:gizmoNode
							})
						});
					}

					accept(gizmoItems);
				})
				
				.catch(function(err) {
					reject(err);
				});
		});
	}
	
	function rotationBetweenPoints(axis,p1,p2,origin,inc) {
		if (!inc) inc = 0;
		let v1 = new bg.Vector3(p2);
		v1.sub(origin).normalize();
		let v2 = new bg.Vector3(p1);
		v2.sub(origin).normalize();
		let dot = v1.dot(v2);
	
		let alpha = Math.acos(dot);
		if (alpha>=inc || inc==0) {
			if (inc!=0) {
				alpha = (alpha>=2*inc) ? 2*inc:inc;
			}
			let sign = axis.dot(v1.cross(v2));
			if (sign<0) alpha *= -1.0;
			let q = new bg.Quaternion(alpha,axis.x,axis.y,axis.z);
			q.normalize();
	
			if (!isNaN(q.x)) {
				return q;
			}
		}
		return new bg.Quaternion(0,0,1,0);
	}
	
	class Gizmo extends bg.scene.Component {
		constructor(gizmoPath,visible=true) {
			super();
			this._gizmoPath = gizmoPath;
			this._offset = new bg.Vector3(0);
			this._visible = visible;
			this._gizmoTransform = bg.Matrix4.Identity();
			this._gizmoP = bg.Matrix4.Identity();
			this._scale = 5;
			this._minSize = 0.5;
		}
		
		clone() {
			let newGizmo = new Gizmo(this._gizmoPath);
			newGizmo.offset.assign(this._offset);
			newGizmo.visible = this._visible;
			return newGizmo;
		}
		
		get offset() { return this._offset; }
		set offset(v) { this._offset = v; }
		
		get visible() { return this._visible; }
		set visible(v) { this._visible = v; }

		get gizmoTransform() {
			return this._gizmoTransform;
		}
		
		beginDrag(action,pos,anchorPoints) {}
		
		drag(action,startPos,endPos,camera,anchorPoints) {}
		
		endDrag(action,anchorPoints) {}
		
		findId(id) {
			let result = null;
			if (this._gizmoItems) {
				this._gizmoItems.some((item) => {
					if (item.id.r==id.r && item.id.g==id.g && item.id.b==id.b && item.id.a==id.a) {
						result = item;
						return true;
					}
				});
			}
			return result;
		}

		init() {
			if (!this._error) {
				this._gizmoItems = [];
				loadGizmo(this.node.context,this._gizmoPath,this.node)
					.then((gizmoItems) => {
						this._gizmoItems = gizmoItems;
					})
					
					.catch((err) => {
						this._error = true;
						throw err;
					})
			}
		}
		
		frame(delta) {
			
		}
		
		display(pipeline,matrixState) {
			if (!this._gizmoItems || !this.visible) return;
			matrixState.modelMatrixStack.push();
			let modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
			modelview.mult(matrixState.modelMatrixStack.matrix);
			let s = modelview.position.magnitude() / this._scale;
			matrixState.modelMatrixStack.matrix.setScale(s,s,s);
			if (pipeline.effect instanceof bg.manipulation.ColorPickEffect &&
				(pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS ||
				pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION))
			{
				let dt = pipeline.depthTest;
				if (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION) {	// drawing gizmos in selection mode
					pipeline.depthTest = true;
				}
				else {
					pipeline.depthTest = false;
				}
				this._gizmoItems.forEach((item) => {
					// The RGBA values are inverted because the alpha channel must be major than zero to
					// produce any output in the framebuffer
					if (item.plist.visible) {
						pipeline.effect.pickId = new bg.Color(item.id.a/255,item.id.b/255,item.id.g/255,item.id.r/255);
						pipeline.draw(item.plist);
					}
				});
				pipeline.depthTest = dt;
			}
			else if (pipeline.effect instanceof bg.manipulation.GizmoEffect) {
				// Draw gizmo
				this._gizmoItems.forEach((item) => {
					if (item.plist.visible) {
						pipeline.effect.texture = item.material.texture;
						pipeline.effect.color = item.material.diffuse;
						pipeline.draw(item.plist);
					}
				})
			}
			matrixState.modelMatrixStack.pop();
		}
	}

	function translateMatrix(gizmo,intersection) {
		let matrix = new bg.Matrix4(gizmo.transform.matrix);
		let rotation = matrix.rotation;
		let origin = matrix.position;
		
		if (!gizmo._lastPickPoint) {
			gizmo._lastPickPoint = intersection.ray.end;
			gizmo._translateOffset = new bg.Vector3(origin);
			gizmo._translateOffset.sub(intersection.ray.end);
		}

		switch (Math.abs(gizmo.plane)) {
		case bg.Axis.X:
			matrix = bg.Matrix4.Translation(origin.x,
											intersection.point.y + gizmo._translateOffset.y,
											intersection.point.z + gizmo._translateOffset.z);
			break;
		case bg.Axis.Y:
			matrix = bg.Matrix4.Translation(intersection.point.x + gizmo._translateOffset.x,
											origin.y,
											intersection.point.z + gizmo._translateOffset.z);
			break;
		case bg.Axis.Z:
			matrix = bg.Matrix4.Translation(intersection.point.x + gizmo._translateOffset.x,
											intersection.point.y + gizmo._translateOffset.y,
											origin.z);
			break;
		}

		matrix.mult(rotation);
		gizmo._lastPickPoint = intersection.point;

		return matrix;
	}

	function rotateMatrix(gizmo,intersection,fine) {
		let matrix = new bg.Matrix4(gizmo.transform.matrix);
		let rotation = matrix.rotation;
		let origin = matrix.position;
		
		if (!gizmo._lastPickPoint) {
			gizmo._lastPickPoint = intersection.ray.end;
			gizmo._translateOffset = new bg.Vector3(origin);
			gizmo._translateOffset.sub(intersection.ray.end);
		}

		if (!fine) {
			let prevRotation = new bg.Matrix4(rotation);
			rotation = rotationBetweenPoints(gizmo.planeAxis,gizmo._lastPickPoint,intersection.point,origin,bg.Math.degreesToRadians(22.5));
			if (rotation.x!=0 || rotation.y!=0 || rotation.z!=0 || rotation.w!=1) {
				matrix = bg.Matrix4.Translation(origin)
					.mult(rotation.getMatrix4())
					.mult(prevRotation);
				gizmo._lastPickPoint = intersection.point;
			}
		}
		else {
			let prevRotation = new bg.Matrix4(rotation);
			rotation = rotationBetweenPoints(gizmo.planeAxis,gizmo._lastPickPoint,intersection.point,origin);
			if (rotation.x!=0 || rotation.y!=0 || rotation.z!=0 || rotation.w!=1) {
				matrix = bg.Matrix4.Translation(origin)
					.mult(rotation.getMatrix4())
					.mult(prevRotation);
				gizmo._lastPickPoint = intersection.point;
			}
		}

		return matrix;
	}

	function calculateClosestPlane(gizmo,matrixState) {
		let cameraForward = matrixState.viewMatrixStack.matrix.forwardVector;
		let upVector = matrixState.viewMatrixStack.matrix.upVector;
		let xVector = new bg.Vector3(1,0,0);
		let yVector = new bg.Vector3(0,1,0);
		let zVector = new bg.Vector3(0,0,1);
		let xVectorInv = new bg.Vector3(-1,0,0);
		let yVectorInv = new bg.Vector3(0,-1,0);
		let zVectorInv = new bg.Vector3(0,0,-1);
		
		let upAlpha = Math.acos(upVector.dot(yVector));
		if (upAlpha>0.9) {
			gizmo.plane = bg.Axis.Y;
		}
		else {
			let angles = [
				Math.acos(cameraForward.dot(xVector)),		// x
				Math.acos(cameraForward.dot(yVector)),		// y
				Math.acos(cameraForward.dot(zVector)),		// z
				Math.acos(cameraForward.dot(xVectorInv)),	// -x
				Math.acos(cameraForward.dot(yVectorInv)),	// -y
				Math.acos(cameraForward.dot(zVectorInv))	// -z
			];
			let min = angles[0];
			let planeIndex = 0;
			angles.reduce(function(prev,v,index) {
				if (v<min) {
					planeIndex = index;
					min = v;
				}
			});
			switch (planeIndex) {
			case 0:
				gizmo.plane = -bg.Axis.X;
				break;
			case 1:
				gizmo.plane = bg.Axis.Y;
				break;
			case 2:
				gizmo.plane = bg.Axis.Z;
				break;
			case 3:
				gizmo.plane = bg.Axis.X;
				break;
			case 4:
				gizmo.plane = -bg.Axis.Y;
				break;
			case 5:
				gizmo.plane = -bg.Axis.Z;
				break;
			}
		}
	}
	
	class PlaneGizmo extends Gizmo {
		constructor(path,visible=true) {
			super(path,visible);
			this._plane = bg.Axis.Y;
			this._autoPlaneMode = true;
		}
		
		get plane() {
			return this._plane;
		}

		set plane(a) {
			this._plane = a;
		}

		get autoPlaneMode() {
			return this._autoPlaneMode;
		}

		set autoPlaneMode(m) {
			this._autoPlaneMode = m;
		}

		get planeAxis() {
			switch (Math.abs(this.plane)) {
			case bg.Axis.X:
				return new bg.Vector3(1,0,0);
			case bg.Axis.Y:
				return new bg.Vector3(0,1,0);
			case bg.Axis.Z:
				return new bg.Vector3(0,0,1);
			}
		}

		get gizmoTransform() {
			let result = bg.Matrix4.Identity();
			switch (this.plane) {
			case bg.Axis.X:
				return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90),0,0,-1)
			case bg.Axis.Y:
				break;
			case bg.Axis.Z:
				return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90),1,0,0);
			case -bg.Axis.X:
				return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90),0,0,1)
			case -bg.Axis.Y:
				return bg.Matrix4.Rotation(bg.Math.degreesToRadians(180),0,-1,0);
			case -bg.Axis.Z:
				return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90),-1,0,0);
			}
			return result;
		}

		clone() {
			let newGizmo = new PlaneGizmo(this._gizmoPath);
			newGizmo.offset.assign(this._offset);
			newGizmo.visible = this._visible;
			return newGizmo;
		}

		init() {
			super.init();
			this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
		}
		
		display(pipeline,matrixState) {
			if (!this._gizmoItems || !this.visible) return;
			if (this.autoPlaneMode) {
				calculateClosestPlane(this,matrixState);
			}
			if (!this._gizmoItems || !this.visible) return;
			let modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
			modelview.mult(matrixState.modelMatrixStack.matrix);
			let s = modelview.position.magnitude() / this._scale;
			s = s<this._minSize ? this._minSize : s;
			let gizmoTransform = this.gizmoTransform;
			gizmoTransform.setScale(s,s,s);
			matrixState.modelMatrixStack.push();
			matrixState.modelMatrixStack
				.mult(gizmoTransform);
			if (pipeline.effect instanceof bg.manipulation.ColorPickEffect &&
				(pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS ||
				pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION))
			{
				let dt = pipeline.depthTest;
				if (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION) {	// drawing gizmos in selection mode
					pipeline.depthTest = true;
				}
				else {
					pipeline.depthTest = false;
				}
				this._gizmoItems.forEach((item) => {
					// The RGBA values are inverted because the alpha channel must be major than zero to
					// produce any output in the framebuffer
					if (item.plist.visible) {
						pipeline.effect.pickId = new bg.Color(item.id.a/255,item.id.b/255,item.id.g/255,item.id.r/255);
						pipeline.draw(item.plist);
					}
				});
				pipeline.depthTest = dt;
			}
			else if (pipeline.effect instanceof bg.manipulation.GizmoEffect) {
				// Draw gizmo
				this._gizmoItems.forEach((item) => {
					if (item.plist.visible) {
						pipeline.effect.texture = item.material.texture;
						pipeline.effect.color = item.material.diffuse;
						pipeline.draw(item.plist);
					}
				})
			}
			matrixState.modelMatrixStack.pop();
		}

		beginDrag(action,pos) {
			this._lastPickPoint = null;
			if (this._stopDrag) {
				this._disableAnchor = true;
				this._stopDrag = false;
				setTimeout(() => {
					this._disableAnchor = false;
				}, 500);
			}
		}
		
		drag(action,startPos,endPos,camera,anchorPoints,anchorData) {
			//let disableAnchor = this._stopDragDistance>anchorData.distance;
			//let stopDrag = this._stopDrag && disableAnchor;
			if (this.transform && !this._stopDrag) {
				let plane = new bg.physics.Plane(this.planeAxis);
				let ray = bg.physics.Ray.RayWithScreenPoint(endPos,camera.projection,camera.viewMatrix,camera.viewport);
				let intersection = bg.physics.Intersection.RayToPlane(ray,plane);
				
				if (intersection.intersects()) {
					let matrix = new bg.Matrix4(this.transform.matrix);
					this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
					
					switch (action) {
					case bg.manipulation.GizmoAction.TRANSLATE:
						matrix = translateMatrix(this,intersection);
						if (anchorData && anchorData.triggerAnchor && !this._disableAnchor) {
							var diff = new bg.Vector3(anchorData.closestAnchor.position);
							diff.sub(anchorData.nodeAnchor.position);
							let currentPos = matrix.position;
							matrix.setPosition(new bg.Vector3(
								currentPos.x + diff.x,
								currentPos.y + diff.y,
								currentPos.z + diff.z
							));
							// Cancel the drag operation
							this._stopDrag = true;
						}
						break;
					case bg.manipulation.GizmoAction.ROTATE:
						matrix = rotateMatrix(this,intersection,false);
						break;
					case bg.manipulation.GizmoAction.ROTATE_FINE:
						matrix = rotateMatrix(this,intersection,true);
						break;
					}
					this.transform.matrix = matrix;
				}
			}
		}
		
		endDrag(action) {
			this._lastPickPoint = null;
			//this._disableAnchor = false;
		}
	}

	class UnifiedGizmo extends Gizmo {
		constructor(path,visible=true) {
			super(path,visible);
			this._translateSpeed = 0.005;
			this._rotateSpeed = 0.005;
			this._scaleSpeed = 0.001;
			this._gizmoTransform = bg.Matrix4.Identity();
		}

		get gizmoTransform() {
			return this._gizmoTransform;
		}

		get translateSpeed() { return this._translateSpeed; }
		set translateSpeed(s) { this._translateSpeed = s; }

		get rotateSpeed() { return this._rotateSpeed; }
		set rotateSpeed(s) { this._rotateSpeed = s; }

		get scaleSpeed() { return this._scaleSpeed; }
		set scaleSpeed(s) { this._scaleSpeed = s; }

		clone() {
			let newGizmo = new PlaneGizmo(this._gizmoPath);
			newGizmo.offset.assign(this._offset);
			newGizmo.visible = this._visible;
			return newGizmo;
		}

		init() {
			super.init();
			this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
			this._gizmoTransform = this.transform.matrix.rotation;
		}
		
		display(pipeline,matrixState) {
			if (!this._gizmoItems || !this.visible) return;
			super.display(pipeline,matrixState);
		}

		beginDrag(action,pos) {
			this._lastPickPoint = null;
		}
		
		drag(action,startPos,endPos,camera) {
			if (this.transform) {
				if (!this._lastPickPoint) {
					this._lastPickPoint = endPos;
				}

				let matrix = new bg.Matrix4(this.transform.matrix);
				this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
				let diff = new bg.Vector2(this._lastPickPoint);
				diff.sub(endPos);
				
				let matrixState = bg.base.MatrixState.Current();
				let modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
				modelview.mult(matrixState.modelMatrixStack.matrix);
				let s = modelview.position.magnitude() / this._scale;
				s = s<this._minSize ? this._minSize : s;
				let scale = matrix.getScale();

				let scaleFactor = 1 - ((diff.x + diff.y) * this.scaleSpeed);
				switch (action) {
				case bg.manipulation.GizmoAction.SCALE:
					matrix.scale(scaleFactor,scaleFactor,scaleFactor);
					break;
				case bg.manipulation.GizmoAction.TRANSLATE_X:
					matrix.translate(-(diff.x + diff.y) * this.translateSpeed * s / scale.x, 0, 0);
					break;
				case bg.manipulation.GizmoAction.TRANSLATE_Y:
					matrix.translate(0,-(diff.x + diff.y) * this.translateSpeed * s / scale.y, 0);
					break;
				case bg.manipulation.GizmoAction.TRANSLATE_Z:
					matrix.translate(0, 0,-(diff.x + diff.y) * this.translateSpeed * s  / scale.z);
					break;
				case bg.manipulation.GizmoAction.ROTATE_X:
					matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 1,0,0);
					this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 1,0,0);
					break;
				case bg.manipulation.GizmoAction.ROTATE_Y:
					matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 0,1,0);
					this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 0,1,0);
					break;
				case bg.manipulation.GizmoAction.ROTATE_Z:
					matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 0,0,1);
					this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 0,0,1)
					break;
				case bg.manipulation.GizmoAction.SCALE_X:
					matrix.scale(scaleFactor,1,1);
					break;
				case bg.manipulation.GizmoAction.SCALE_Y:
					matrix.scale(1,scaleFactor,1);
					break;
				case bg.manipulation.GizmoAction.SCALE_Z:
					matrix.scale(1,1,scaleFactor);
					break;
				}

				this.transform.matrix = matrix;
				this._lastPickPoint = endPos;
			}
		}
		
		endDrag(action) {
			this._lastPickPoint = null;
		}
	}

	bg.manipulation.GizmoMode = {
        SELECT: 0,
        TRANSLATE: 1,
        ROTATE: 2,
        SCALE: 3,
        TRANSFORM: 4
	};
	
	class MultiModeGizmo extends UnifiedGizmo {
		constructor(unified,translate,rotate,scale) {
			super(unified);
			this.mode = bg.manipulation.GizmoMode.TRANSFORM;
			this._transformPath = unified;
			this._translatePath = translate;
			this._rotatePath = rotate;
			this._scalePath = scale;
			this._gizmoPath = unified;
		}

		get visible() {
			return this._mode!=bg.manipulation.GizmoMode.SELECT && this._visible;
		}
		set visible(v) { this._visible = v; } 

		get mode() { return this._mode; }
        set mode(m) {
            this._mode = m;
			this._gizmoItems = [];
			switch (m) {
			case bg.manipulation.GizmoMode.SELECT:
				this._gizmoPath = "";
				break;
			case bg.manipulation.GizmoMode.TRANSLATE:
				this._gizmoPath = this._translatePath;
				break;
			case bg.manipulation.GizmoMode.ROTATE:
				this._gizmoPath = this._rotatePath;
				break;
			case bg.manipulation.GizmoMode.SCALE:
				this._gizmoPath = this._scalePath;
				break;
			case bg.manipulation.GizmoMode.TRANSFORM:
				this._gizmoPath = this._transformPath;
				break;
			}
			if (this._gizmoPath) {
				loadGizmo(this.node.context,this._gizmoPath,this.node)
					.then((gizmoItems) => {
						this._gizmoItems = gizmoItems;
						bg.emitImageLoadEvent();
					})
					
					.catch((err) => {
						this._error = true;
						throw err;
					})
			}
        }
	}
	
	// All gizmo types share the same typeId, because a node can only contain one gizmo
	bg.scene.registerComponent(bg.manipulation,Gizmo,"bg.manipulation.Gizmo");
	bg.scene.registerComponent(bg.manipulation,PlaneGizmo,"bg.manipulation.Gizmo");
	bg.scene.registerComponent(bg.manipulation,UnifiedGizmo,"bg.manipulation.Gizmo");
	bg.scene.registerComponent(bg.manipulation,MultiModeGizmo,"bg.manipulation.Gizmo");

})();