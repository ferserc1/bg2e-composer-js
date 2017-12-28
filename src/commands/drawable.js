app.addSource(() => {
    app.drawableCommands = {};

    class LoadFromFile extends app.Command {
        constructor(node,file) {
            super();
            this._node = node;
            this._file = file;
            this._component = null;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._component) {
                    bg.base.Loader.Load(app.ComposerWindowController.Get().gl,this._file)
                        .then((node) => {
                            this._component = node.drawable;
                            this._node.addComponent(this._component);
                            app.render.Scene.Get().selectionManager.prepareNode(this._node);
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        })
                }
                else {
                    this._node.addComponent(this._component);
                    resolve();
                }
            });
        }
        
        undo() {
            return new Promise((resolve,reject) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._component);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }
    }

    app.drawableCommands.LoadFromFile = LoadFromFile;

    class CreateCube extends app.Command {
        constructor(node,w,h,d) {
            super();
            this._node = node;
            this._w = w;
            this._h = h;
            this._d = d;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                if (this._comp) {
                    this._node.addComponent(this._comp);
                }
                else {
                    let ctx = app.ComposerWindowController.Get().gl;
                    this._comp = bg.scene.PrimitiveFactory.Cube(ctx,this._w,this._h,this._d);
                    this._comp.name = bg.utils.generateUUID();
                    this._node.addComponent(this._comp);
                    app.render.Scene.Get().selectionManager.prepareNode(this._node);
                }
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreateCube = CreateCube;

    class CreateSphere extends app.Command {
        constructor(node,r,slices,stacks) {
            super();
            this._node = node;
            this._radius = r;
            this._slices = slices;
            this._stacks = stacks;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                if (this._comp) {
                    this._node.addComponent(this._comp);
                }
                else {
                    let ctx = app.ComposerWindowController.Get().gl;
                    this._comp = bg.scene.PrimitiveFactory.Sphere(ctx,this._radius,this._slices,this._stacks);
                    this._comp.name = bg.utils.generateUUID();
                    this._node.addComponent(this._comp);
                    app.render.Scene.Get().selectionManager.prepareNode(this._node);
                }
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreateSphere = CreateSphere;

    class CreatePlane extends app.Command {
        constructor(node,w,d) {
            super();
            this._node = node;
            this._w = w;
            this._d = d;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                if (this._comp) {
                    this._node.addComponent(this._comp);
                }
                else {
                    let ctx = app.ComposerWindowController.Get().gl;
                    this._comp = bg.scene.PrimitiveFactory.Plane(ctx,this._w,this._d);
                    this._comp.name = bg.utils.generateUUID();
                    this._node.addComponent(this._comp);
                    app.render.Scene.Get().selectionManager.prepareNode(this._node);
                }
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreatePlane = CreatePlane;

    class SetName extends app.Command {
        constructor(drawable,name) {
            super();
            this._drawable = drawable;
            this._name = name;
            this._prevName = drawable.name;
        }

        execute() {
            return new Promise((resolve) => {
                this._drawable.name = this._name;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._drawable.name = this._prevName;
                resolve();
            })
        }
    }

    app.drawableCommands.SetName = SetName;

    function applyTransform(polyList,matrix) {
        let newVertex = [];
        let newNormal = [];
        let rotationMatrix = matrix.rotation;
        for (let i=0; i<polyList.vertex.length; i+=3) {
            let newV = new bg.Vector3(polyList.vertex[i],polyList.vertex[i + 1],polyList.vertex[i + 2]);
            newV = matrix.multVector(newV);
            newVertex.push(newV.x,newV.y,newV.z);

            let newN = new bg.Vector3(polyList.normal[i],polyList.normal[i + 1],polyList.normal[i + 2]);
            newN = rotationMatrix.multVector(newN);
            newN.normalize();
            newNormal.push(newN.x,newN.y,newN.z);
        }
        polyList.vertex = newVertex;
        polyList.normal = newNormal;
        polyList.build();
    }

    class ApplyTransform extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            if (node.drawable && node.transform) {
                this._prevMatrix = new bg.Matrix4(node.transform.matrix);
                this._inverseMatrix = new bg.Matrix4(node.transform.matrix);
                this._inverseMatrix.invert();
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._node.transform && this._node.drawable) {
                    this._node.drawable.forEach((plist) => {
                        applyTransform(plist,this._prevMatrix);
                    });
                    this._node.transform.matrix.identity();
                    resolve();
                }
                else {
                    reject(new Error("The selected node hasn't a transform or drawable node attached."))
                }
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._node.drawable.forEach((plist) => {
                    applyTransform(plist,this._inverseMatrix);
                });
                this._node.transform.matrix.assign(this._prevMatrix);
                resolve();
            })
        }
    }

    app.drawableCommands.ApplyTransform = ApplyTransform;

    class MoveToCenter extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            if (node.drawable && node.transform) {
                this._prevMatrix = new bg.Matrix4(node.transform.matrix);
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._node.drawable && this._node.transform) {
                    let bbox = new bg.tools.BoundingBox(this._node.drawable);
                    this._node.transform.matrix.setPosition(-bbox.center.x,-bbox.center.y,-bbox.center.z);
                    resolve();
                }
                else {
                    reject(new Error("The selected node hasn't a transformm or drawable node attached"));
                }
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.transform.matrix = new bg.Matrix4(this._prevMatrix);
                resolve();
            })
        }
    }

    app.drawableCommands.MoveToCenter = MoveToCenter;
    app.console.registerCommand('moveToCenter','app.drawableCommands.MoveToCenter');

    class PutOnFloor extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            if (node.drawable && node.transform) {
                this._prevMatrix = new bg.Matrix4(node.transform.matrix);
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._node.drawable && this._node.transform) {
                    let bbox = new bg.tools.BoundingBox(this._node.drawable);
                    let curPos = this._node.transform.matrix.position;
                    this._node.transform.matrix.setPosition(curPos.x,-bbox.min.y,curPos.z);
                    resolve();
                }
                else {
                    reject(new Error("The selected node hasn't a transformm or drawable node attached"));
                }
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.transform.matrix = new bg.Matrix4(this._prevMatrix);
                resolve();
            })
        }
    }

    app.drawableCommands.PutOnFloor = PutOnFloor;
})