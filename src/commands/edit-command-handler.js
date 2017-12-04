app.addSource(() => {
    
        class EditCommandHandler extends app.CommandHandler {
            getMessages() {
                return [
                    "undo",
                    "redo",
                    "removeNode"
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
                        app.render.Scene.Get().notifySceneChanged();
                    })
                    .catch((err) => {

                    });
                }
            }
        }
    
        new EditCommandHandler();
    })