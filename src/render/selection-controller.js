app.addDefinitions(() => {
    class SelectionController {
        constructor(scene,selectionManager) {
            this._scene = scene;
            this._selectionManager = selectionManager;
        }

        init() {
            let context = app.ComposerWindowController.Get().gl;
            this._mousePicker = new bg.manipulation.MousePicker(context);
            this._gizmoManager = new bg.manipulation.GizmoManager(context);
            this._selectionHighlight = new bg.manipulation.SelectionHighlight(context);
            this._selectionHighlight.highlightColor = bg.Color.Green();
            this._selectionHighlight.borderColor = 2;
            this._gizmoManager.gizmoOpacity = 0.7;
            this._gizmoNode = null;
            this._gizmoTransform = null;

        }

        drawGizmos() {
            this._gizmoManager.drawGizmos(this._scene.root, this._scene.camera);
            this._selectionHighlight.drawSelection(this._scene.root, this._scene.camera);
        }

        mouseDown(event) {
            this._downPosition = new bg.Vector2(event.x,event.y);
            let result = this._mousePicker.pick(this._scene.root, this._scene.camera, this._downPosition);
            if (result && result.type==bg.manipulation.SelectableType.GIZMO) {
                if (result.node.transform) {
                    this._gizmoTransform = new bg.Matrix4(result.node.transform.matrix);
                }
                this._gizmoManager.startAction(result, this._downPosition);
                return true;
            }
            return false;
        }

        mouseDrag(event) {
            if (this._gizmoManager.working) {
                this._gizmoManager.move(new bg.Vector2(event.x, event.y), this._scene.camera);
                return true;
            }
            return false;
        }

        mouseUp(event) {
            let upPosition = new bg.Vector2(event.x,event.y);

            if (!this._gizmoManager.working && Math.abs(this._downPosition.distance(upPosition))<3) {
                if (this._gizmoNode && this._gizmoNode.component("bg.manipulation.Gizmo")) {
                    this._gizmoNode.removeComponent("bg.manipulation.Gizmo");
                    this._gizmoNode = null;
                    this._selectionManager.clear();
                }
                let result = this._mousePicker.pick(this._scene.root, this._scene.camera, upPosition);
                this._gizmoNode = result && result.node;
                if (result && result.type==bg.manipulation.SelectableType.PLIST)  {
                    if (!this._gizmoNode.component("bg.manipulation.Gizmo") && this._gizmoNode.transform) {
                        let gizmo = this._selectionManager.getGizmo();
                        this._gizmoNode.addComponent(gizmo);
                        gizmo.init();
                        gizmo.visible = true;
                    }
                    this._selectionManager.selectItem(result.node,result.plist,result.material);
                }
            }
            if (this._gizmoManager.working && this._gizmoNode && this._gizmoNode.transform) {
                let trx = this._gizmoNode.transform.matrix;
                this._gizmoNode.transform.matrix = this._gizmoTransform;
                this._gizmoTransform = null;
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.Transform(this._gizmoNode,trx)
                );
            }
            this._gizmoManager.endAction();
        }
    }

    app.render = app.render || {};
    app.render.SelectionController = SelectionController;
})