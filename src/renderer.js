
class ComposerWindowController extends bg.app.WindowController {
    constructor() {
        super();
    }

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

    init() {
        bg.Engine.Set(new bg.webgl1.Engine(this.gl));

        this.buildScene();

        this._renderer = bg.render.Renderer.Create(
            this.gl,
            bg.render.RenderPath.FORWARD
        );
        this._renderer.clearColor = new bg.Color(0.2,0.4,0.7,1);

        this._inputVisitor = new bg.scene.InputVisitor();
    }

    frame(delta) {
        this._renderer.frame(this._sceneRoot, delta);
    }

    display() {
        this._renderer.display(this._sceneRoot, this._camera);
    }

    reshape(width,height) {
        this._camera.viewport = new bg.Viewport(0,0,width,height);
        this._camera.projection.perspective(60,this._camera.viewport.aspectRatio,0.1,100);
    }

    keyDown(evt) { this._inputVisitor.keyDown(this._sceneRoot, evt); }  
    keyUp(evt) { this._inputVisitor.keyDown(this._sceneRoot, evt); }
    mouseUp(evt) { this._inputVisitor.mouseUp(this._sceneRoot, evt); }
    mouseDown(evt) { this._inputVisitor.mouseDown(this._sceneRoot, evt); }
    mouseMove(evt) { this._inputVisitor.mouseMove(this._sceneRoot, evt); }
    mouseOut(evt) { this._inputVisitor.mouseOut(this._sceneRoot, evt); }
    mouseDrag(evt) { this._inputVisitor.mouseDrag(this._sceneRoot, evt); }
    mouseWheel(evt) { this._inputVisitor.mouseWheel(this._sceneRoot, evt); }
    touchStart(evt) { this._inputVisitor.touchStart(this._sceneRoot, evt); }
    touchMove(evt) { this._inputVisitor.touchMove(this._sceneRoot, evt); }
    touchEnd(evt) { this._inputVisitor.touchEnd(this._sceneRoot, evt); }
}

function load(canvas) {
    let ctrl = new ComposerWindowController();
    let mainLoop = bg.app.MainLoop.singleton;

    mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
    mainLoop.canvas = canvas;
    mainLoop.run(ctrl);
}