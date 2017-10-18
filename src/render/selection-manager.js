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
        let gizmo = new bg.manipulation.PlaneGizmo("data/floor_gizmo.vwglb");
        gizmo.autoPlaneMode = true;
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

    class SelectionManager {
        constructor(scene) {
            this._scene = scene;
            this._selectionItems = [];
        }

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
            material.selectMode = true;
            this._selectionItems.push(new SelectionItem(node,plist,material));
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