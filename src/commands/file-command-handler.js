app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                "openFile"
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'openFile':
                this.openFile(params);
                break;
            }
        }

        openFile() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showOpenDialog({ properties: ['openFile']});
            if (filePath && filePath.length>0) {
                let cmd = new app.fileCommands.OpenFile(context,app.Scene.Get().root,filePath[0]);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {})
                    .catch(() => {});
            }
        }
    }

    new FileCommandHandler();
})