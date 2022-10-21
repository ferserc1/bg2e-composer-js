(function() {
	
	class GizmoManager extends bg.app.ContextObject {
		
		constructor(context) {
			super(context);
			this._gizmoOpacity = 0.9;
		}
		
		get pipeline() {
			if (!this._pipeline) {
				this._pipeline = new bg.base.Pipeline(this.context);
				this._pipeline.blendMode = bg.base.BlendMode.NORMAL;
				this._pipeline.effect = new bg.manipulation.GizmoEffect(this.context);
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
				this._drawVisitor = new bg.manipulation.DrawGizmoVisitor(this.pipeline,this.matrixState);
			}
			return this._drawVisitor;
		}
		
		get gizmoOpacity() { return this._gizmoOpacity; }
		set gizmoOpacity(o) { this._gizmoOpacity = o; }

		get show3dGizmos() { return this.drawVisitor.show3dGizmos; }
		set show3dGizmos(g) { this.drawVisitor.show3dGizmos = g; }
		
		get working() { return this._working; }

		// Load icon textures manually
		// addGizmoIcon("bg.scene.Camera",cameraTexture)
		addGizmoIcon(type,iconTexture) {
			this.drawVisitor.addGizmoIcon(type,iconTexture);
		}

		get gizmoIconScale() { return this.drawVisitor.gizmoScale; }
		set gizmoIconScale(s) { this.drawVisitor.gizmoScale = s; }

		setGizmoIconVisibility(type,visible) { this.drawVisitor.setGizmoIconVisibility(type,visible); }
		hideGizmoIcon(type) { this.drawVisitor.setGizmoIconVisibility(type,false); }
		showGizmoIcon(type) { this.drawVisitor.setGizmoIconVisibility(type,true); }
		
		get gizmoIcons() { return this.drawVisitor.gizmoIcons; }

		/*
		 * Receives an array with the icon data, ordered by priority (only one component
		 * icon will be shown).
		 * iconData: [
		 * 		{ type:"bg.scene.Camera", icon:"../data/camera_gizmo.png" },
		 * 		{ type:"bg.scene.Light", icon:"../data/light_gizmo.png" },
		 * 		{ type:"bg.scene.Transform", icon:"../data/transform_gizmo.png" },
		 * 		{ type:"bg.scene.Drawable", icon:"../data/drawable_gizmo.png" },
		 * ],
		 * basePath: if specified, this path will be prepended to the icon paths
		 */
		loadGizmoIcons(iconData, basePath="",onProgress) {
			return new Promise((resolve,reject) => {
				let urls = [];
				let iconDataResult = [];
				iconData.forEach((data) => {
					let itemData = { type:data.type, iconTexture:null };
					itemData.path = bg.utils.path.join(basePath,data.icon);
					urls.push(itemData.path);
					iconDataResult.push(itemData);
				});
				bg.base.Loader.Load(this.context,urls,onProgress)
					.then((result) => {
						iconDataResult.forEach((dataItem) => {
							dataItem.iconTexture = result[dataItem.path];
							this.addGizmoIcon(dataItem.type,dataItem.iconTexture);
						})
						resolve(iconDataResult);
					})
					.catch((err) => {
						reject(err);
					});
			});
		}

		clearGizmoIcons() {
			this.drawVisitor.clearGizmoIcons();
		}
		
		// If sceneRoot==null, then the scene will be extracted from the camera
		startAction(gizmoPickData,pos,camera,sceneRoot=null) {
			if (!camera) {
				throw new Error("GizmoManager.startAction(): camera parameter is null.");
			}
			if (!sceneRoot) {
				sceneRoot = camera.node && camera.node.sceneRoot;
			}
			if (!sceneRoot) {
				throw new Error("GizmoManager.startAction(): The sceneRoot parameter can't be null because the camera is not attached to a scene.")
			}

			// Find AnchorJoint nodes in scene
			let findVisitor = new bg.scene.FindComponentVisitor("bg.scene.AnchorJoint");
			sceneRoot.accept(findVisitor);
			this._anchorPoints = [];
			this._anchorPoints.closestPoint = function(p,anchorComp) {
				if (!(p instanceof bg.Vector3)) {
					p = new bg.Vector3(p);
				}
				let c = null;
				let d = Number.MAX_VALUE;
				this.forEach((point) => {
					let distance = point.position.distance(p);
					if (point.component != anchorComp && distance<d) {
						d = distance;
						//c = point.position;
						c = {
							anchor: point,
							distance: d
						}
					}
				});
				return c;
			};
			findVisitor.result.forEach((node) => {
				let anchorComponent = node.anchorJoint;
				anchorComponent.getWorldPositionAnchors().forEach((anchor) => {
					this._anchorPoints.push({
						position: new bg.Vector3(anchor.position),
						radius: anchor.radius,
						component: anchorComponent
					});
				});
			});

			this._working = true;
			this._startPoint = new bg.Vector2(pos.x, pos.y);
			// Convert to viewport coords
			this._startPoint.y = camera.viewport.height - pos.y;
			this._currentGizmoData = gizmoPickData;
			if (this._currentGizmoData && this._currentGizmoData.node) {
				let gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
				if (gizmo) {
					gizmo.beginDrag(this._currentGizmoData.action,this._startPoint,this._anchorPoints);
				}
			}
		}
		
		move(pos,camera) {
			if (this._currentGizmoData && this._currentGizmoData.node) {
				let parent = this._currentGizmoData.node.parent;
				let constraints = parent && parent.component("bg.manipulation.GizmoConstraints");
				let trxComp = this._currentGizmoData.node.transform;
				let prevTrx = trxComp && new bg.Matrix4(trxComp.matrix);
				
				let gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
				let anchorJoint = gizmo && this._currentGizmoData.node.anchorJoint;
				if (gizmo) {
					let anchorData = null
					if (anchorJoint) {
						let minDist = Number.MAX_VALUE;
						anchorJoint.getWorldPositionAnchors().forEach((anchor) => {
							let p = new bg.Vector3(anchor.position);
							let cp = this._anchorPoints.closestPoint(p,anchorJoint);
							if (cp.distance<minDist) {
								minDist = cp.distance;
								anchor.position = new bg.Vector3(anchor.position);
								anchorData = {
									distance : minDist,
									nodeAnchor : anchor,
									closestAnchor : cp.anchor,
									triggerAnchor: minDist < anchor.radius
								};
							}
						});
					}

					// Convert to viewport coords
					pos.y = camera.viewport.height - pos.y;
					gizmo.drag(this._currentGizmoData.action,this._startPoint,pos,camera,this._anchorPoints,anchorData);
					if (trxComp && constraints) {
						let newMatrix = trxComp.matrix;
						let pos = newMatrix.position;
						let b = new bg.Vector3(constraints.bounds);
						b.scale(0.5);
						if (pos.x<-b.x || pos.x>b.x ||
							pos.y<-b.y || pos.y>b.y ||
							pos.z<-b.z || pos.z>b.z)
						{
							trxComp.matrix = prevTrx;
						}
					}
				}
				this._startPoint = pos;
			}
		}
		
		endAction() {
			if (this._currentGizmoData && this._currentGizmoData.node) {
				let gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
				if (gizmo) {
					gizmo.endDrag(this._currentGizmoData.action,this._anchorPoints);
				}
			}
			this._working = false;
			this._startPoint = null;
			this._currentGizmoData = null;
		}
		
		drawGizmos(sceneRoot,camera,clearDepth=true) {
			let restorePipeline = bg.base.Pipeline.Current();
			let restoreMatrixState = bg.base.MatrixState.Current();
			bg.base.Pipeline.SetCurrent(this.pipeline);
			bg.base.MatrixState.SetCurrent(this.matrixState);
			this.pipeline.viewport = camera.viewport;
			this.pipeline.effect.matrixState = this.matrixState;
			
			if (clearDepth) {
				this.pipeline.clearBuffers(bg.base.ClearBuffers.DEPTH);
			}
			
			this.matrixState.projectionMatrixStack.set(camera.projection);
			this.matrixState.viewMatrixStack.set(camera.viewMatrix);										
			
			let opacityLayer = this.pipeline.opacityLayer;
			this.pipeline.opacityLayer = bg.base.OpacityLayer.NONE;
			
			this.pipeline.blend = true;
			this.pipeline.effect.gizmoOpacity = this.gizmoOpacity;
			sceneRoot.accept(this.drawVisitor);
			this.pipeline.blend = false;
			
			this.pipeline.opacityLayer = opacityLayer;
			
			if (restorePipeline) {
				bg.base.Pipeline.SetCurrent(restorePipeline);
			}
			if (restoreMatrixState) {
				bg.base.MatrixState.SetCurrent(restoreMatrixState);
			}
		}
	}
	
	bg.manipulation.GizmoManager = GizmoManager;
	
})();
