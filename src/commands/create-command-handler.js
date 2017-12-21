app.addSource(() => {

    function createNode(onCreateCallback) {
        let context = app.ComposerWindowController.Get().gl;
        let parent = app.render.Scene.Get().root;
        app.render.Scene.Get().selectionManager.selection.some((item) => {
            if (item.node) {
                parent = item.node;
                return true;
            }
        });
        let node = new bg.scene.Node(context);
        if (onCreateCallback) {
            onCreateCallback(node);
        }
        app.CommandManager.Get().doCommand(new app.nodeCommands.CreateNode(node,parent))
            .then(() => {
                app.render.Scene.Get().notifySceneChanged();
                app.ComposerWindowController.Get().updateView();
            })
            .catch((err) => {

            });
    }

    function selectedNode() {
        let sel = app.render.Scene.Get().selectionManager.selection;
        if (sel.length) {
            return sel[0].node;
        }
        return false;
    }

    function addComponent(componentUi) {
        let sel = selectedNode();
        if (sel) {
            let instance = componentUi.createInstance();
            app.CommandManager.Get().doCommand(
                new app.nodeCommands.AddComponent(sel,instance)
            )
            .then(() => {
                app.render.Scene.Get().notifySceneChanged();
                app.ComposerWindowController.Get().updateView();
            })
            .catch((err) => {
    
            });
        }
        else {
            console.error("Could not create component: you must to select a node first.",true);
        }
    }

    class CreateCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                'createEmptyNode',
                'createCameraComponent',
                'createTransformComponent',
                'createLightComponent',
                'createDrawableComponent',
                'createCameraNode',
                'createTransformNode',
                'createLightNode',
                'createDrawableNode'
            ]
        }

        execute(message,params) {
            let cmd = null;
            switch (message) {
            case 'createEmptyNode':
                cmd = this.createNode();
                break;
            case 'createCameraComponent':
                cmd = this.createCameraComponent();
                break;
            case 'createTransformComponent':
                cmd = this.createTransformComponent();
                break;
            case 'createLightComponent':
                cmd = this.createLightComponent();
                break;
            case 'createDrawableComponent':
                cmd = this.createDrawableComponent();
                break;
            case 'createCameraNode':
                cmd = createNode((node) => {
                    node.addComponent(app.components.getUIForComponent("bg.scene.Camera").createInstance());
                });
                break;
            case 'createTransformNode':
                cmd = createNode((node) => {
                    node.addComponent(app.components.getUIForComponent("bg.scene.Transform").createInstance());
                });
                break;
            case 'createLightNode':
                cmd = createNode((node) => {
                    node.addComponent(app.components.getUIForComponent("bg.scene.Light").createInstance());
                });
                break;
            case 'createDrawableNode':
                cmd = createNode((node) => {
                    node.addComponent(app.components.getUIForComponent("bg.scene.Drawable").createInstance());
                });
                break;
            }

            if (cmd) {
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        app.render.Scene.Get().notifySceneChanged();
                        app.ComposerWindowController.Get().postReshape();
                        app.ComposerWindowController.Get().updateView();
                    })
                    .catch((err) => {

                    });
            }
        }

        createNode() {
            createNode();
        }

        createCameraComponent() {
            addComponent(app.components.getUIForComponent("bg.scene.Camera"));
        }

        createTransformComponent() {
            addComponent(app.components.getUIForComponent("bg.scene.Transform"));
        }

        createLightComponent() {
            addComponent(app.components.getUIForComponent("bg.scene.Light"));
        }

        createDrawableComponent() {
            addComponent(app.components.getUIForComponent("bg.scene.Drawable"));
        }

    }

    new CreateCommandHandler();
})