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
    
    function getGizmo() {
        if (this.bounds.x != this._gizmoSize.x ||
            this.bounds.y != this._gizmoSize.y ||
            this.bounds.z != this._gizmoSize.z)
        {
            let x = -this.bounds.x / 2;
            let X =  this.bounds.x / 2;
            let y = -this.bounds.y / 2;
            let Y =  this.bounds.y / 2;
            let z = -this.bounds.z / 2;
            let Z =  this.bounds.z / 2;
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
                color.push(this._gizmoColor.r);
                color.push(this._gizmoColor.g);
                color.push(this._gizmoColor.b);
                color.push(this._gizmoColor.a);
            }
            if (!this._gizmo) {
                this._gizmo = buildPlist(this.node.context,vertex,color);
            }
            else {
                this._gizmo.updateBuffer(bg.base.BufferType.VERTEX,vertex);
                this._gizmo.updateBuffer(bg.base.BufferType.COLOR,color);
            }
            this._gizmoScale = new bg.Vector3(this.bounds);
        }
        return this._gizmo;
    }

    class GizmoConstraints extends bg.scene.Component {
        constructor() {
            super();
            this._bounds = new bg.Vector3(1,1,1);
            this._gizmoSize = new bg.Vector3(0,0,0);
            this._gizmoColor = new bg.Color(0.2,0.4,0.95,1.0);
        }

        clone() {
            let c = new bg.manipulation.GizmoConstraints();
            c.bounds.assign(this._bounds);
            return c;
        }

        get bounds() { return this._bounds; } 
        set bounds(b) { this._bounds = b; }

        serialize(componentData,promises,url) {
            super.serialize(componentData,promises,url);
            componentData.bounds = this.bounds.toArray();
        }

        deserialize(context,sceneData,url) {
            if (Array.isArray(sceneData.bounds)) {
                this.bounds = new bg.Vector3(sceneData.bounds);
            }
        }

        displayGizmo(pipeline,matrixState) {
            let plist = getGizmo.apply(this);
            if (plist) {
                pipeline.draw(plist);
            }
        }
    }

    bg.scene.registerComponent(bg.manipulation,GizmoConstraints,"bg.manipulation.GizmoConstraints");

})();