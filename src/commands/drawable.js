app.addSource(() => {
    const path = require('path');
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
                            let pathParsed = path.parse(this._file);
                            this._node.name = pathParsed.name;
                            this._component.name = pathParsed.name;
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

    function assertDrawables(nodes) {
        return nodes.every((item) => item.drawable!=null && item.transform!=null);
    }

    class ApplyTransform extends app.Command {
        constructor(nodes) {
            super();
            this._nodes = nodes;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!assertDrawables(this._nodes)) {
                    reject(new Error("Could not apply transform: some items have not transform or drawable components"));
                    return;
                }

                this._prevMatrix = [];
                this._inverseMatrix = [];
                this._nodes.forEach((node,index) => {
                    let prev = new bg.Matrix4(node.transform.matrix);
                    let inv = new bg.Matrix4(node.transform.matrix);
                    inv.invert();
                    this._prevMatrix.push(prev);
                    this._inverseMatrix.push(inv);
                    node.drawable.forEach((plist) => {
                        applyTransform(plist,this._prevMatrix[index]);
                    });
                    node.transform.matrix.identity();
                });
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._nodes.forEach((node,index) => {
                    let prev = this._prevMatrix[index];
                    let inv  = this._inverseMatrix[index];
                    node.drawable.forEach((plist) => {
                        applyTransform(plist,inv);
                    });
                    node.transform.matrix.assign(prev);
                });
                resolve();
            })
        }
    }

    app.drawableCommands.ApplyTransform = ApplyTransform;

    class MoveToCenter extends app.Command {
        constructor(nodes) {
            super();
            this._nodes = nodes;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!assertDrawables(this._nodes)) {
                    reject(new Error("Could not move to center: some items have no transform or drawable components"));
                    return;
                }
                this._prevMatrix = [];
                this._nodes.forEach((node) => {
                    this._prevMatrix.push(new bg.Matrix4(node.transform.matrix));
                    let bbox = new bg.tools.BoundingBox(node.drawable);
                    node.transform.matrix.setPosition(-bbox.center.x,-bbox.center.y,-bbox.center.z);
                });
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodes.forEach((node,index) => {
                    node.transform.matrix = this._prevMatrix[index];
                });
                resolve();
            })
        }
    }

    app.drawableCommands.MoveToCenter = MoveToCenter;
    app.console.registerCommand('moveToCenter','app.drawableCommands.MoveToCenter');

    class PutOnFloor extends app.Command {
        constructor(nodes) {
            super();
            this._nodes = nodes;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!assertDrawables(this._nodes)) {
                    reject(new Error("Could not put on floor: some items have no transform or drawable components"));
                    return;
                }
                this._prevMatrix = [];
                this._nodes.forEach((node) => {
                    this._prevMatrix.push(new bg.Matrix4(node.transform.matrix));
                    let bbox = new bg.tools.BoundingBox(node.drawable);
                    let curPos = node.transform.matrix.position;
                    node.transform.matrix.setPosition(curPos.x,-bbox.min.y,curPos.z);
                });
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodes.forEach((node,index) => {
                    node.transform.matrix = this._prevMatrix[index];
                });
                resolve();
            })
        }
    }

    app.drawableCommands.PutOnFloor = PutOnFloor;

    function centerPivot(node) {

    }

    class CenterPivot extends app.Command {
        constructor(nodes, pivotOnFloor = false) {
            super();
            this._nodes = nodes;
            this._pivotOnFloor = pivotOnFloor;
        }

        execute() {
            return new Promise((resolve) => {
                if (!assertDrawables(this._nodes)) {
                    reject(new Error("Could not put on floor: some items have no transform or drawable components"));
                    return;
                }
                this._prevMatrix = [];
                this._prevDrawables = [];

                this._nodes.forEach((node) => {
                    this._prevMatrix.push(new bg.Matrix4(node.transform.matrix));
                    this._prevDrawables.push(node.drawable);

                    let bbox = new bg.tools.BoundingBox(node.drawable);
                    let curPos = node.transform.matrix.position;
                    let applyMatrix = bg.Matrix4.Identity();
                    let trxPos = null;
                    if (this._pivotOnFloor) {
                        trxPos = [-bbox.center.x,-bbox.min.y,-bbox.center.z];
                    }
                    else {
                        trxPos = [-bbox.center.x,-bbox.center.y,-bbox.center.z]
                    }
                    applyMatrix.translate(trxPos[0],trxPos[1],trxPos[2]);

                    node.drawable.forEach((plist) => {
                        applyTransform(plist,applyMatrix);
                    });
                    node.transform.matrix.translate(-trxPos[0],-trxPos[1],-trxPos[2]);

                    centerPivot(node)
                });
                
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodes.forEach((node,index) => {
                    node.transform.matrix = this._prevMatrix[index];
                    node.addComponent(this._prevDrawables[index]);
                });
                resolve();
            })
        }
    }

    app.drawableCommands.CenterPivot = CenterPivot;
})