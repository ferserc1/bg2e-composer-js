
app.addDefinitions(() => {
    let g_windowController = null;

    class ComposerWindowController extends bg.app.WindowController {
        static Get() {
            return g_windowController;
        }

        constructor() {
            super();
            g_windowController = this;

            app.addMenuHandler('openFile',(event,args) => {
                const {dialog} = require('electron').remote;
                
                let filePath = dialog.showOpenDialog({ properties: ['openFile']});
                if (filePath && filePath.length>0) {
                    bg.base.Loader.Load(this.gl,filePath[0])
                        .then((node) => {
                            this._sceneRoot.addChild(node);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            });
        }
    /*
        buildScene() {
            bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
            bg.base.Loader.RegisterPlugin(new bg.base.Bg2LoaderPlugin());
            bg.base.Loader.RegisterPlugin(new bg.base.OBJLoaderPlugin());
    
            this._sceneRoot = new bg.scene.Node(this.gl,"Scene Root");
    
            this.createObjects();
            this.createLight();
            this.createCamera();
        }
    
        createObjects() {
            let floorNode = new bg.scene.Node(this.gl);
            this._sceneRoot.addChild(floorNode);
            floorNode.addComponent(bg.scene.PrimitiveFactory.Plane(this.gl,10));
            floorNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,-1,0)));
        }
    
        createLight() {
            let lightNode = new bg.scene.Node(this.gl);
            this._sceneRoot.addChild(lightNode);
    
            lightNode.addComponent(new bg.scene.Light(new bg.base.Light(this.gl)));
            lightNode.addComponent(new bg.scene.Transform(
                new bg.Matrix4.Identity()
                    .translate(0,0,5)
                    .rotate(bg.Math.degreesToRadians(15),0,1,0)
                    .rotate(bg.Math.degreesToRadians(55),-1,0,0)
                    .translate(0,1.4,3)
            ));
        }
    
        createCamera() {
            let cameraNode = new bg.scene.Node(this.gl, "Main Camera");
            this._sceneRoot.addChild(cameraNode);
    
            this._camera = new bg.scene.Camera();
            cameraNode.addComponent(this._camera);
            cameraNode.addComponent(new bg.scene.Transform());
            cameraNode.addComponent(new bg.manipulation.OrbitCameraController());
        }
        */

        get scene() { return this._scene; }
    
        init() {
            bg.Engine.Set(new bg.webgl1.Engine(this.gl));

            this._scene = new app.Scene(this.gl);
    
            //this.buildScene();
    
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
            this.scene.camera.projection.perspective(60,scene.camera.viewport.aspectRatio,0.1,100);
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