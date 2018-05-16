app.addSource(() => {
    app.physicsCommands = {};

    class SetCollider extends app.Command {
        constructor(node,shape) {
            super();
            this._node = node;
            this._shape = shape;
            if (this._node.collider) {
                this._restoreCollider = this._node.collider;
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.addComponent(new bg.scene.Collider(this._shape));
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.addComponent(this._restoreCollider);
                resolve();
            });
        }
    }

    app.physicsCommands.SetCollider = SetCollider;

    class SetRigidBodyMass extends app.Command {
        constructor(rigidBody,mass) {
            super();
            this._rigidBody = rigidBody;
            this._mass = mass;
            this._prevMass = rigidBody.mass;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._rigidBody.mass = this._mass;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._rigidBody.mass = this._prevMass;
                resolve();
            });
        }
    }

    app.physicsCommands.SetRigidBodyMass = SetRigidBodyMass;

    class SetWorldGravity extends app.Command {
        constructor(world,gravity) {
            super();
            this._world = world;
            this._gravity = new bg.Vector3(gravity);
            this._prevGravity = gravity;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._world.gravity = this._gravity;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._world.gravity = this._prevGravity;
                resolve();
            });
        }
    }

    app.physicsCommands.SetWorldGravity = SetWorldGravity;

    class SetConvexHullGeometry extends app.Command {
        constructor(collider,path) {
            super();
            this._collider = collider;
            this._path = path;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._collider.shape instanceof bg.physics.ConvexHullCollider) {
                    reject(new Error("Invalid collider shape found in collider component."));
                    return;
                }

                let gl = app.ComposerWindowController.Get().gl;
                bg.base.Loader.Load(gl,this._path)
                    .then((node) => {
                        this._undoVertexList = this._collider.shape.vertexData;
                        let visitor = new bg.scene.FindComponentVisitor("bg.scene.Drawable");
                        node.accept(visitor);
                        this._collider.shape.clearVertexData();
                        visitor.result.forEach((node) => {
                            this._collider.shape.setVertexData(node.drawable,true);
                        });
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    })
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._collider.shape.vertexData = this._undoVertexList;
                resolve();
            })
        }
    }

    app.physicsCommands.SetConvexHullGeometry = SetConvexHullGeometry;
})