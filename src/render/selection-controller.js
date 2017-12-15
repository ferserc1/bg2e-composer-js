app.addDefinitions(() => {
    function clearGizmo() {
        if (this._gizmoNode && this._gizmoNode.component("bg.manipulation.Gizmo")) {
            this._gizmoNode.component("bg.manipulation.Gizmo").visible = false;
        }
    }

    class SelectionController {
        constructor(scene,selectionManager) {
            this._scene = scene;
            this._selectionManager = selectionManager;
            this._observers = {};
        }

        gizmoUpdated(observer,callback) {
            this._observers[observer] = callback;
        }

        notifyGizmoUpdated() {
            for (let key in this._observers) {
                this._observers[key]();
            }
        }

        showIcon(icon) {
            this._gizmoManager.showGizmoIcon(icon);
        }

        hideIcon(icon) {
            this._gizmoManager.hideGizmoIcon(icon);
        }

        getIconVisibility(icon) {
            let visible = false;
            this._gizmoManager.gizmoIcons.some((iconData) => {
                if (iconData.type==icon) {
                    visible = iconData.visible;
                    return true;
                }
            })
            return visible;
        }

        set gizmoIconScale(s) { this._gizmoManager.gizmoIconScale = s; }
        get gizmoIconScale() { return this._gizmoManager.gizmoIconScale; }

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

            this._gizmoManager.loadGizmoIcons([
                { type:'bg.scene.Camera', icon:'gizmo_icon_camera.png' },
                { type:'bg.scene.Light', icon:'gizmo_icon_light_point.png' },
                { type:'bg.scene.Transform', icon:'gizmo_icon_transform.png' },
                { type:'bg.scene.Drawable', icon:'gizmo_icon_drawable.png' }
            ], `templates/${ app.config.templateName }/gizmos`);
            this._gizmoManager.gizmoIconScale = 0.5;

            this._selectionManager.selectionChanged("selectionController",() => {
                if (this._gizmoNode && !this._gizmoNode.selected) {
                    clearGizmo.apply(this);
                }
            });
        }

        drawGizmos() {
            this._gizmoManager.drawGizmos(this._scene.root, this._scene.camera);
            this._selectionHighlight.drawSelection(this._scene.root, this._scene.camera);
        }

        mouseDown(event) {
            if (event.button!=bg.app.MouseButton.LEFT) return;
            this._downPosition = new bg.Vector2(event.x,event.y);
            let result = this._mousePicker.pick(this._scene.root, this._scene.camera, this._downPosition);
            if (result &&
                (result.type==bg.manipulation.SelectableType.GIZMO || result.type==bg.manipulation.SelectableType.GIZMO_ICON))
            {
                if (result.node.transform) {
                    this._gizmoTransform = new bg.Matrix4(result.node.transform.matrix);
                }
                if (result.node.component("bg.manipulation.Gizmo")) {
                    this._gizmoP = new bg.Matrix4(result.node.component("bg.manipulation.Gizmo")._gizmoP);
                }
                this._gizmoManager.startAction(result, this._downPosition);
                return true;
            }
            return false;
        }

        mouseDrag(event) {
            if (this._gizmoManager.working) {
                this._gizmoManager.move(new bg.Vector2(event.x, event.y), this._scene.camera);
                this.notifyGizmoUpdated();
                return true;
            }
            return false;
        }

        mouseUp(event) {
            if (event.button!=bg.app.MouseButton.LEFT) return;
            let upPosition = new bg.Vector2(event.x,event.y);
        
            let result = this._mousePicker.pick(this._scene.root, this._scene.camera, upPosition);
            if (Math.abs(this._downPosition.distance(upPosition))<3 &&
                (!this._gizmoManager.working || (result && result.type==bg.manipulation.SelectableType.GIZMO_ICON)))
            {
                let add = event.event.shiftKey;
                clearGizmo.apply(this);
                if (!add) {
                    this._selectionManager.clear();
                }
                
                this._gizmoNode = result && result.node;
                if (result &&
                    (result.type==bg.manipulation.SelectableType.PLIST || result.type==bg.manipulation.SelectableType.GIZMO_ICON))
                {
                    let selected = this._selectionManager.selectItem(result.node,result.plist,result.material);
                    let selectedItem = this._selectionManager.selectedItem;
                    if (!selected && selectedItem) {
                        this._gizmoNode = selectedItem.node;
                    }

                    if (this._gizmoNode && !this._gizmoNode.component("bg.manipulation.Gizmo") && this._gizmoNode.transform) {
                        let gizmo = this._selectionManager.getGizmo();
                        this._gizmoNode.addComponent(gizmo);
                        gizmo.init();
                        gizmo.visible = true;
                    }
                    else if (this._gizmoNode && this._gizmoNode.component("bg.manipulation.Gizmo") && this._gizmoNode.transform) {
                        this._gizmoNode.component("bg.manipulation.Gizmo").visible = true;
                    }
                }

                // Check if there is no selection and disable the gizmo
                if (this._selectionManager.selection.length==0 && this._gizmoNode) {
                    clearGizmo.apply(this);
                }
            }
            if (this._gizmoManager.working && this._gizmoNode && this._gizmoNode.transform) {
                let trx = this._gizmoNode.transform.matrix;
                this._gizmoNode.transform.matrix = this._gizmoTransform;
                this._gizmoTransform = null;
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.Transform(this._gizmoNode,trx,this._gizmoP)
                );
            }
            this._gizmoManager.endAction();
        }
    }

    app.render = app.render || {};
    app.render.SelectionController = SelectionController;
})