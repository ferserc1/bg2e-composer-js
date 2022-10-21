(function() {

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

	
	function getAnchorGizmo(context) {
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
			this._gizmo = buildPlist(context,vertex,color);
		}
		return this._gizmo;
    }
    
    class AnchorPoint {
        constructor(o, r) {
            if (o instanceof bg.Vector3) {
                this._offset = new bg.Vector3(o);
            }
            else {
                this._offset = new bg.Vector3(0,0,0);  
            }

            if (typeof(r) == "number") {
                this._radius = r;
            }
            else {
                this._radius = 0.15;
            }
        }

        clone() {
            return new AnchorPoint(this._offset, this._radius);
        }

        get offset() { return this._offset; }
        set offset(o) { this._offset = o; }

        get radius() { return this._radius; }
        set radius(r) { this._radius = r; }

        displayGizmo(ctx,pipeline,matrixState) {
            let plist = getAnchorGizmo.apply(this,[ctx]);
            if (plist) {
                matrixState.modelMatrixStack.push();
                let mat = bg.Matrix4.Translation(this.offset.x,this.offset.y,this.offset.z);
                matrixState.modelMatrixStack.mult(mat);
                pipeline.draw(plist);
                matrixState.modelMatrixStack.pop();
            }
        }

        serialize() {
            return {
                offset: this._offset.toArray(),
                radius: this._radius
            };
        }

        deserialize(jsonData) {
            if (jsonData.offset) {
                this._offset = new bg.Vector3(jsonData.offset);
            }
            if (typeof(jsonData.radius) == "number") {
                this._radius = jsonData.radius;
            }
            else if (typeof(jsonData.radius) == "string") {
                this._radius = Number(jsonData.radius);
            }
        }
    }

    bg.scene.AnchorPoint = AnchorPoint;

    class AnchorJoint extends bg.scene.Component {
        constructor() {
            super();

            this._anchors = [];
        }

        clone() {
            let result = new AnchorJoint();
            this.anchors.forEach((a) => {
                result.anchors.push(a.clone());
            });
            return result;
        }

        get anchors() { return this._anchors; }

        addPoint(x, y, z, radius = 0.15) {
            let anchorPoint = new bg.scene.AnchorPoint(new bg.Vector3(x,y,z), radius)
            this.anchors.push(anchorPoint);
            return anchorPoint;
        }

        getWorldPositionAnchors() {
            let result = [];
            let worldMatrix = bg.scene.Transform.WorldMatrix(this);
            
            this.anchors.forEach((a) => {
                let trxPos = worldMatrix.multVector(new bg.Vector3(a.offset.x, a.offset.y, a.offset.z));
                result.push({
                    position: [
                        trxPos.x,
                        trxPos.y,
                        trxPos.z
                    ],
                    radius: a.radius,
                    component: this
                });
            })
            return result;
        }

        displayGizmo(pipeline,matrixState) {
            this.anchors.forEach((a) => a.displayGizmo(this.node.context,pipeline,matrixState));
        }

        serialize(componentData,promises,url) {
            super.serialize(componentData,promises,url);

            componentData.anchors = [];
            this.anchors.forEach((a) => {
                componentData.anchors.push(a.serialize());
            });
        }

        deserialize(context,jsonData,url) {
            this._anchors = [];
            jsonData.anchors.forEach((a) => {
                let anchor = new AnchorPoint();
                anchor.deserialize(a);
                this._anchors.push(anchor);
            });
        }
    }

    bg.scene.registerComponent(bg.scene,AnchorJoint,"bg.scene.AnchorJoint");

})();
