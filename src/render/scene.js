app.addDefinitions(() => {
    let g_scene = null;

    function registerPlugins() {
        bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
        bg.base.Loader.RegisterPlugin(new bg.base.Bg2LoaderPlugin());
        bg.base.Loader.RegisterPlugin(new bg.base.OBJLoaderPlugin());
    }

    class Scene {
        static Get() {
            return g_scene;
        }

        constructor(gl) {
            g_scene = this;
            this.gl = gl;
            this._root = null;
            this._camera = null;
            this._selectionManager = new app.render.SelectionManager(this);
            this._selectionController = new app.render.SelectionController(this,this._selectionManager);
        }

        get root() {
            return this._root;
        }

        get camera() {
            return this._camera;
        }

        get isValid() {
            return this._root && this._camera;
        }

        get selectionManager() {
            return this._selectionManager;
        }

        get selectionController() {
            return this._selectionController;
        }

        createDefaultScene() {
            // TODO: Import scene file
            this._root = new bg.scene.Node(this.gl,"SceneRoot");

            this._cameraNode = new bg.scene.Node(this.gl, "Main Camera");
            this._root.addChild(this._cameraNode);
    
            this._camera = new bg.scene.Camera();
            this._cameraNode.addComponent(this._camera);
            this._cameraNode.addComponent(new bg.scene.Transform());
            let cameraController = new bg.manipulation.OrbitCameraController();
            cameraController._minX = -Number.MAX_VALUE;
            cameraController._maxX =  Number.MAX_VALUE;
            cameraController._minY = -Number.MAX_VALUE;
            cameraController._maxY =  Number.MAX_VALUE;
            cameraController._minZ = -Number.MAX_VALUE;
            cameraController._maxZ =  Number.MAX_VALUE;
            cameraController.maxPitch = 90;
            cameraController.minPitch = -90;
            cameraController.maxDistance = Number.MAX_VALUE;
            this._cameraNode.addComponent(cameraController);

            let lightNode = new bg.scene.Node(this.gl);
            this._root.addChild(lightNode);
    
            lightNode.addComponent(new bg.scene.Light(new bg.base.Light(this.gl)));
            lightNode.addComponent(new bg.scene.Transform(
                new bg.Matrix4.Identity()
                    .translate(0,0,5)
                    .rotate(bg.Math.degreesToRadians(15),0,1,0)
                    .rotate(bg.Math.degreesToRadians(55),-1,0,0)
                    .translate(0,1.4,3)
            ));

            let floorNode = new bg.scene.Node(this.gl);
            this._root.addChild(floorNode);
            floorNode.addComponent(bg.scene.PrimitiveFactory.Plane(this.gl,10));
            floorNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,-1,0)));

            this.selectionManager.initScene(this.root);
        }

        init() {
            registerPlugins.apply(this);

            this.createDefaultScene();

            this.selectionController.init();
        }
    }

    app.render = app.render || {};
    app.render.Scene = Scene;
})