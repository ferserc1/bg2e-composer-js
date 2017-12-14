app.addSource(() => {
    
    function sel() {
        return app.render.Scene.Get().selectionController;
    }

    class ViewCommandHandler extends app.CommandHandler {
        getMessages() {
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
                "showAllIcons",
                "hideAllIcons"
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'gizmoSelect':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SELECT);
                break;
            case 'gizmoTranslate':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSLATE);
                break;
            case 'gizmoRotate':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.ROTATE);
                break;
            case 'gizmoScale':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.SCALE);
                break;
            case 'gizmoTransform':
                app.render.Gizmo.SetMode(bg.manipulation.GizmoMode.TRANSFORM);
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
            case 'showAllIcons':
                this.showAllIcons();
                break;
            case 'hideAllIcons':
                this.hideAllIcons();
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
                .catch((err) => console.log(err));
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
    }

    new ViewCommandHandler();
})