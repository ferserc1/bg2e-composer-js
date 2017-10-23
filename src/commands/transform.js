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
})