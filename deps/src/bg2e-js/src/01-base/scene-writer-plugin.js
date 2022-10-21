(function() {
    if (!bg.isElectronApp) {
        return false;
    }

    const fs = require('fs');
    const path = require('path');

    class SaveSceneHelper {
        save(filePath,sceneRoot) {
            filePath = bg.base.Writer.StandarizePath(filePath);
            return new Promise((resolve,reject) => {
                this._url = {};
                this._url.path = filePath.split('/');
                this._url.fileName = this._url.path.pop();
                this._url.path = this._url.path.join('/');
                this._sceneData = {
                    fileType:"vwgl::scene",
                    version:{
                        major:2,
                        minor:0,
                        rev:0
                    },
                    scene:[]
                }
                this._promises = [];
                bg.base.Writer.PrepareDirectory(this._url.path);

                let rootNode = {};
                this._sceneData.scene.push(rootNode);
                this.buildSceneNode(sceneRoot,rootNode);

                fs.writeFileSync(path.join(this._url.path,this._url.fileName),JSON.stringify(this._sceneData,"","\t"),"utf-8");

                Promise.all(this._promises)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            });
        }

        buildSceneNode(node,sceneData) {
            sceneData.type = "Node";
            sceneData.name = node.name;
            sceneData.enabled = node.enabled;
            sceneData.steady = node.steady;
            sceneData.children = [];
            sceneData.components = [];
            node.forEachComponent((component) => {
                if (component.shouldSerialize) {
                    let componentData = {};
                    component.serialize(componentData,this._promises,this._url);
                    sceneData.components.push(componentData)
                }
            });
            node.children.forEach((child) => {
                let childData = {}
                this.buildSceneNode(child,childData);
                sceneData.children.push(childData);
            })
        }
    };

    class SceneWriterPlugin extends bg.base.WriterPlugin {
        acceptType(url,data) {
            let ext = url.split(".").pop(".");
            return /vitscnj/i.test(ext) && data instanceof bg.scene.Node;
        }

        write(url,data) {
            let saveSceneHelper = new SaveSceneHelper();
            return saveSceneHelper.save(url,data);
        }
    }

    bg.base.SceneWriterPlugin = SceneWriterPlugin;
})();