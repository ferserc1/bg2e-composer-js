app.addDefinitions(() => {
    app.ui = app.ui || {};

    let s_dragHandlers = [];
    app.ui.addDragHandler = function(handlerFactory) {
        let HandlerClass = handlerFactory();
        s_dragHandlers.push(new HandlerClass());
    }

    function findDragHandler(src,dst) {
        let result = null;
        s_dragHandlers.some((handler) => {
            if (handler.canDrag(src,dst)) {
                result = handler;
                return true;
            }
        });
        return result;
    }

    class DragHandler {
        canDrag(src,dst) {
            return false;
        }

        drag(src,dst) {
            return Promise.reject();
        }
    }

    app.ui.DragHandler = DragHandler;

    let g_dragManager = null;
    class DragManager {
        static Get() {
            if (g_dragManager==null) {
                g_dragManager = new DragManager();
            }
            return g_dragManager;
        }

        dragStart(src) {
            this._src = src;
        }

        dragEnd(dest) {
            let handler = findDragHandler(this._src,dest);
            if (handler) {
                handler.drag(this._src,dest);
            }
            this._src = null;
        }
    }
    app.ui.DragManager = DragManager;
})