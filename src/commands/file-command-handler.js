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
                filePath = app.standarizePath(filePath[0]);
                let cmd = new app.fileCommands.OpenFile(context,app.render.Scene.Get().root,filePath);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {})
                    .catch(() => {});
            }
        }
    }

    new FileCommandHandler();
})