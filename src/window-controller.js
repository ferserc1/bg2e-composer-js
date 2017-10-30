
app.addDefinitions(() => {
    let g_windowController = null;

    app.RenderPath = {
        FORWARD: 0,
        DEFERRED: 1
    };


    function assertProperty(collection,property,defaultValue) {
        if (collection[property]===undefined) {
            collection[property] = defaultValue;
        }
    }

    function applyRenderSettings() {
        let renderer = this.highQualityRenderer;

        // antialiasing:
        renderer.settings.antialiasing.enabled = this.renderSettings.antialiasing;

        // raytracer
        switch (this.renderSettings.raytracerQuality) {
        case 'low':
            renderer.settings.raytracer.quality = bg.render.RaytracerQuality.low;
            break;
        case 'mid':
            renderer.settings.raytracer.quality = bg.render.RaytracerQuality.mid;
            break;
        case 'high':
            renderer.settings.raytracer.quality = bg.render.RaytracerQuality.high;
            break;
        case 'extreme':
            renderer.settings.raytracer.quality = bg.render.RaytracerQuality.extreme;
            break;
        }

        renderer.settings.ambientOcclusion.kernelSize = this.renderSettings.ssaoSamples;
        renderer.settings.ambientOcclusion.blur = this.renderSettings.ssaoBlur;
        renderer.settings.ambientOcclusion.enabled = this.renderSettings.ssaoEnabled;
        renderer.settings.ambientOcclusion.sampleRadius = this.renderSettings.ssaoRadius;
        renderer.settings.ambientOcclusion.maxDistance = this.renderSettings.ssaoMaxDistance;
    }

    class ComposerWindowController extends bg.app.WindowController {
        static Get() {
            return g_windowController;
        }

        constructor() {
            super();
            g_windowController = this;
            this._renderPath = app.settings.has("graphics.renderPath") ? app.settings.get("graphics.renderPath") : app.RenderPath.FORWARD;
            this._renderers = [null,null];
            this._renderSettings = app.settings.has("graphics.renderSettings") ? app.settings.get("graphics.renderSettings") : {};
            
            // Assert that all the render settings properties are present
            assertProperty(this._renderSettings,'antialiasing',false);
            assertProperty(this._renderSettings,'raytracerQuality','extreme');
            assertProperty(this._renderSettings,'ssaoSamples',16);
            assertProperty(this._renderSettings,'ssaoBlur',4);
            assertProperty(this._renderSettings,'ssaoEnabled',true);
            assertProperty(this._renderSettings,'ssaoRadius',0.4);
            assertProperty(this._renderSettings,'ssaoMaxDistance',100);
        }

        get scene() { return this._scene; }

        get renderSettings() {
            return this._renderSettings;
        }

        set renderSettings(rs) {
            this._renderSettings = rs;
            app.settings.set("graphics.renderSettings",rs);
            applyRenderSettings.apply(this);
        }

        saveRenderSettings() {
            app.settings.set("graphics.renderSettings",this._renderSettings);
            applyRenderSettings.apply(this);
        }

        get renderer() {
            return this._renderers[this._renderPath];
        }

        get renderPath() {
            return this._renderPath;
        }

        set renderPath(rp) {
            this._renderPath = rp;
            app.settings.set("graphics.renderPath",rp);
        }

        get highQualityRenderer() {
            return this._renderers[app.RenderPath.DEFERRED];
        }

        get lowQualityRenderer() {
            return this._renderers[app.RenderPath.FORWARD];
        }

        get supportHighQualityRender() {
            return this._renderers[app.RenderPath.DEFERRED].constructor == bg.render.DeferredRenderer;
        }
    
        init() {
            bg.Engine.Set(new bg.webgl1.Engine(this.gl));

            this._scene = new app.render.Scene(this.gl);
            this.scene.init();

            this._renderers[app.RenderPath.FORWARD] = bg.render.Renderer.Create(this.gl,bg.render.RenderPath.FORWARD);
            this._renderers[app.RenderPath.DEFERRED] = bg.render.Renderer.Create(this.gl,bg.render.RenderPath.DEFERRED);
            this._renderers.forEach((rend) => rend.clearColor = new bg.Color(0.2,0.4,0.7,1));
            applyRenderSettings.apply(this);
    
            this._inputVisitor = new bg.scene.InputVisitor();
        }
    
        frame(delta) {
            this.renderer.frame(this.scene.root, delta);
        }
    
        display() {
            this.renderer.display(this.scene.root, this.scene.camera);
            this.scene.selectionController.drawGizmos();
        }
    
        reshape(width,height) {
            this.scene.camera.viewport = new bg.Viewport(0,0,width,height);
            this.scene.camera.projection.perspective(60,this.scene.camera.viewport.aspectRatio,0.1,100);
        }
    
        keyDown(evt) { this._inputVisitor.keyDown(this.scene.root, evt); }  
        keyUp(evt) { this._inputVisitor.keyDown(this.scene.root, evt); }

        mouseUp(evt) {
            this.scene.selectionController.mouseUp(evt);
            this._inputVisitor.mouseUp(this.scene.root, evt);
        }

        mouseDown(evt) {
            if (!this.scene.selectionController.mouseDown(evt)) {
                this._inputVisitor.mouseDown(this.scene.root, evt);
            }
        }

        mouseDrag(evt) {
            if (!this.scene.selectionController.mouseDrag(evt)) {
                this._inputVisitor.mouseDrag(this.scene.root, evt);
            }
        }

        mouseMove(evt) { this._inputVisitor.mouseMove(this.scene.root, evt); }

        mouseOut(evt) { this._inputVisitor.mouseOut(this.scene.root, evt); }
        mouseWheel(evt) { this._inputVisitor.mouseWheel(this.scene.root, evt); }
        touchStart(evt) { this._inputVisitor.touchStart(this.scene.root, evt); }
        touchMove(evt) { this._inputVisitor.touchMove(this.scene.root, evt); }
        touchEnd(evt) { this._inputVisitor.touchEnd(this.scene.root, evt); }
    }

    app.ComposerWindowController = ComposerWindowController;
})