app.addDefinitions(() => {
    app.ui = app.ui || {};

    let g_dragManager = null;
    class DragManager {
        static Get() {
            if (g_dragManager==null) {
                g_dragManager = new DragManager();
            }
            return g_dragManager;
        }

        dragStart(src) {
            console.log(src);
        }

        dragEnd(dest) {
            console.log(dest);
        }
    }

    app.ui.DragManager = DragManager;
})