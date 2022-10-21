(function() {

	let GizmoType = {
		IN_JOINT: 0,
		OUT_JOINT: 1
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

	
	function getGizmo(type) {
		if (!this._gizmo) {
			let s = 0.5;
			let vertex = [
				s, 0, 0,   -s, 0, 0,
				0, s, 0,   0, -s, 0,
				0, 0, s,   0, 0, -s
			];
			let color = [
				1,0,0,1, 1,0,0,1, 0,1,0,1, 0,1,0,1, 0,0,1,1, 0,0,1,1
			];
			this._gizmo = buildPlist(this.node.context,vertex,color);
		}
		return this._gizmo;
	}
	
	function updateJointTransforms() {
		if (this.node) {
			let matrix = bg.Matrix4.Identity();
			this.node.children.forEach((child, index) => {
				let trx = child.component("bg.scene.Transform");
				let inJoint = child.component("bg.scene.InputChainJoint");
				let outJoint = child.component("bg.scene.OutputChainJoint");
				
				if (index>0 && inJoint) {
					inJoint.joint.applyTransform(matrix);
				}
				else {
					matrix.identity();
				}
				
				if (trx) {
					trx.matrix.assign(matrix);
				}
				
				if (outJoint) {
					outJoint.joint.applyTransform(matrix);
				}
			});
		}
	}

	class Chain extends bg.scene.Component {
		constructor() {
			super();
		}
		
		clone() {
			return new bg.scene.Chain();
		}


		////// Direct rendering functions: will be deprecated soon
		willDisplay(pipeline,matrixState,projectionMatrixStack) {
			updateJointTransforms.apply(this);
		}

		////// Render queue functions
		willUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			updateJointTransforms.apply(this);
		}
	}
	
	bg.scene.registerComponent(bg.scene,Chain,"bg.scene.Chain");
	
	class ChainJoint extends bg.scene.Component {
		constructor() {
			super();
			
			this._joint = new bg.physics.LinkJoint();
		}
		
		get joint() { return this._joint; }
		set joint(j) { this._joint = j; }

		deserialize(context,sceneData,url) {
			if (sceneData.joint) {
				this.joint = bg.physics.Joint.Factory(sceneData.joint);
			}
		}
	}
	
	bg.scene.ChainJoint = ChainJoint;
	
	class InputChainJoint extends ChainJoint {
		constructor(joint) {
			super();
			if (joint) {
				this.joint = joint;
			}
			else {
				this.joint.transformOrder = bg.physics.LinkTransformOrder.ROTATE_TRANSLATE;
			}
		}
		
		clone() {
			let newJoint = new bg.scene.InputChainJoint();
			newJoint.joint.assign(this.joint);
			return newJoint;
		}

		displayGizmo(pipeline,matrixState) {
			let plist = getGizmo.apply(this,[0]);
			if (plist) {
				matrixState.modelMatrixStack.push();
				let mat = new bg.Matrix4(this.joint.transform);
				mat.invert();
				matrixState.modelMatrixStack.mult(mat);
				pipeline.draw(plist);
				matrixState.modelMatrixStack.pop();
			}
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			componentData.joint = {};
			this.joint.serialize(componentData.joint);
		}
	}
	
	bg.scene.registerComponent(bg.scene,InputChainJoint,"bg.scene.InputChainJoint");
	
	
	class OutputChainJoint extends ChainJoint {
		constructor(joint) {
			super();
			if (joint) {
				this.joint = joint;
			}
			else {
				this.joint.transformOrder = bg.physics.LinkTransformOrder.TRANSLATE_ROTATE;
			}
		}
		
		clone() {
			let newJoint = new bg.scene.OutputChainJoint();
			newJoint.joint.assign(this.joint);
			return newJoint;
		}

		displayGizmo(pipeline,matrixState) {
			let plist = getGizmo.apply(this,[1]);
			if (plist) {
				matrixState.modelMatrixStack.push();
				let mat = new bg.Matrix4(this.joint.transform);
				matrixState.modelMatrixStack.mult(mat);
				pipeline.draw(plist);
				matrixState.modelMatrixStack.pop();
			}
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			componentData.joint = {};
			this.joint.serialize(componentData.joint);
		}
	}
	
	bg.scene.registerComponent(bg.scene,OutputChainJoint,"bg.scene.OutputChainJoint");
	
})();