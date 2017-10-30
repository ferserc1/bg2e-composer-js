app.addSource(() => {
    
        class ViewCommandHandler extends app.CommandHandler {
            getMessages() {
                return [
                    "gizmoSelect",
                    "gizmoTranslate",
                    "gizmoRotate",
                    "gizmoScale",
                    "gizmoTransform",
                    "graphicSettings"
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
        }
    
        new ViewCommandHandler();
    })