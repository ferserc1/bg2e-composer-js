app.addSource(() => {
    
        class EditCommandHandler extends app.CommandHandler {
            getMessages() {
                return [
                    "undo",
                    "redo"
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
                }
            }
        }
    
        new EditCommandHandler();
    })