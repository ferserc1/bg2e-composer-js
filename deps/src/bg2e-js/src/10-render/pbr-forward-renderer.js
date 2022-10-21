(function() {

    class PBRForwardRenderer extends bg.render.ForwardRenderer {
        constructor(context) {
            super(context);
        }

        create() {
            let ctx = this.context;

            this._transparentLayer = new bg.render.PBRForwardRenderLayer(this.context,bg.base.OpacityLayer.TRANSPARENT);
            this._opaqueLayer = new bg.render.PBRForwardRenderLayer(this.context,bg.base.OpacityLayer.OPAQUE);

            this._shadowMap = new bg.base.ShadowMap(ctx);
			this._shadowMap.size = new bg.Vector2(2048);

			this.settings.shadows.cascade = bg.base.ShadowCascade.NEAR;

			this._renderQueueVisitor = new bg.scene.RenderQueueVisitor
        }

        display(sceneRoot,camera) {
            this._opaqueLayer.pipeline.effect.colorCorrection = this._settings.colorCorrection;
            this._transparentLayer.pipeline.effect.colorCorrection = this._settings.colorCorrection;
            let renderSkybox = false;
            let sceneEnvironment = bg.scene.Environment.Get();
            if (sceneEnvironment && sceneEnvironment.environment) {
                sceneEnvironment.environment.update(camera);
            }

            if (sceneEnvironment && sceneEnvironment.environment && sceneEnvironment.environment.showSkybox) {
                renderSkybox = true;
                sceneEnvironment.environment.renderSkybox(camera);
            }

            if (renderSkybox) {
                this._opaqueLayer.pipeline.buffersToClear = bg.base.ClearBuffers.DEPTH;
            }
            else {
                this._opaqueLayer.pipeline.buffersToClear = bg.base.ClearBuffers.COLOR_DEPTH;
            }
            super.draw(sceneRoot,camera);
		}
    }

    bg.render.PBRForwardRenderer = PBRForwardRenderer;
})();