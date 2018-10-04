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
                'showAll3DGizmos',
                'hideAll3DGizmos',
                'showSceneEditor',
                'showModelEditor',
                'showLibraryEditor'
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'gizmoSelect':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SELECT);
                updateGizmoStatus();
                break;
            case 'gizmoTranslate':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSLATE);
                updateGizmoStatus();
                break;
            case 'gizmoRotate':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.ROTATE);
                updateGizmoStatus();
                break;
            case 'gizmoScale':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SCALE);
                updateGizmoStatus();
                break;
            case 'gizmoTransform':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSFORM);
                updateGizmoStatus();
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
            }
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

        showAll3DGizmos() {
            sel().show3DIcon([
                "bg.scene.Camera",
                "bg.scene.Light",
                "bg.manipulation.OrbitCameraController",
                "bg.scene.Collider"
            ]);
        }

        hideAll3DGizmos() {
            sel().hide3DIcon([
                "bg.scene.Camera",
                "bg.scene.Light",
                "bg.manipulation.OrbitCameraController",
                "bg.scene.Collider"
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
    }

    new ViewCommandHandler();
})