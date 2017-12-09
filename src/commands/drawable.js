app.addSource(() => {
    app.drawableCommands = {};

    class LoadFromFile extends app.Command {
        constructor(node,file) {
            super();
            this._node = node;
            this._file = file;
            this._component = null;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._component) {
                    bg.base.Loader.Load(app.ComposerWindowController.Get().gl,this._file)
                        .then((node) => {
                            this._component = node.drawable;
                            this._node.addComponent(this._component);
                            app.render.Scene.Get().selectionManager.prepareNode(this._node);
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        })
                }
                else {
                    this._node.addComponent(this._component);
                    resolve();
                }
            });
        }
        
        undo() {
            return new Promise((resolve,reject) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._component);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }
    }

    app.drawableCommands.LoadFromFile = LoadFromFile;

    class CreateCube extends app.Command {
        constructor(node,w,h,d) {
            super();
            this._node = node;
            this._w = w;
            this._h = h;
            this._d = d;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                let ctx = app.ComposerWindowController.Get().gl;
                this._comp = bg.scene.PrimitiveFactory.Cube(ctx,this._w,this._h,this._d);
                this._node.addComponent(this._comp);
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreateCube = CreateCube;

    class CreateSphere extends app.Command {
        constructor(node,r,slices,stacks) {
            super();
            this._node = node;
            this._radius = r;
            this._slices = slices;
            this._stacks = stacks;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                let ctx = app.ComposerWindowController.Get().gl;
                this._comp = bg.scene.PrimitiveFactory.Sphere(ctx,this._radius,this._slices,this._stacks);
                this._node.addComponent(this._comp);
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreateSphere = CreateSphere;

    class CreatePlane extends app.Command {
        constructor(node,w,d) {
            super();
            this._node = node;
            this._w = w;
            this._d = d;
            this._prevDrawable = this._node.drawable;
        }

        execute() {
            return new Promise((resolve) => {
                let ctx = app.ComposerWindowController.Get().gl;
                this._comp = bg.scene.PrimitiveFactory.Plane(ctx,this._w,this._d);
                this._node.addComponent(this._comp);
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                if (this._prevDrawable) {
                    this._node.addComponent(this._prevDrawable);
                }
                else {
                    this._node.removeComponent(this._comp);
                }
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            })
        }
    }

    app.drawableCommands.CreatePlane = CreatePlane;
})