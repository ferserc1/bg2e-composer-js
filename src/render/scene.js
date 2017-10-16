app.addDefinitions(() => {
    let g_scene = null;

    class Scene {
        static Get() {
            return g_scene;
        }

        constructor(gl) {
            this.gl = gl;
            g_scene = this;
            this._root = null;
            this._camera = null;
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

        createDefaultScene() {
            // TODO: Import scene file
            this._root = new bg.scene.Node(this.gl,"SceneRoot");

            this._cameraNode = new bg.scene.Node(this.gl, "Main Camera");
            this._root.addChild(this._cameraNode);
    
            this._camera = new bg.scene.Camera();
            this._cameraNode.addComponent(this._camera);
            this._cameraNode.addComponent(new bg.scene.Transform());
            this._cameraNode.addComponent(new bg.manipulation.OrbitCameraController());

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
        }

        init() {
            this.createDefaultScene();
            
        }
    }

    app.Scene = Scene;
})