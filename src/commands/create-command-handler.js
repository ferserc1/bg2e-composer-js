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
            onCreateCallack(node);
        }
        app.CommandManager.Get().doCommand(new app.nodeCommands.CreateNode(node,parent))
            .then(() => {
                app.render.Scene.Get().notifySceneChanged();
                app.ComposerWindowController.Get().updateView();
            })
            .catch((err) => {

            });
    }

    class CreateCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                'createEmptyNode',
                'createCameraComponent',
                'createTransformComponent',
                'createLightComponent',
                'createDrawableComponent',
                'createCubeComponent',
                'createPlaneComponent',
                'createSphereComponent',
                'createLightComponent'
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
            case 'createCubeComponent':
                cmd = this.createCubeComponent();
                break;
            case 'createPlaneComponent':
                cmd = this.createPlaneComponent();
                break;
            case 'createSphereComponent':
                cmd = this.createSphereComponent();
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
            alert("Not implemented");
        }

        createTransformComponent() {
            alert("Not implemented");
        }

        createLightComponent() {
            alert("Not implemented");
        }

        createDrawableComponent() {
            alert("Not implemented");
        }

        createCubeComponent() {
            alert("Not implemented");
        }

        createPlaneComponent() {
            alert("Not implemented");
        }

        createSphereComponent() {
            alert("Not implemented");
        }

        createLightComponent() {
            alert("Not implemented");
        }

    }

    new CreateCommandHandler();
})