(function() {

    class CubemapCaptureImpl {
		constructor() {
		}

		createCaptureBuffers(context,size) {
			console.log("CubemapCaptureImpl.createCaptureBuffers() not implemented");
		}

		beginRender(context,captureBuffers) {
			console.log("CubemapCaptureImpl.beginRender() not implemented");
        }
        
        beginRenderFace(context,face,captureBuffers,viewMatrix) {
            console.log("CubemapCaptureImpl.renderFace() not implemented");
            return bg.Matrix4.Identity();   // This function must return the projection matrix for the face
        }

        endRenderFace(context,face,captureBuffers) {
            console.log("CubemapCaptureImpl.endRenderFace() not implemented");
        }

		endRender(context,captureBuffers) {
			console.log("CubemapCaptureImpl.endRender() not implemented");
        }

		getTexture(context,captureBuffers) {
			console.log("CubemapCaptureImpl.getTexture() not implemented");
        }
        
        destroy(context,captureBuffers) {
            console.log("CubemapCaptureImpl.destroy() not implemented");
        }
	};

    bg.base.CubemapCaptureImpl = CubemapCaptureImpl;
    
    class CubemapCapture extends bg.app.ContextObject {
        constructor(context) {
            super(context);
            this._captureBuffers = null;
            this._texture = null;
        }

        create(size) {
            this._captureBuffers = bg.Engine.Get().cubemapCapture.createCaptureBuffers(this.context,size);
        }

        // This function does not destroy the textures created with this instance
        // of CubemapCapture
        destroy() {
            if (this._captureBuffers) {
                bg.Engine.Get().cubemapCapture.destroy(this.context,this._captureBuffers);
            }
        }

        get texture() {
            return this._texture;
        }

        updateTexture(renderCB,viewMatrix) {
            let cap = bg.Engine.Get().cubemapCapture;
            cap.beginRender(this.context,this._captureBuffers);

            for (let i=0; i<6; ++i) {
                let matrix = cap.beginRenderFace(this.context,i,this._captureBuffers,viewMatrix);
                renderCB(matrix.projection,matrix.view);
                cap.endRenderFace(this.context,i,this._captureBuffers);
            }

            cap.endRender(this.context,this._captureBuffers);

            if (!this._texture) {
                this._texture = cap.getTexture(this.context,this._captureBuffers);
            }
        }
    }

    bg.base.CubemapCapture = CubemapCapture;
})();