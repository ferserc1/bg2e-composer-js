
app.addDefinitions(() => {
    let g_windowController = null;

    class ComposerWindowController extends bg.app.WindowController {
        static Get() {
            return g_windowController;
        }

        constructor() {
            super();
            g_windowController = this;
        }

        get scene() { return this._scene; }
    
        init() {
            bg.Engine.Set(new bg.webgl1.Engine(this.gl));

            this._scene = new app.Scene(this.gl);
            this.scene.init();

            this._renderer = bg.render.Renderer.Create(
                this.gl,
                bg.render.RenderPath.FORWARD
            );
            this._renderer.clearColor = new bg.Color(0.2,0.4,0.7,1);
    
            this._inputVisitor = new bg.scene.InputVisitor();
        }
    
        frame(delta) {
            this._renderer.frame(this.scene.root, delta);
        }
    
        display() {
            this._renderer.display(this.scene.root, this.scene.camera);
        }
    
        reshape(width,height) {
            this.scene.camera.viewport = new bg.Viewport(0,0,width,height);
            this.scene.camera.projection.perspective(60,this.scene.camera.viewport.aspectRatio,0.1,100);
        }
    
        keyDown(evt) { this._inputVisitor.keyDown(this.scene.root, evt); }  
        keyUp(evt) { this._inputVisitor.keyDown(this.scene.root, evt); }
        mouseUp(evt) { this._inputVisitor.mouseUp(this.scene.root, evt); }
        mouseDown(evt) { this._inputVisitor.mouseDown(this.scene.root, evt); }
        mouseMove(evt) { this._inputVisitor.mouseMove(this.scene.root, evt); }
        mouseOut(evt) { this._inputVisitor.mouseOut(this.scene.root, evt); }
        mouseDrag(evt) { this._inputVisitor.mouseDrag(this.scene.root, evt); }
        mouseWheel(evt) { this._inputVisitor.mouseWheel(this.scene.root, evt); }
        touchStart(evt) { this._inputVisitor.touchStart(this.scene.root, evt); }
        touchMove(evt) { this._inputVisitor.touchMove(this.scene.root, evt); }
        touchEnd(evt) { this._inputVisitor.touchEnd(this.scene.root, evt); }
    }

    app.ComposerWindowController = ComposerWindowController;
})