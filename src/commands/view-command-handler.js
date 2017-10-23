app.addSource(() => {
    
        class ViewCommandHandler extends app.CommandHandler {
            getMessages() {
                return [
                    "gizmoSelect",
                    "gizmoTranslate",
                    "gizmoRotate",
                    "gizmoScale",
                    "gizmoTransform"
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
                }
            }
        }
    
        new ViewCommandHandler();
    })