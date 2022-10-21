(function() {
    
    class BoxCollider extends bg.physics.ColliderShape {
        constructor(width,height,depth) {
            super();
            this._width = width;
            this._height = height;
            this._depth = depth;

            this._dirtyGizmo = true;
        }

        clone() {
            return new BoxCollider(this._width,this._height,this._depth);
        }

        get width() { return this._width; }
        get height() { return this._height; }
        get depth() { return this._depth; }
        set width(value) { this._dirtyGizmo = true; this._width = value; }
        set height(value) { this._dirtyGizmo = true; this._height = value; }
        set depth(value) { this._dirtyGizmo = true; this._depth = value; }

        beginSimulation() {
            this._impl = new Ammo.btBoxShape(new Ammo.btVector3(
                this.width / 2, this.height / 2, this.depth / 2
            ));
            return this._impl;
        }

        endSimulation() {
            if (this._impl) {
                Ammo.destroy(this._impl);
                this._impl = null;
            }
        }

        deserialize(jsonData,path) {
            return new Promise((resolve) => {
                this.width = jsonData.size[0];
                this.height = jsonData.size[1];
                this.depth = jsonData.size[2];
                resolve();
            });
        }

        serialize(jsonData,path) {
            return new Promise((resolve) => {
                jsonData.shape = "BoxCollider";
                jsonData.size = [this._width,this._height,this._depth];
                resolve();
            });
        }

        get dirtyGizmo() {
            return this._dirtyGizmo;
        }

        getGizmoVertexArray() {
            this._dirtyGizmo = false;
            let x = this.width / 2;
            let y = this.height / 2;
            let z = this.depth / 2;
            return [
                // back face
                -x,-y,-z, x,-y,-z, x,-y,-z, x,y,-z, x,y,-z, -x,y,-z, -x,y,-z, -x,-y,-z,

                // front face
                -x,-y,z, x,-y,z, x,-y,z, x,y,z, x,y,z, -x,y,z, -x,y,z, -x,-y,z,

                // edges from back to front face
                -x,-y,-z, -x,-y,z,
                x,-y,-z, x,-y,z,
                x,y,-z, x,y,z,
                -x,y,-z, -x,y,z
            ];
        }
    }

    bg.physics.registerCollider(BoxCollider);
})();