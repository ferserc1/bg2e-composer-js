app.addSource(() => {
    
    function sel() {
        return app.render.Scene.Get().selectionController;
    }

    function updateGizmoStatus() {
        app.ui.Toolbar.Get().setItemStatus('gizmoSelect',app.render.Gizmo.CurrentMode()==bg.manipulation.GizmoMode.SELECT);
        app.ui.Toolbar.Get().setItemStatus('gizmoTranslate',app.render.Gizmo.CurrentMode()==bg.manipulation.GizmoMode.TRANSLATE);
        app.ui.Toolbar.Get().setItemStatus('gizmoRotate',app.render.Gizmo.CurrentMode()==bg.manipulation.GizmoMode.ROTATE);
        app.ui.Toolbar.Get().setItemStatus('gizmoScale',app.render.Gizmo.CurrentMode()==bg.manipulation.GizmoMode.SCALE);
        app.ui.Toolbar.Get().setItemStatus('gizmoTransform',app.render.Gizmo.CurrentMode()==bg.manipulation.GizmoMode.TRANSFORM);
        let currentWorkspace = app.currentWorkspace();
        app.ui.Toolbar.Get().setItemStatus('showSceneEditor', currentWorkspace.endpoint=='/sceneEditor');
        app.ui.Toolbar.Get().setItemStatus('showModelEditor', currentWorkspace.endpoint=='/modelEditor');
        app.ui.Toolbar.Get().setItemStatus('showLibraryEditor', currentWorkspace.endpoint=='/libraryEditor');
        app.ui.Toolbar.Get().updateStatus();
    }


    class ViewCommandHandler extends app.CommandHandler {

        updateToolbarIcons() {
            updateGizmoStatus();
        }

        getMessages() {
            setTimeout(() => {
                updateGizmoStatus();
            }, 1000);

            return [
                "gizmoSelect",
                "gizmoTranslate",
                "gizmoRotate",
                "gizmoScale",
                "gizmoTransform",
                "graphicSettings",
                "toggleCameraIcon",
                "toggleLightIcon",
                "toggleTransformIcon",
                "toggleDrawableIcon",
                "toggleTextRectIcon",
                "showAllIcons",
                "hideAllIcons",
                'toggleCamera3DGizmo',
                'toggleLight3DGizmo',
                'toggleOrbitCameraController3DGizmo',
                'toggleCollider3DGizmo',
                'toggleDrawable3DGizmo',
                'toggleVoxel3DGizmo',
                'showAll3DGizmos',
                'hideAll3DGizmos',
                'showSceneEditor',
                'showModelEditor',
                'showLibraryEditor',
                'zoomAll'
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'gizmoSelect':
                this.setSelectGizmo();
                break;
            case 'gizmoTranslate':
                this.setTranslateGizmo();
                break;
            case 'gizmoRotate':
                this.setRotateGizmo();
                break;
            case 'gizmoScale':
                this.setScaleGizmo();
                break;
            case 'gizmoTransform':
                this.setTransformGizmo();
                break;
            case 'graphicSettings':
                this.graphicSettings(params);
                break;
            case 'toggleCameraIcon':
                this.toggleIcon('bg.scene.Camera');
                break;
            case 'toggleLightIcon':
                this.toggleIcon('bg.scene.Light');
                break;
            case 'toggleTransformIcon':
                this.toggleIcon('bg.scene.Transform');
                break;
            case 'toggleDrawableIcon':
                this.toggleIcon('bg.scene.Drawable');
                break;
            case 'toggleTextRectIcon':
                this.toggleIcon('bg.scene.TextRect');
                break;
            case 'showAllIcons':
                this.showAllIcons();
                break;
            case 'hideAllIcons':
                this.hideAllIcons();
                break;
            case 'toggleCamera3DGizmo':
                this.toggleCamera3DGizmo();
                break;
            case 'toggleLight3DGizmo':
                this.toggleLight3DGizmo();
                break;
            case 'toggleOrbitCameraController3DGizmo':
                this.toggleOrbitCameraController3DGizmo();
                break;
            case 'toggleCollider3DGizmo':
                this.toggleCollider3DGizmo();
                break;
            case 'toggleDrawable3DGizmo':
                this.toggleDrawable3DGizmo();
                break;
            case 'toggleVoxel3DGizmo':
                this.toggleVoxel3DGizmo();
                break;
            case 'showAll3DGizmos':
                this.showAll3DGizmos();
                break;
            case 'hideAll3DGizmos':
                this.hideAll3DGizmos();
                break;
            case 'showSceneEditor':
                this.showSceneEditor();
                updateGizmoStatus();
                break;
            case 'showModelEditor':
                this.showModelEditor();
                updateGizmoStatus();
                break;
            case 'showLibraryEditor':
                this.showLibraryEditor();
                updateGizmoStatus();
                break;
            case 'zoomAll':
                this.zoomAll();
                break;
            }
        }

        setSelectGizmo() {
            app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SELECT);
            updateGizmoStatus();
        }

        setTranslateGizmo() {
            app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSLATE);
            updateGizmoStatus();
        }

        setRotateGizmo() {
            app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.ROTATE);
            updateGizmoStatus();
        }

        setScaleGizmo() {
            app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SCALE);
            updateGizmoStatus();
        }

        setTransformGizmo() {
            app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSFORM);
            updateGizmoStatus();
        }

        graphicSettings(params) {
            app.ui.DialogView.Show({
                templateUrl:`templates/${ app.config.templateName }/directives/graphic-settings-view.html`,
                title:"Graphic settiings",
                showClose: false,
                type: 'modal-right',
                onAccept:() => { return true; }
            })
                .then((s) => {})
                .catch((err) => console.error(err));
        }

        toggleIcon(icon) {
            if (sel().getIconVisibility(icon)) {
                sel().hideIcon(icon);
            }
            else {
                sel().showIcon(icon);
            }
            app.ComposerWindowController.Get().updateView();
        }

        showAllIcons() {
            sel().showIcon("bg.scene.Camera");
            sel().showIcon("bg.scene.Light");
            sel().showIcon("bg.scene.Transform");
            sel().showIcon("bg.scene.Drawable");
            app.ComposerWindowController.Get().updateView();
        }

        hideAllIcons() {
            sel().hideIcon("bg.scene.Camera");
            sel().hideIcon("bg.scene.Light");
            sel().hideIcon("bg.scene.Transform");
            sel().hideIcon("bg.scene.Drawable");
            app.ComposerWindowController.Get().updateView();
        }

        toggleCamera3DGizmo() {
            sel().toggle3DIcon("bg.scene.Camera");
        }

        toggleLight3DGizmo() {
            sel().toggle3DIcon("bg.scene.Light");
        }

        toggleOrbitCameraController3DGizmo() {
            sel().toggle3DIcon("bg.scene.OrbitCameraController");
        }

        toggleCollider3DGizmo() {
            sel().toggle3DIcon("bg.scene.Collider");
        }

        toggleDrawable3DGizmo() {
            sel().toggle3DIcon("bg.scene.Drawable");
        }

        toggleVoxel3DGizmo() {
            sel().toggle3DIcon("bg.scene.Voxel");
            sel().toggle3DIcon("bg.scene.VoxelGrid");
        }

        showAll3DGizmos() {
            sel().show3DIcon([
                "bg.scene.Camera",
                "bg.scene.Light",
                "bg.manipulation.OrbitCameraController",
                "bg.scene.Collider",
                "bg.scene.Drawable",
                "bg.scene.Voxel",
                "bg.scene.VoxelGrid"
            ]);
        }

        hideAll3DGizmos() {
            sel().hide3DIcon([
                "bg.scene.Camera",
                "bg.scene.Light",
                "bg.manipulation.OrbitCameraController",
                "bg.scene.Collider",
                "bg.scene.Drawable",
                "bg.scene.Voxel",
                "bg.scene.VoxelGrid"
            ]);
        }

        showSceneEditor() {
            app.switchWorkspace(app.Workspaces.SceneEditor);
        }

        showModelEditor() {
            app.switchWorkspace(app.Workspaces.ModelEditor);
        }

        showLibraryEditor() {
            app.switchWorkspace(app.Workspaces.LibraryEditor);
        }

        zoomAll() {
            let scene = app.render.Scene.Get();
            let camera = scene.camera;
            let cameraController = camera && camera.component("bg.manipulation.OrbitCameraController");
            if (!cameraController) {
                return;
            }

            let selection = scene.selectionManager.selection;
            let boundingBoxVisitor = new bg.scene.BoundingBoxVisitor();
            let center = [0, 0, 0];
            let distance = 5;
            let min = { x: 0, y: 0, z: 0 };
            let size = { x: 0, y: 0, z: 0 };
            if (selection.length) {
                min = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER, z: Number.MAX_SAFE_INTEGER };
                let max = { x:-Number.MAX_SAFE_INTEGER, y:-Number.MAX_SAFE_INTEGER, z:-Number.MAX_SAFE_INTEGER };
                selection.forEach((selItem) => {
                    let transformVisitor = new bg.scene.TransformVisitor();
                    selItem.node.acceptReverse(transformVisitor);
                    if (selItem.node.drawable) {
                        let bbox = new bg.tools.BoundingBox(selItem.node.drawable, transformVisitor.matrix)
                        min = bbox.min;
                        max = bbox.max;
                    }
                    else {
                        let pos = transformVisitor.matrix.position;
                        min.x = bg.Math.min(pos.x, min.x);
                        min.y = bg.Math.min(pos.y, min.y);
                        min.z = bg.Math.min(pos.z, min.z);
                        max.x = bg.Math.max(pos.x, max.x);
                        max.y = bg.Math.max(pos.y, max.y);
                        max.z = bg.Math.max(pos.z, max.z);
                    }
                });
                size = {
                    x: max.x - min.x,
                    y: max.y - min.y,
                    z: max.z - min.z
                };
            }
            else {
                scene.root.accept(boundingBoxVisitor);
                min = boundingBoxVisitor.min;
                size = boundingBoxVisitor.size;
            }

            center = [
                min.x + size.x / 2,
                min.y + size.y / 2,
                min.z + size.z / 2
            ];
            distance = bg.Math.max(size.x, bg.Math.max(size.y, size.z));

            cameraController.center = new bg.Vector3(center[0], center[1], center[2]);
            cameraController.distance = distance * 2;
            app.ComposerWindowController.Get().postRedisplay();
        }
    }

    new ViewCommandHandler();
})