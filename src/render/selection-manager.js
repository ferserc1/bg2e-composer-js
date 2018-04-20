app.addDefinitions(() => {
    class SelectionItem {
        constructor(node,plist,material) {
            this._node = node;
            this._plist = plist;
            this._material = material;
        }

        get node() { return this._node; }
        get plist() { return this._plist; }
        get material() { return this._material; }
    }

    function getGizmo() {
        let gizmo = new app.render.Gizmo();
        return gizmo;
    }

    function prepareNode(node) {
        let context = app.ComposerWindowController.Get().gl;
        node.addComponent(new bg.manipulation.Selectable());
        node.children.forEach((n) => prepareNode(n));
    }

    class MakeSelectableVisitor extends bg.scene.NodeVisitor {
        visit(node) {
            prepareNode(node);
        }
    };

    function checkSelected(node) {
        node.selected = this._selectionItems.some((item) => {
            if (node==item.node) {
                return true;
            }
        });
    }

    function notifySelectionChanged() {
        for (let key in this._observers) {
            this._observers[key](this);
        }
    }

    class SelectionManager {
        constructor(scene) {
            this._scene = scene;
            this._selectionItems = [];
            this._observers = {};
        }

        selectionChanged(observerId,callback) {
            this._observers[observerId] = callback;
        }

        get selection() { return this._selectionItems; }
        get selectedItem() { return this._selectionItems.length ? this._selectionItems[0] : null; }

        getGizmo() {
            return getGizmo();
        }
        
        prepareNode(node) {
            prepareNode(node);
        }

        initScene(node) {
            if (node) {
                let selectableVisitor = new MakeSelectableVisitor();
                node.accept(selectableVisitor);
            }
        }

        removeGizmos(node = null) {
            if (!node) {
                this.clear();
                node = this._scene.root;
            }

            let gizmo = node.component("bg.manipulation.Gizmo");
            if (gizmo) {
                node.removeComponent(gizmo);
            }
            node.children.forEach((child) => {
                this.removeGizmos(child);
            });
        }
        
        selectItem(node,plist,material,notify=true) {
            // Configure the material editor model, used in library manager
            // to show the material preview
            if (node.drawable) {
                this._scene.materialPreviewModel = node.drawable;
            }

            if (material && !material.selectMode) {
                material.selectMode = true;
                this._selectionItems.push(new SelectionItem(node,plist,material));
                checkSelected.apply(this,[node]);
                if (notify) notifySelectionChanged.apply(this);
                return true;
            }
            else if (material) {
                this.deselectItem(node,plist,material,notify);
                return false;
            }
            else if (!material && !node.selected) {
                this._selectionItems.push(new SelectionItem(node,null,null));
                checkSelected.apply(this,[node]);
                if (notify) notifySelectionChanged.apply(this);
                return true;
            }
            else if (!material && node.selected) {
                this.deselectItem(node,null,null,notify);
                return true;
            }
        }

        selectNode(node) {
            if (node.selected) {
                return this.deselectNode(node);
            }
            else if (node.drawable) {
                node.drawable.forEach((plist,mat) => {
                    if (!mat.selectMode) {
                        this.selectItem(node,plist,mat,false);
                    }
                });
            }
            else {
                this.selectItem(node,null,null,false);
            }
            checkSelected.apply(this,[node]);
            notifySelectionChanged.apply(this);
        }

        deselectNode(node) {
            if (node.drawable) {
                node.drawable.forEach((plist,mat) => {
                    this.deselectItem(node,plist,mat,false);
                });
            }
            else {
                this.deselectItem(node,null,null,false);
            }
            checkSelected.apply(this,[node]);
            notifySelectionChanged.apply(this);
        }

        deselectItem(node,plist,material,notify=true) {
            // Clear the material editor model, used in library manager
            // to show the material preview
            this._scene.materialPreviewModel = null;

            if (material) material.selectMode = false;
            let deselectItemIndex = -1;
            this._selectionItems.some((item,i) => {
                if (item.node==node && item.plist==plist && item.material==material) {
                    deselectItemIndex = i;
                }
                return deselectItemIndex!=-1;
            });
            if (deselectItemIndex!=-1) {
                this._selectionItems.splice(deselectItemIndex,1);
            }
            checkSelected.apply(this,[node]);

            if (notify) notifySelectionChanged.apply(this);
        }

        clear(notify = true) {
            // Clear the material editor model, used in library manager
            // to show the material preview
            this._scene.materialPreviewModel = null;
            this._selectionItems.forEach((item) => {
                if (item.material) item.material.selectMode = false;
                item.node.selected = false;
            });
            this._selectionItems = [];
            if (notify) notifySelectionChanged.apply(this);
        }
    }

    app.render = app.render || {};
    app.render.SelectionManager = SelectionManager;
})