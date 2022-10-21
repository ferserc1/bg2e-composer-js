(function() {
    bg.tools = bg.tools || {};

    class TextureMergerImpl {
        mergeMaps(context,r,g,b,a) {
            throw new Error("TextureMergerImpl.mergeMaps(): not implemented");
        }

        destroy(ctx) {

            throw new Error("TextureMergerImpl.destroy(): not implemented");
        }
    }
    bg.tools.TextureMergerImpl = TextureMergerImpl;

    class TextureMerger extends bg.app.ContextObject {
        constructor(context) {
            super(context);
            this._mergerImpl = null;
        }

        mergeMaps(r,g,b,a) {
            this._mergerImpl = this._mergerImpl || bg.Engine.Get().createTextureMergerInstance();
            r = (r && r.map) ? r : { map:bg.base.TextureCache.BlackTexture(this.context), channel:0 };
            g = (g && g.map) ? g : { map:bg.base.TextureCache.BlackTexture(this.context), channel:0 };
            b = (b && b.map) ? b : { map:bg.base.TextureCache.BlackTexture(this.context), channel:0 };
            a = (a && a.map) ? a : { map:bg.base.TextureCache.BlackTexture(this.context), channel:0 };

            return this._mergerImpl.mergeMaps(this.context,r,g,b,a);
        }

        destroy() {
            this._mergerImpl.destroy(this.context);
        }
    }

    bg.tools.TextureMerger = TextureMerger;
})();
