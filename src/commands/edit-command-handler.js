app.addSource(() => {
    
        class EditCommandHandler extends app.CommandHandler {
            getMessages() {
                return [
                    "undo",
                    "redo",
                    "removeNode",
                    "groupNodes",
                    'duplicateNode'
                ]
            }
    
            execute(message,params) {
                switch (message) {
                case 'undo':
                    app.CommandManager.Get().undo();
                    break;
                case 'redo':
                    app.CommandManager.Get().redo();
                    break;
                case 'removeNode':
                    this.removeNode();
                    break;
                case 'groupNodes':
                    this.groupNodes();
                    break;
                case 'duplicateNode':
                    this.duplicateNode();
                    break;
                }
            }

            removeNode() {
                let selection = app.render.Scene.Get().selectionManager.selection;
                let nodes = [];
                selection.forEach((item) => {
                    if (item.node) {
                        nodes.push(item.node);
                    }
                });

                if (nodes.length) {
                    app.CommandManager.Get().doCommand(
                        new app.nodeCommands.RemoveNode(nodes)
                    )
                    .then(() => {
                        app.render.Scene.Get().selectionManager.clear();
                        app.render.Scene.Get().notifySceneChanged();
                    })
                    .catch((err) => {

                    });
                }
            }

            groupNodes() {
                let selection = app.render.Scene.Get().selectionManager.selection;
                let nodes = [];
                selection.forEach((item) => {
                    if (item.node && nodes.indexOf(item.node)==-1 && item.node.parent) {
                        nodes.push(item.node);
                    }
                });

                if (nodes.length>1) {
                    app.CommandManager.Get().doCommand(
                        new app.nodeCommands.Group(nodes)
                    )
                        .then(() => {
                            app.render.Scene.Get().selectionManager.clear();
                            app.render.Scene.Get().notifySceneChanged();
                            app.ComposerWindowController.Get().updateView();
                        })

                        .catch((err) => {
                            console.error(err.message);
                        })
                }
                else {
                    console.warn(nodes.length==0 ? "No nodes selected" :  "Only one node selected");
                }
            }

            duplicateNode() {
                let selection = app.render.Scene.Get().selectionManager.selection;
                let nodes = [];
                selection.forEach((item) => {
                    if (item.node && nodes.indexOf(item.node)==-1 && item.node.parent) {
                        nodes.push(item.node);
                    }
                });

                if (nodes.length>0) {
                    app.CommandManager.Get().doCommand(
                        new app.nodeCommands.DuplicateNode(nodes)
                    )
                        .then(() => {
                            app.render.Scene.Get().selectionManager.clear();
                            app.render.Scene.Get().notifySceneChanged();
                            app.ComposerWindowController.Get().updateView();
                        })

                        .catch((err) => {
                            console.error(err.message);
                        })
                }
                else {
                    console.warn("No nodes selected");
                }
            }
        }
    
        new EditCommandHandler();
    })