(function() {
    bg.scene = bg.scene || {};

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
        plist.color = color;
        plist.normal = normal;
        plist.texCoord0 = texCoord0;
        plist.index = index;
        plist.drawMode = bg.base.DrawMode.LINES;
        plist.build();
        return plist;
    }

    function getGizmo() {
        if (!this._gizmo && this.shape) {
            let c = new bg.Color(0.4,0.5,1,1);
            let vertex = this.shape.getGizmoVertexArray();
            let color = [];
            vertex.forEach((v) => {
                color.push(c.r);
                color.push(c.b);
                color.push(c.b);
                color.push(c.a);
            })
            this._gizmo = buildPlist(this.node.context,vertex,color);
        }
        return this._gizmo;
    }



    class Collider extends bg.scene.Component {
        constructor(shape) {
            super();
            this._shape = shape;
        }

        get shape() { return this._shape; }

        clone() {
            let c = new Collider((this._shape && this._shape.clone()) || null);
            return c;
        }

        frame(delta) {
            if (!this._shape.node) {
                this._shape.node = this.node;
            }
        }

        displayGizmo(pipeline,matrixState) {
            if (this.shape) {
                if (this.shape.dirtyGizmo) {
                    this._gizmo = null;
                }
                let plist = getGizmo.apply(this);
                if (plist) {
                    pipeline.draw(plist);
                }
            }
        }

        serialize(componentData,promises,url) {
            if (!bg.isElectronApp) {
                return;
            }
            super.serialize(componentData,promises,url);
            if (this._shape) {
                promises.push(new Promise((resolve,reject) => {
                    this._shape.serialize(componentData,url)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                }));
            }
        }

        deserialize(context,sceneData,url) {
            return new Promise((resolve,reject) => {
                bg.physics.ColliderShape.Factory(sceneData,url)
                    .then((shapeInstance) => {
                        this._shape = shapeInstance;
                        resolve();
                    })
            })
        }
    }

    bg.scene.registerComponent(bg.scene,Collider,"bg.scene.Collider");

    // Add collider function to SceneObject and Component prototypes
    Object.defineProperty(bg.scene.SceneObject.prototype,"collider", { get: function() { return this.component("bg.scene.Collider"); }});
    Object.defineProperty(bg.scene.Component.prototype,"collider", { get: function() { return this.component("bg.scene.Collider"); }});

})();