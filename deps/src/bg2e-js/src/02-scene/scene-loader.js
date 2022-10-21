(function() {
    function fooScene(context) {
        let root = new bg.scene.Node(context, "Scene Root");

        bg.base.Loader.Load(context,"../data/test-shape.vwglb")
			.then((node) => {
				root.addChild(node);
				node.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(-1.4,0.25,0).scale(0.5,0.5,0.5)));
			})
			
			.catch(function(err) {
				alert(err.message);
			});
	
		let sphereNode = new bg.scene.Node(context,"Sphere");
		sphereNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(-1.3,0.1,1.3)));
		sphereNode.addComponent(bg.scene.PrimitiveFactory.Sphere(context,0.1));
		sphereNode.component("bg.scene.Drawable").getMaterial(0).diffuse.a = 0.8;
		sphereNode.component("bg.scene.Drawable").getMaterial(0).reflectionAmount = 0.4;
		root.addChild(sphereNode);
	
		let floorNode = new bg.scene.Node(context,"Floor");
		floorNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,0,0)));
		floorNode.addComponent(bg.scene.PrimitiveFactory.Plane(context,10,10));
		floorNode.component("bg.scene.Drawable").getMaterial(0).shininess = 50;
		floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionAmount = 0.3;
		floorNode.component("bg.scene.Drawable").getMaterial(0).normalMapScale = new bg.Vector2(10,10);
		floorNode.component("bg.scene.Drawable").getMaterial(0).textureScale = new bg.Vector2(10,10);
		floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionMaskInvert = true;
		floorNode.component("bg.scene.Drawable").getMaterial(0).shininessMaskInvert = true;
		root.addChild(floorNode);

		bg.base.Loader.Load(context,"../data/bricks_nm.png")
			.then((tex) => {
				floorNode.component("bg.scene.Drawable").getMaterial(0).normalMap = tex;
			});

		bg.base.Loader.Load(context,"../data/bricks.jpg")
			.then((tex) => {
				floorNode.component("bg.scene.Drawable").getMaterial(0).texture = tex;
			});

		bg.base.Loader.Load(context,"../data/bricks_shin.jpg")
			.then((tex) => {
				floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionMask = tex;
				floorNode.component("bg.scene.Drawable").getMaterial(0).shininessMask = tex;
			});
		
		let lightNode = new bg.scene.Node(context,"Light");
		lightNode.addComponent(new bg.scene.Light(new bg.base.Light(context)));	
		lightNode.addComponent(new bg.scene.Transform(bg.Matrix4.Identity()
												.rotate(bg.Math.degreesToRadians(30),0,1,0)
												.rotate(bg.Math.degreesToRadians(35),-1,0,0)));
		root.addChild(lightNode);
		
		let camera = new bg.scene.Camera();
		camera.isMain = true;
		let cameraNode = new bg.scene.Node("Camera");
		cameraNode.addComponent(camera);			
		cameraNode.addComponent(new bg.scene.Transform());
		cameraNode.addComponent(new bg.manipulation.OrbitCameraController());
		let camCtrl = cameraNode.component("bg.manipulation.OrbitCameraController");
		camCtrl.minPitch = -45;
		root.addChild(cameraNode);

        return root;
	}

    class SceneFileParser {
        constructor(url,jsonData) {
            this.url = url.substring(0,url.lastIndexOf('/'));
            this.jsonData = jsonData;
        }

        loadNode(context,jsonData,parent,promises) {
            // jsonData: object, input. Json data for the node
            // parent: scene node, input. The parent node to which we must to add the new scene node.
            // promises: array, output. Add promises from component.deserialize()
            let node = new bg.scene.Node(context,jsonData.name);
			node.enabled = jsonData.enabled;
			node.steady = jsonData.steady || false;
            parent.addChild(node);
            jsonData.components.forEach((compData) => {
                promises.push(bg.scene.Component.Factory(context,compData,node,this.url));
            });
            jsonData.children.forEach((child) => {
                this.loadNode(context,child,node,promises);
            });
        }

        loadScene(context) {
            let promises = [];
            let sceneRoot = new bg.scene.Node(context,"scene-root");

            this.jsonData.scene.forEach((nodeData) => {
                this.loadNode(context,nodeData,sceneRoot,promises);
            });

            return new Promise((resolve,reject) => {
                Promise.all(promises)
                    .then(() => {
                        let findVisitor = new bg.scene.FindComponentVisitor("bg.scene.Camera");
                        sceneRoot.accept(findVisitor);
                        
						let cameraNode = null;
						let firstCamera = null;
                        findVisitor.result.some((cn) => {
							if (!firstCamera) {
								firstCamera = cn;
							}
							if (cn.camera.isMain) {
								cameraNode = cn;
								return true;
							}
						});
						cameraNode = cameraNode || firstCamera;
                        if (!cameraNode) {
							cameraNode = new bg.scene.Node(context,"Camera");
							cameraNode.addComponent(new bg.scene.Camera());
                            let trx = bg.Matrix4.Rotation(0.52,-1,0,0);
                            trx.translate(0,0,5);
                            cameraNode.addComponent(new bg.scene.Transform(trx));
                            sceneRoot.addChild(cameraNode);
						}
						
						// Ensure that cameraNode is the only camera marked as main
						bg.scene.Camera.SetAsMainCamera(cameraNode,sceneRoot);
                        resolve({ sceneRoot:sceneRoot, cameraNode:cameraNode });
                    });
            });
        }

    }

    class SceneLoaderPlugin extends bg.base.LoaderPlugin {
		acceptType(url,data) {
            let ext = bg.utils.Resource.GetExtension(url);
			return ext=="vitscnj";
		}
		
		load(context,url,data) {
			return new Promise((resolve,reject) => {
				if (data) {
					try {
                        if (typeof(data)=="string") {
                            // Prevent a bug in the C++ API version 2.0, that inserts a comma after the last
                            // element of some arrays and objects
                            data = data.replace(/,[\s\r\n]*\]/g,']');
                            data = data.replace(/,[\s\r\n]*\}/g,'}');
                            data = JSON.parse(data);
                        }
                        let parser = new SceneFileParser(url,data);
                        parser.loadScene(context)
                            .then((result) => {
                                resolve(result);
                            });
					}
					catch(e) {
						reject(e);
					}
				}
				else {
					reject(new Error("Error loading scene. Data is null"));
				}
			});
		}
	}
	
	bg.base.SceneLoaderPlugin = SceneLoaderPlugin;

})();