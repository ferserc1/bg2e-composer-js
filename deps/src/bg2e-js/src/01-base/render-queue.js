(function() {

    class RenderQueue {
        constructor() {
            this._opaqueQueue = [];
            this._transparentQueue = [];
            this._worldCameraPosition = new bg.Vector3(0);
        }

        beginFrame(worldCameraPosition) {
            this._opaqueQueue = [];
            this._transparentQueue = [];
            this._worldCameraPosition.assign(worldCameraPosition);
        }

        renderOpaque(plist, mat, trx, viewMatrix) {
            this._opaqueQueue.push({
                plist:plist,
                material:mat,
                modelMatrix:new bg.Matrix4(trx),
                viewMatrix: new bg.Matrix4(viewMatrix)
            });
        }

        renderTransparent(plist, mat, trx, viewMatrix) {
            let pos = trx.position;
            pos.sub(this._worldCameraPosition);
            this._transparentQueue.push({
                plist:plist,
                material:mat,
                modelMatrix:new bg.Matrix4(trx),
                viewMatrix: new bg.Matrix4(viewMatrix),
                cameraDistance: pos.magnitude()
            });
        }

        sortTransparentObjects() {
            this._transparentQueue.sort((a,b) => {
                return a.cameraDistance < b.cameraDistance;
            });
        }

        get opaqueQueue() {
            return this._opaqueQueue;
        }

        get transparentQueue() {
            return this._transparentQueue;
        }


    }

    bg.base.RenderQueue = RenderQueue;
})();