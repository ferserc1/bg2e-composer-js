(function() {

    class PBRForwardRenderLayer extends bg.render.ForwardRenderLayer {
        constructor(context,opacityLayer) {
            super(context,opacityLayer);

            this._pipeline.effect = new bg.base.PBRForwardEffect(context);
        }

        draw(renderQueue,scene,camera) {
            super.draw(renderQueue,scene,camera);
        }

        willDraw(scene,camera) {
            super.willDraw(scene,camera);
        }

        performDraw(renderQueue,scene,camera) {
            super.performDraw(renderQueue,scene,camera);
        }
    }

    bg.render.PBRForwardRenderLayer = PBRForwardRenderLayer;
})();