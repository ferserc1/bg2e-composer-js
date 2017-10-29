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
        if (!node.component("bg.manipulation.Selectable")) {
            node.addComponent(new bg.manipulation.Selectable());
        }
    }

    class MakeSelectableVisitor extends bg.scene.NodeVisitor {
        visit(node) {
            prepareNode(node);
        }
    };

    function checkSelected(node) {

    }

    class SelectionManager {
        constructor(scene) {
            this._scene = scene;
            this._selectionItems = [];
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
        
        selectItem(node,plist,material) {
            if (!material.selectMode) {
                material.selectMode = true;
                this._selectionItems.push(new SelectionItem(node,plist,material));
                checkSelected.apply(node);
                return true;
            }
            else {
                this.deselectItem(node,plist,material);
                return false;
            }
        }

        deselectItem(node,plist,material) {
            material.selectMode = false;
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
            checkSelected.apply(node);
        }

        clear() {
            this._selectionItems.forEach((item) => {
                item.material.selectMode = false;
            });
            this._selectionItems = [];
        }
    }

    app.render = app.render || {};
    app.render.SelectionManager = SelectionManager;
})