(function() {

    class SphereCollider extends bg.physics.ColliderShape {
        constructor(radius) {
            super();
            this._radius = radius;

            this._dirtyGizmo = true;
        }

        clone() { return new SphereCollider(this._radius); }

        get radius() { return this._radius; }
        set radius(r) { this._dirtyGizmo = true; this._radius = r; }

        beginSimulation() {
            let pos = new Ammo.btVector3(0,0,0);
            this._impl = new Ammo.btSphereShape(this._radius);
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
                this.radius = jsonData.radius;
                resolve();
            });
        }

        serialize(jsonData,path) {
            return new Promise((resolve) => {
                this._dirtyGizmo = true;
                jsonData.shape = "SphereCollider";
                jsonData.radius = this.radius;
                resolve();
            });
        }

        get dirtyGizmo() {
            return this._dirtyGizmo;
        }

        getGizmoVertexArray() {
            this._dirtyGizmo = false;
            let vertex = [];
            let step = 10;

            for (let i=0; i<360; i+=step) {
                vertex.push(Math.cos(bg.Math.degreesToRadians(i)) * this.radius);
                vertex.push(Math.sin(bg.Math.degreesToRadians(i)) * this.radius);
                vertex.push(0);

                vertex.push(Math.cos(bg.Math.degreesToRadians(i + step)) * this.radius);
                vertex.push(Math.sin(bg.Math.degreesToRadians(i + step)) * this.radius);
                vertex.push(0);
            }

            for (let i=0; i<360; i+=step) {
                vertex.push(0);
                vertex.push(Math.cos(bg.Math.degreesToRadians(i)) * this.radius);
                vertex.push(Math.sin(bg.Math.degreesToRadians(i)) * this.radius);

                vertex.push(0);
                vertex.push(Math.cos(bg.Math.degreesToRadians(i + step)) * this.radius);
                vertex.push(Math.sin(bg.Math.degreesToRadians(i + step)) * this.radius);
            }

            return vertex;
        }
    }

    bg.physics.registerCollider(SphereCollider);
})();