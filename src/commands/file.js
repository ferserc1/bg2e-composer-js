app.addSource(() => {
    app.fileCommands = {}

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
                            this._loadedNode = node;
                            app.render.Scene.Get().selectionManager.prepareNode(node);
                            node.addComponent(new bg.scene.Transform());
                            this._parentNode.addChild(node);
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
})