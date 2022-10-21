(function() {

    class ConvexHullCollider extends bg.physics.ColliderShape {
        constructor(margin = 0.01) {
            super();
            this._margin = margin;
            this._vertexData = null;
            this._vertexDataRaw = null;

            this._dirtyGizmo = true;
        }

        get margin() { return this._margin; }
        set margin(m) { this._margin = m; }

        get vertexData() { return this._vertexDataRaw; }
        set vertexData(data) { this._setVertexData(data); }

        clearVertexData() {
            this._vertexData = null;
            this._vertexDataRaw = null;
            this._dirtyGizmo = true;
        }

        setVertexData(data,append=false) {
            this._dirtyGizmo = true;
            if (!append) {
                this._vertexData = [];
                this._vertexDataRaw = null;
            }
            this._vertexData = this._vertexData || [];
            this._vertexDataRaw = this._vertexDataRaw || [];

            if (data instanceof bg.scene.Drawable) {
                data.forEach((plist) => this.setVertexData(plist));
            }
            else if (data instanceof bg.base.PolyList) {
                this.setVertexData(data.vertex);
            }
            else if (Array.isArray(data)) {
                this._vertexDataRaw = data;
                for (let i = 0; i<data.length; i+=3) {
                    this._vertexData.push(new Ammo.btVector3(data[i],data[i+1],data[i+2]));
                }
            }
        }
        
        rebuildVertexData() {
            if (this.node && this.node.drawable) {
                this.setVertexData(this.node.drawable);
            }
        }

        clone() {
            return new ConvexHullCollider(this._margin);
        }

        beginSimulation() {
            this._impl = new Ammo.btConvexHullShape();
            if (!this._vertexData || this._vertexData.length==0) {
                this.rebuildVertexData();
            }
            this._vertexData.forEach((vert) => this._impl.addPoint(vert));
            this._impl.setMargin(this._margin);
            return this._impl;
        }

        endSimulation() {
            if (this._impl) {
                Ammo.destroy(this._impl);
                this._impl = null;
            }
        }

        destroy() {
            if (this._vertexData) {
                this._vertexData.forEach((vec) => Ammo.destroy(vec));
                this._vertexData = [];
            }
        }

        deserialize(jsonData,path) {
            return new Promise((resolve) => {
                this.margin = jsonData.margin || 0.001;
                this._vertexData = [];
                if (jsonData.vertexData && jsonData.vertexData.length) {
                    for (let i=0; i<jsonData.vertexData.length; i+=3) {
                        this._vertexData.push(new Ammo.btVector3(jsonData.vertexData[i],jsonData.vertexData[i+1],jsonData.vertexData[i+2]));
                    }
                }
                resolve();
            })
        }

        serialize(jsonData,path) {
            return new Promise((resolve) => {
                this._dirtyGizmo = true;
                jsonData.shape = "ConvexHullCollider";
                jsonData.margin = this.margin;
                if (this._vertexData) {
                    jsonData.vertexData = [];
                    this._vertexData.forEach((vert) => {
                        jsonData.vertexData.push(vert.x(),vert.y(),vert.z());
                    });
                }
                resolve();
            })
        }

        get dirtyGizmo() {
            return this._dirtyGizmo;
        }

        getGizmoVertexArray() {
            if (!this._vertexData || this._vertexData.length==0) {
                this.rebuildVertexData();
            }
            let vertexList = [];
            
            if (this._vertexData && this._vertexData.length) {
                this._vertexData.forEach((vert,index) => {
                    if (index<this._vertexData.length-1) {
                        // For every vertex, except the last one
                        let next = this._vertexData[index+1];
                        vertexList.push(vert.x(),vert.y(),vert.z());
                        vertexList.push(next.x(),next.y(),next.z());
                    }
                });
                this._dirtyGizmo = false;
            }

            return vertexList;
        }
    }

    bg.physics.registerCollider(ConvexHullCollider);

})();