
app.addWorkspace(() => {
    return {
        name:"Scene editor",
        endpoint:'/sceneEditor',
        templateUrl: `templates/${ app.config.templateName }/views/scene-editor.html`,
        controller: 'SceneEditorController',
        isDefault:true,
        sceneMode: app.render.SceneMode.SCENE
    };
});

app.addWorkspace(() => {
    return {
        name:"Model editor",
        endpoint:'/modelEditor',
        templateUrl: `templates/${ app.config.templateName }/views/model-editor.html`,
        controller: 'ModelEditorController',
        isDefault: false,
        sceneMode: app.render.SceneMode.SCENE
    };
});

app.addWorkspace(() => {
    return {
        name:"Library editor",
        endpoint:'/libraryEditor',
        templateUrl: `templates/${ app.config.templateName }/views/library-editor.html`,
        controller: 'LibraryEditorController',
        isDefault: false,
        sceneMode: app.render.SceneMode.LIBRARY
    };
});

app.addDefinitions(() => {
    class WorkspaceUtilities {
        libraryNodeSelected(node,resPath) {
            if (node.type=="model" && node.file) {
                const path = require('path');
                let filePath = app.standarizePath(path.join(resPath,node.file));
                let gl = app.ComposerWindowController.Get().gl;
                let dstNode = app.render.Scene.Get().root;
                app.render.Scene.Get().selectionManager.selection.some((sel) => {
                    if (sel.node) {
                        dstNode = sel.node;
                        return true;
                    }
                })
                bg.base.Loader.Load(gl,filePath)
                    .then((node) => {
                        node.addComponent(new bg.scene.Transform());
                        app.render.Scene.Get().selectionManager.prepareNode(node);
                        return app.CommandManager.Get().doCommand(
                            new app.nodeCommands.CreateNode(node,dstNode)
                        );
                    })
                    .then(() => {
                        app.render.Scene.Get().notifySceneChanged();
                        app.ComposerWindowController.Get().updateView();
                    })
                    .catch((err) => {
                        console.error(err.message,true);
                    });
            }
            else if (node.type=="material") {
                let selection = app.render.Scene.Get().selectionManager.selection;
                let target = [];
                selection.forEach((selItem) => {
                    if (selItem.material) {
                        target.push(selItem.material);
                    }
                });
                if (target.length) {
                    let cmd = new app.materialCommands.ApplyModifier(node.materialModifier,resPath,target);
                    app.CommandManager.Get().doCommand(cmd)
                        .then(() => {
                            app.render.Scene.Get().notifySceneChanged();
                            app.ComposerWindowController.Get().updateView();
                        })
                }
            }
        }
    }

    app.workspaceUtilities = new WorkspaceUtilities();
});
