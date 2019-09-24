app.addDefinitions(() => {
    function clearGizmo() {
        if (this._gizmoNode && this._gizmoNode.component("bg.manipulation.Gizmo")) {
            this._gizmoNode.component("bg.manipulation.Gizmo").visible = false;
        }
    }

    class Gizmo3DVisibilityVisitor extends bg.scene.NodeVisitor {
        constructor(gizmoType,action) {
            super();
            this._gizmoType = Array.isArray(gizmoType) ? gizmoType : [gizmoType];
            this._action = action;
        }

        visit(node) {
            this._gizmoType.forEach((t) => {
                let comp = node.component(t);
                if (comp) {
                    switch (this._action) {
                    case 'show':
                        comp.draw3DGizmo = true;
                        break;
                    case 'hide':
                        comp.draw3DGizmo = false;
                        break;
                    case 'toggle':
                        comp.draw3DGizmo = !comp.draw3DGizmo;
                        break;
                    }
                }
            })
        }
    }


    class SelectionController {
        constructor(scene,selectionManager) {
            this._scene = scene;
            this._selectionManager = selectionManager;
            this._observers = {};

            // Initial 3D gizmo configuration
            this._visible3DGizmos = {
                "bg.scene.Camera": true,
                "bg.scene.Light": true,
                "bg.manipulation.OrbitCameraController": true,
                "bg.scene.Collider": true,
                "bg.scene.Drawable": false,
                "bg.scene.Voxel": true,
                "bg.scene.VoxelGrid": true
            };
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

        is3DIconVisible(icon) {
            return this._visible3DGizmos.indexOf(icon) != -1;
        }

        toggle3DIcon(icon) {
            if (this._visible3DGizmos[icon]) {
                this._visible3DGizmos[icon] = false;
            }
            else {
                this._visible3DGizmos[icon] = true;
            }

            this.updateGizmoVisibility();
        }

        hide3DIcon(icon) {
            if (this._visible3DGizmos[icon]) {
                this._visible3DGizmos[icon] = false;
            }
            this.updateGizmoVisibility();
        }

        show3DIcon(icon) {
            if (!this._visible3DGizmos[icon]) {
                this._visible3DGizmos[icon] = true;
            }
            this.updateGizmoVisibility();
        }

        updateGizmoVisibility() {
            if (!this._scene.sceneRoot) {
                return;
            }

            for (let icon in this._visible3DGizmos) {
                let isVisible = this._visible3DGizmos[icon];
                let v = new Gizmo3DVisibilityVisitor(icon,isVisible ? "show" : "hide");
                this._scene.sceneRoot.accept(v);
            }
            app.ComposerWindowController.Get().updateView();
        }

        getIconVisibility(icon) {
            return this._visible3DGizmos[icon];
        }

        set gizmoIconScale(s) { this._gizmoManager.gizmoIconScale = s; }
        get gizmoIconScale() { return this._gizmoManager.gizmoIconScale; }

        showGizmoForNode(node) {
            clearGizmo.apply(this);
            this._gizmoNode = node;
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

        init() {
            let context = app.ComposerWindowController.Get().gl;
            this._mousePicker = new bg.manipulation.MousePicker(context);
            this._gizmoManager = new bg.manipulation.GizmoManager(context);
            this._selectionHighlight = new bg.manipulation.SelectionHighlight(context);
            this._selectionHighlight.highlightColor = bg.Color.Green();
            this._selectionHighlight.borderColor = 2;
            this._selectionHighlight.drawInvisiblePolyList = true;
            this._gizmoManager.gizmoOpacity = 0.7;
            this._gizmoNode = null;
            this._gizmoTransform = null;

            this._gizmoManager.loadGizmoIcons([
                { type:'bg.scene.Camera', icon:'gizmo_icon_camera.png' },
                { type:'bg.scene.Light', icon:'gizmo_icon_light_point.png' },
                { type:'bg.scene.Transform', icon:'gizmo_icon_transform.png' },
                { type:'bg.scene.Drawable', icon:'gizmo_icon_drawable.png' },
                { type:'bg.scene.TextRect', icon:'gizmo_icon_text_rect.png'}
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