(function() {
	
	class Transform extends bg.scene.Component {

		static WorldMatrix(nodeOrComp) {
			let node = nodeOrComp;
			if (nodeOrComp instanceof bg.scene.Component) {
				node = nodeOrComp.node;
			}

			if (!node) {
				return bg.Matrix4.Identity();
			}

			let visitor = new bg.scene.TransformVisitor();
			node.acceptReverse(visitor);
			return visitor.matrix;
		}

		constructor(matrix) {
			super();
			
			this._matrix = matrix || bg.Matrix4.Identity();
			this._globalMatrixValid = false;
			this._transformVisitor = new bg.scene.TransformVisitor();
		}
		
		clone() {
			let newTrx = new bg.scene.Transform();
			newTrx.matrix = new bg.Matrix4(this.matrix);
			return newTrx;
		}
		
		get matrix() { return this._matrix; }
		set matrix(m) { this._matrix = m; }

		get globalMatrix() {
			if (!this._globalMatrixValid) {
				this._transformVisitor.clear();
				this.node.acceptReverse(this._transformVisitor);
				this._globalMatrix = this._transformVisitor.matrix;
			}
			return this._globalMatrix;
		}
		
		deserialize(context,sceneData,url) {
			return new Promise((resolve,reject) => {
				if (sceneData.transformStrategy) {
					let str = sceneData.transformStrategy;
					if (str.type=="TRSTransformStrategy") {
						this._matrix
							.identity()
							.translate(str.translate[0],str.translate[1],str.translate[2]);
						switch (str.rotationOrder) {
						case "kOrderXYZ":
							this._matrix
								.rotate(str.rotateX,1,0,0)
								.rotate(str.rotateY,0,1,0)
								.rotate(str.rotateZ,0,0,1);
							break;
						case "kOrderXZY":
							this._matrix
								.rotate(str.rotateX,1,0,0)
								.rotate(str.rotateZ,0,0,1)
								.rotate(str.rotateY,0,1,0);
							break;
						case "kOrderYXZ":
							this._matrix
								.rotate(str.rotateY,0,1,0)
								.rotate(str.rotateX,1,0,0)
								.rotate(str.rotateZ,0,0,1);
							break;
						case "kOrderYZX":
							this._matrix
								.rotate(str.rotateY,0,1,0)
								.rotate(str.rotateZ,0,0,1)
								.rotate(str.rotateX,1,0,0);
							break;
						case "kOrderZYX":
							this._matrix
								.rotate(str.rotateZ,0,0,1)
								.rotate(str.rotateY,0,1,0)
								.rotate(str.rotateX,1,0,0);
							break;
						case "kOrderZXY":
							this._matrix
								.rotate(str.rotateZ,0,0,1)
								.rotate(str.rotateX,1,0,0)
								.rotate(str.rotateY,0,1,0);
							break;
						}
						this._matrix.scale(str.scale[0],str.scale[1],str.scale[2])
					}
				}
				else if (sceneData.transformMatrix) {
					this._matrix = new bg.Matrix4(sceneData.transformMatrix);
				}
				resolve(this);
			});
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			componentData.transformMatrix = this._matrix.toArray();
		}
		
		// The direct render methods will be deprecated soon
		////// Direct render methods
		willDisplay(pipeline,matrixState) {
			if (this.node && this.node.enabled) {
				matrixState.modelMatrixStack.push();
				matrixState.modelMatrixStack.mult(this.matrix);
			}
		}
		
		didDisplay(pipeline,matrixState) {
			if (this.node && this.node.enabled) {
				matrixState.modelMatrixStack.pop();
			}
			this._globalMatrixValid = false;
		}
		////// End direct render methods


		////// Render queue methods
		willUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			if (this.node && this.node.enabled) {
				modelMatrixStack.push();
				modelMatrixStack.mult(this.matrix);
			}
		}

		didUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			if (this.node && this.node.enabled) {
				modelMatrixStack.pop();
			}
			this._globalMatrixValid = false;
		}
		////// End render queue methods
		
	}
	
	bg.scene.registerComponent(bg.scene,Transform,"bg.scene.Transform");
	
})();