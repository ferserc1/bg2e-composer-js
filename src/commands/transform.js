app.addSource(() => {
    app.transformCommands = {};

    class Transform extends app.Command {
        constructor(node,matrix,gizmoP) {
            super();
            this._node = node;
            this._matrix = matrix;
            this._gizmoP = gizmoP;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._node.transform) {
                    reject(new Error("Error executing Transform command: no transform component found in the target node"));
                }
                this._oldMatrix = new bg.Matrix4(this._node.transform.matrix);
                this._node.transform.matrix = new bg.Matrix4(this._matrix);
                if (this._redoGizmoP) {
                    this._node.component("bg.manipulation.Gizmo")._gizmoP = this._redoGizmoP;
                }
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.transform.matrix = new bg.Matrix4(this._oldMatrix);
                if (this._node.component("bg.manipulation.Gizmo")) {
                    this._redoGizmoP = new bg.Matrix4(this._node.component("bg.manipulation.Gizmo")._gizmoP);
                    this._node.component("bg.manipulation.Gizmo")._gizmoP = new bg.Matrix4(this._gizmoP);
                }
                resolve();
            });
        }
    }

    app.transformCommands.Transform = Transform;

    class MultMatrix extends app.Command {
        constructor(transform,matrix) {
            super();
            this._transform = transform;
            this._matrix = matrix;
            this._restoreMatrix = new bg.Matrix4(this._transform.matrix);
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._transform.matrix.mult(this._matrix);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._transform.matrix.assign(this._restoreMatrix);
                resolve();
            })
        }
    }

    app.transformCommands.MultMatrix = MultMatrix;

    function placeGizmo(node) {
        let gizmo = node.component("bg.manipulation.Gizmo");
        if (gizmo) {
            let activeCamera = app.render.Scene.Get().camera;
            gizmo.beginDrag(bg.manipulation.GizmoAction.NONE,new bg.Vector2(0,0));
            gizmo.drag(bg.manipulation.GizmoAction.NONE,new bg.Vector2(0,0),new bg.Vector2(0,0),activeCamera);
            gizmo.endDrag(bg.manipulation.GizmoAction.NONE);
        }
    }

    class ResetPosition extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            this._transform = node.transform;
            this._prevMatrix = new bg.Matrix4(node.transform.matrix);
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._transform.matrix.setPosition(0,0,0);
                placeGizmo(this._node);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._transform.matrix = new bg.Matrix4(this._prevMatrix);
                placeGizmo(this._node);
                resolve();
            })
        }
    }

    app.transformCommands.ResetPosition = ResetPosition;

    class ResetRotation extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            this._transform = node.transform;
            this._prevMatrix = new bg.Matrix4(node.transform.matrix);
        }

        execute() {
            return new Promise((resolve,reject) => {
                let scale = this._transform.matrix.getScale();
                this._transform.matrix.setRow(0,new bg.Vector4(1,0,0,0));
                this._transform.matrix.setRow(1,new bg.Vector4(0,1,0,0));
                this._transform.matrix.setRow(2,new bg.Vector4(0,0,1,0));
                this._transform.matrix.scale(scale.x,scale.y,scale.z);
                placeGizmo(this._node);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._transform.matrix = new bg.Matrix4(this._prevMatrix);
                placeGizmo(this._node);
                resolve();
            })
        }
    }

    app.transformCommands.ResetRotation = ResetRotation;

    class ResetScale extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            this._transform = node.transform;
            this._prevMatrix = new bg.Matrix4(node.transform.matrix);
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._transform.matrix.setScale(1,1,1);
                placeGizmo(this._node);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._transform.matrix = new bg.Matrix4(this._prevMatrix);
                placeGizmo(this._node);
                resolve();
            })
        }
    }

    app.transformCommands.ResetScale = ResetScale;

    class Reset extends app.Command {
        constructor(node) {
            super();
            this._node = node;
            this._transform = node.transform;
            this._prevMatrix = new bg.Matrix4(node.transform.matrix);
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._transform.matrix.identity();
                placeGizmo(this._node);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._transform.matrix = new bg.Matrix4(this._prevMatrix);
                placeGizmo(this._node);
                resolve();
            })
        }
    }

    app.transformCommands.Reset = Reset;
})