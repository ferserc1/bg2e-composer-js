app.addSource(() => {
    app.render = app.render || {};

    let g_unifiedPath = "data/unified_gizmo.bg2";
    let g_translatePath = "data/translate_gizmo.bg2";
    let g_rotatePath = "data/rotate_gizmo.bg2";
    let g_scalePath = "data/scale_gizmo.bg2";

    let g_mode = bg.manipulation.GizmoMode.SELECT;
    let g_gizmoObservers = [];

    class Gizmo extends bg.manipulation.MultiModeGizmo {
        static SetMode(mode) {
            g_gizmoObservers.forEach((gizmo) => {
                gizmo.mode = mode;
            });
            g_mode = mode;
        }

        constructor() {
            super(g_unifiedPath, g_translatePath, g_rotatePath, g_scalePath);
            g_gizmoObservers.push(this);
            this._mode = g_mode;
            switch (this._mode) {
            case bg.manipulation.GizmoMode.SELECT:
                this._gizmoPath = "";
                break;
            case bg.manipulation.GizmoMode.TRANSLATE:
                this._gizmoPath = g_translatePath;
                break;
            case bg.manipulation.GizmoMode.ROTATE:
                this._gizmoPath = g_rotatePath;
                break;
            case bg.manipulation.GizmoMode.SCALE:
                this._gizmoPath = g_scalePath;
                break;
            case bg.manipulation.GizmoMode.TRANSFORM:
                this._gizmoPath = g_unifiedPath;
                break;
            }
        }


    }

    bg.scene.registerComponent(app.render,Gizmo,"bg.manipulation.Gizmo");
    app.render.Gizmo = Gizmo;

})