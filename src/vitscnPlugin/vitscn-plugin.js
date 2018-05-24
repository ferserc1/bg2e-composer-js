app.addDefinitions(() => {

    app.vitscnPlugin = {};

    app.vitscnPlugin.available = false;

    class SceneLoaderPlugin extends bg.base.SceneLoaderPlugin {
        acceptType(url,data) {
            return bg.utils.Resource.GetExtension(url)=="vitscn";
        }

        load(context,url,data) {
            return new Promise((resolve,reject) => {
                app.vitscnPlugin.extract(url)
                    .then((result) => {
                        let sceneUrl = bg.base.Writer.StandarizePath(result.scenePath);
                        return super.load(context,sceneUrl,result.fileContents);
                    })
                    .then((result) => {
                        if (result.cameraNode && !result.cameraNode.component("bg.manipulation.OrbitCameraController")) {
                            result.cameraNode.addComponent(new bg.manipulation.OrbitCameraController());
                        }
                        resolve(result);
                    })
                    .catch((err) => {
                        reject(err);
                    })
            })
        }
    }

    app.vitscnPlugin.SceneLoaderPlugin = SceneLoaderPlugin;
});
