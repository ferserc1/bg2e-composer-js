app.addDefinitions(() => {
    let g_scene = null;

    function registerPlugins() {
        bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
        bg.base.Loader.RegisterPlugin(new bg.base.Bg2LoaderPlugin());
        bg.base.Loader.RegisterPlugin(new bg.base.OBJLoaderPlugin());
        bg.base.Loader.RegisterPlugin(new bg.base.SceneLoaderPlugin());
        
        bg.base.Writer.RegisterPlugin(new bg.base.Bg2WriterPlugin());
        bg.base.Writer.RegisterPlugin(new bg.base.SceneWriterPlugin());

        if (app.fbxPlugin.available) {
            bg.base.Loader.RegisterPlugin(new app.fbxPlugin.FbxLoaderPlugin());
        }
    }

    function sceneWillOpen(oldSceneRoot,newSceneRoot) {
        for (let observerId in this._sceneObservers.willOpen) {
            let observer = this._sceneObservers.willOpen[observerId];
            observer(oldSceneRoot,newSceneRoot);
        }
    }

    function sceneWillClose(oldSceneRoot) {
        let status = true;

        for (let observerId in this._sceneObservers.willClose) {
            let observer = this._sceneObservers.willClose[observerId];
            status = observer(oldSceneRoot);
            if (!status) break;
        }
        
        return status;
    }

    // Return false if the scene have changes and the user want to save it, or
    // if the user press cancel. If the user press Yes, the saveScene command will
    // be triggered, and after that, the nextCommand command will be triggered
    function saveConfirm(nextCommand) {
        let confirm = true;
        if (app.CommandManager.Get().sceneChanged) {
            const {dialog} = require('electron').remote;

            let result = dialog.showMessageBox({
                type:"warning",
                title:"Save changes",
                message:"The scene has changed, ¿do you want to save it before continue?",
                buttons:["Yes","No","Cancel"]
            });

            if (result==0) {
                setTimeout(() => {
                    app.CommandHandler.Trigger('saveScene',{ followingCommand:nextCommand });
                },10);
                return false;
            }
            else if (result==2) {
                return false;
            }
        }
        return true;
    }

    app.render.SceneMode = {
        SCENE:0,
        LIBRARY:1,

        UNDEFINED: null
    };

    /*
    function getSceneLightState(scene) {
        let findVisitor = new bg.scene.FindComponentVisitor("bg.scene.Light");
        scene.accept(findVisitor);
        let lightState = [];
        findVisitor.forEach((lightNode) => {
            lightState.push({
                light: lightNode.light.light,
                enabled: lightNode.light.light.enabled
            });
        });
        return lightState;
    }

    function disableLights(scene) {
        let findVisitor = new bg.scene.FindComponentVisitor("bg.scene.Light");
        scene.accept(findVisitor);
        findVisitor.forEach((lightNode) => {
            lightNode.light.light.enabled = false;
        });
        return lightState;
    }

    function restoreLights(scene,stateData) {
        
    }

    function enableSceneLights() {
        if (this._libraryLights) {
            // TODO: disable library lights
        }
    }

    function enableLibraryLights() {
        this._sceneLightState = getSceneLightState.apply(this,[this._sceneRoot]);
        disableLights.apply(this,[this._sceneRoot]);
        restoreLights.apply(this,[this._libraryRoot,this._libraryLightState]);
    }
    */

    class Scene {
        static Get() {
            return g_scene;
        }

        constructor(gl) {
            g_scene = this;
            this.gl = gl;

            this._root = null;          // Store the current scene root, and will be one of the following nodes:
            this._sceneRoot = null;     // Store the scene mode root
            this._libraryRoot = null;   // Store the library mode root

            this._grid = null;

            this._camera = null;        // Store the current camera, and will be one of the following nodes
            this._sceneCamera = null;   // Store the scene mode camera
            this._libraryCamera = null; // Store the library mode camera

            this._selectionManager = new app.render.SelectionManager(this);
            this._selectionController = new app.render.SelectionController(this,this._selectionManager);

            this._sceneObservers = {
                willOpen:{},
                willClose:{},
                changed:{}
            };
        }

        get ready() {
            return this.root!=null && this.camera!=null;
        }

        setMode(mode) {
            switch (mode) {
            case app.render.SceneMode.SCENE:
                this._root = this._sceneRoot;
                this._camera = this._sceneCamera;
                this._cameraMode = mode;
//                this._enableSceneLights.apply(this);
                break;
            case app.render.SceneMode.LIBRARY:
                this._root = this._libraryRoot;
                this._camera = this._libraryCamera;
                this._cameraMode = mode;
  //              this._enableLibraryLights.apply(this);
                break;
            default:
                console.error("Invalid scene mode");
            }
            app.ComposerWindowController.Get().postReshape();
            app.ComposerWindowController.Get().postRedisplay();
        }

        set materialPreviewModel(model) {
            // The material preview model can only be changed in SCENE mode
            if (this._root==this._sceneRoot) {
                if (model) {
                    this._materialPreviewModel = model.instance("materialPreview");
                    this._materialPreviewModel.forEach((plist,mat) => {
                        mat.copyMaterialSettings(new bg.base.Material(),0xFFFFFFFF);
                    })
                    this._previewNode.addComponent(this._materialPreviewModel);
                }
                else {
                    //if (this._materialPreviewModel) this._materialPreviewModel.destroy();
                    this._materialPreviewModel = null;
                    this._previewNode.addComponent(this._defaultMaterialDrawable);
                }
            }
        }

        get previewNode() { return this._previewNode; }
        get materialPreviewModel() { return this._materialPreviewModel || this._defaultMaterialDrawable; }

        set drawablePreviewModel(model) {
            if (model) {
                this._drawablePreviewModel = model;
                this._previewNode.addComponent(this._drawablePreviewModel);
            }
            else {
                if (this._drawablePreviewModel) this._drawablePreviewModel.destroy();
                this._drawablePreviewModel = null;
                this._previewNode.addComponent(this._materialPreviewModel || this._defaultMaterialDrawable);
            }
        }

        get cameraMode() {
            return this._cameraMode;
        }
        
        get root() {
            return this._root;
        }

        get grid() {
            return this._grid;
        }

        get camera() {
            return this._camera;
        }

        set camera(c) {
            if (this.belongsToScene(c.node)) {
                let currentController = this._sceneCamera && this._sceneCamera.component("bg.manipulation.OrbitCameraController");
                if (currentController) {
                    currentController.enabled = false;
                }
                this._sceneCamera = c;
                currentController = this._sceneCamera && this._sceneCamera.component("bg.manipulation.OrbitCameraController");
                if (currentController) {
                    bg.manipulation.OrbitCameraController.SetUniqueEnabled(currentController,this.root);
                }
                bg.scene.Camera.SetAsMainCamera(this._sceneCamera,this._sceneRoot);
                this.setMode(this.cameraMode);
            }
            else {
                throw new Error("Could not set camera as main: this camera does not belongs to the scene.");
            }
        }

        get isValid() {
            return this.root && this.camera;
        }

        get selectionManager() {
            return this._selectionManager;
        }

        get selectionController() {
            return this._selectionController;
        }

        belongsToScene(node) {
            if (node==null) {
                return false;
            }
            else if (node==this.root) {
                return true;
            }
            else {
                return this.belongsToScene(node.parent);
            }
        }

        // callback(oldSceneRoot,newSceneRoot)
        sceneWillOpen(observerId,callback) {
            this._sceneObservers.willOpen[observerId] = callback;
        }

        // Callback(oldSceneRoot)
        sceneWillClose(observerId,callback) {
            this._sceneObservers.willClose[observerId] = callback;
        }

        sceneChanged(observerId,callback) {
            this._sceneObservers.changed[observerId] = callback;
        }

        notifySceneChanged() {
            for (let observerId in this._sceneObservers.changed) {
                let observer = this._sceneObservers.changed[observerId];
                observer(this.root);
            }
        }

        createCameraController() {
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
            cameraController.rotation.x = 22.5;
            cameraController.rotation.y = 30;
            cameraController.distance = 2.5;
            return cameraController;
        }

        resetLibraryCamera() {
            let ctrl = this._libraryCamera.component("bg.manipulation.OrbitCameraController");
            ctrl.rotation.x = 22.5;
            ctrl.rotation.y = 30;
            ctrl.distance = 2.5;
            ctrl.center = new bg.Vector3();
        }

        createDefaultScene() {
            // TODO: Import scene file
            this._sceneRoot = new bg.scene.Node(this.gl,"SceneRoot");

            this._grid = new app.render.Grid();
            this._sceneRoot.addComponent(this._grid);

            this._cameraNode = new bg.scene.Node(this.gl, "Main Camera");
            this._sceneRoot.addChild(this._cameraNode);
    
            this._sceneCamera = new bg.scene.Camera();
            this._sceneCamera.isMain = true;
            this._cameraNode.addComponent(this._sceneCamera);
            this._cameraNode.addComponent(new bg.scene.Transform());
            let ctrl = this.createCameraController();
            ctrl.distance = 15;
            this._cameraNode.addComponent(ctrl);
            bg.manipulation.OrbitCameraController.SetUniqueEnabled(ctrl,this._sceneRoot);


            let lightNode = new bg.scene.Node(this.gl, "Main Light");
            this._sceneRoot.addChild(lightNode);
    
            lightNode.addComponent(new bg.scene.Light(new bg.base.Light(this.gl)));
            lightNode.addComponent(new bg.scene.Transform(
                bg.Matrix4.Identity()
                    .translate(0,0,5)
                    .rotate(bg.Math.degreesToRadians(15),0,1,0)
                    .rotate(bg.Math.degreesToRadians(55),-1,0,0)
                    .translate(0,1.4,3)
            ));

            let floorNode = new bg.scene.Node(this.gl, "Floor");
            this._sceneRoot.addChild(floorNode);
            floorNode.addComponent(bg.scene.PrimitiveFactory.Plane(this.gl,10));
            floorNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,0,0)));

            this.selectionManager.initScene(this._sceneRoot);
            this.notifySceneChanged();
 //           this._sceneLightState = getSceneLightState.apply(this,[this._sceneRoot]);
        }

        createLibraryScene() {
            this._libraryRoot = new bg.scene.Node(this.gl,"LibraryRoot");

            this._libraryCameraNode = new bg.scene.Node(this.gl, "Library Camera");
            this._libraryRoot.addChild(this._libraryCameraNode);

            this._libraryCamera = new bg.scene.Camera();
            this._sceneCamera.isMain = true;
            this._libraryCameraNode.addComponent(this._libraryCamera);
            this._libraryCameraNode.addComponent(new bg.scene.Transform());
            let ctrl = this.createCameraController();
            this._libraryCameraNode.addComponent(ctrl);
            bg.manipulation.OrbitCameraController.SetUniqueEnabled(ctrl,this._libraryRoot);

            let modelNode = new bg.scene.Node(this.gl, "Model node");
            this._libraryRoot.addChild(modelNode);

            bg.base.Loader.Load(this.gl, `templates/${ app.config.templateName }/models/material.bg2`)
            .then((result) => {
                result.name = "Material node";
                result.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,-0.5,0)));
                this._libraryRoot.addChild(result);
                this._previewNode = result;
                this._previewNode.enabled = false;
                this._defaultMaterialDrawable = this._previewNode.drawable;
            });

            //this._libraryLightState = getSceneLightState.apply(this,[this._libraryRoot]);
        }

        confirmClearScene(nextCommand) {
            return saveConfirm(nextCommand);
        }

        newScene() {
            return new Promise((resolve,reject) => {
                if (saveConfirm('newScene')) {
                    if (!sceneWillClose.apply(this,[this._sceneRoot])) {
                        reject(null);
                        return;
                    }
    
                    app.CommandManager.Get().clear();                
                    bg.scene.Node.CleanupNode(this._sceneRoot);
                
                    this.createDefaultScene();
                    resolve();
                }
                else {
                    reject();
                }
            })
        }

        openScene(scenePath) {
            return new Promise((resolve,reject) => {
                if (!sceneWillClose.apply(this,[this._sceneRoot])) {
                    reject(null);
                    return;
                }
                
                bg.base.Loader.Load(this.gl,scenePath)
                    .then((result) => {
                        bg.scene.Node.CleanupNode(this._sceneRoot);
                        if (result.sceneRoot.children.length==1 &&
                            Object.keys(result.sceneRoot._components).length==0
                        ) {
                            result.sceneRoot = result.sceneRoot.children[0];
                        }

                        sceneWillOpen.apply(this,[this._sceneRoot,result.sceneRoot]);

                        app.CommandManager.Get().clear();
    
                        this._sceneRoot = result.sceneRoot;
                        let cameraNode = result.cameraNode;
                        this._sceneCamera = cameraNode.camera;

                        this._grid = new app.render.Grid();
                        this._sceneRoot.addComponent(this._grid);
    
                        cameraNode.addComponent(new bg.scene.Transform());
                        let ctrl = cameraNode.component("bg.manipulation.OrbitCameraController");
                        if (ctrl) {
                            bg.manipulation.OrbitCameraController.SetUniqueEnabled(ctrl,this._sceneRoot);                            
                        }
    
                        this.selectionManager.initScene(this._sceneRoot);
                        this.notifySceneChanged();
 //                       this._sceneLightState = getSceneLightState.apply(this,[this._sceneRoot]);
                        
                        // Post reshape (to update the camera viewport) and redisplay
                        app.switchWorkspace(app.render.SceneMode.SCENE);

                        resolve();
                    })

                    .catch((err) => reject(err));
            
            });
        }

        init() {
            registerPlugins.apply(this);

            this.createDefaultScene();
            this.createLibraryScene();
            this.setMode(app.render.SceneMode.SCENE);
            this.selectionController.init();
        }
    }

    app.render = app.render || {};
    app.render.Scene = Scene;
})