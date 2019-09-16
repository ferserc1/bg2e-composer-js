app.addSource(() => {
    const path = require('path');

    app.fileCommands = {}

    class NewFile extends app.ContextCommand {
        constructor(context) {
            super(context);
            this._undoable = false;
            this._clearCommandHistory = true;
        }

        execute() {
            return new Promise((resolve,reject) => {
                app.render.Scene.Get().newScene()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    })
            })
        }
    }

    app.fileCommands.NewFile = NewFile;


    class OpenFile extends app.ContextCommand {
        constructor(context,parentNode,path) {
            super(context);
            this._parentNode = parentNode;
            this._path = path;
            this._loadedNode = null;
        }

        execute() {
            
            return new Promise((resolve,reject) => {
                if (this._loadedNode) {
                    this._parentNode.addChild(this._loadedNode);
                    resolve();
                }
                else {
                    bg.base.Loader.Load(this.gl,this._path)
                        .then((node) => {
                            let pathParsed = path.parse(this._path);
                            node.name = pathParsed.name;
                            if (node.drawable) {
                                node.drawable.name = node.name;
                            }
                            this._loadedNode = node;
                            this._loadedNode.addComponent(new bg.scene.Transform());
                            app.render.Scene.Get().selectionManager.prepareNode(node);
                            node.addComponent(new bg.scene.Transform());
                            this._parentNode.addChild(node);
                            app.render.Scene.Get().notifySceneChanged();
                            resolve();
                        })
    
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._parentNode.removeChild(this._loadedNode);
                app.render.Scene.Get().notifySceneChanged();
                resolve();
            });
        }
    };

    app.fileCommands.OpenFile = OpenFile;

    class OpenScene extends app.ContextCommand {
        constructor(context,path) {
            super(context);
            this._path = path;

            this._undoable = false;
            this._clearCommandHistory = true;
        }

        execute() {
            return new Promise((resolve,reject) => {
                app.render.Scene.Get().openScene(this._path)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            });
        }
    };

    app.fileCommands.OpenScene = OpenScene;

    class PlaceScene extends app.ContextCommand {
        constructor(context,path,parentNode) {
            super(context);
            this._path = path;
            this._parentNode = parentNode;
            this._sceneNode = null;
        }

        execute() {
            return new Promise((resolve,reject) => {
                bg.base.Loader.Load(this.gl,this._path)
                    .then((result) => {
                        // The scene loader automatically creates a camera, we will load only the first
                        // node of the loaded scene root
                        result.sceneRoot.children
                        if (result.sceneRoot.children.length) {
                            this._sceneNode = result.sceneRoot.children[0];
                            this._parentNode.addChild(this._sceneNode);
                            resolve();
                        }
                        else {
                            reject(new Error("The scene or prefab is empty"));
                        }
                    })

                    .catch((err) => reject(err));
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._parentNode.removeChild(this._sceneNode);
                resolve();
            });
        }
    }

    app.fileCommands.PlaceScene = PlaceScene;

    class ExportObject extends app.ContextCommand {
        constructor(context,path,node) {
            super(context);
            this._path = path;
            this._node = node;

            this._undoable = false;
        }

        execute() {
            return new Promise((resolve,reject) => {
                bg.base.Writer.Write(this._path,this._node)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            });
        }
    }

    function fixDrawableNames(node,names) {
        if (node.drawable && names.indexOf(node.drawable.name)!=-1) {
            node.drawable.name = bg.utils.generateUUID();
        }
        else if (node.drawable) {
            names.push(node.drawable.name);
        }

        node.children.forEach((child) => {
            fixDrawableNames(child,names);
        });
    }

    class SaveScene extends app.ContextCommand {
        constructor(context,path,node) {
            super(context);
            this._path = path;
            this._node = node;
            let names = [];
            fixDrawableNames(node,names);
            
            this._undoable = false;
        }

        execute() {
            return new Promise((resolve,reject) => {
                app.render.Scene.Get().selectionManager.removeGizmos();
                bg.base.Writer.Write(this._path,this._node)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            });
        }
    }

    app.fileCommands.SaveScene = SaveScene;

    app.fileCommands.ExportObject = ExportObject;
})