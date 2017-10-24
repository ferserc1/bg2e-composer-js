app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                "openFile",
                "openScene"
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'openFile':
                this.openFile(params);
                break;
            case 'openScene':
                this.openScene(params);
                break;
            }
        }

        openFile() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name:"Wavefront OBJ", extensions:['obj']},
                    { name:"bg2 object", extensions:['bg2','vwglb']}
                ]
            });
            if (filePath && filePath.length>0) {
                filePath = app.standarizePath(filePath[0]);
                let cmd = new app.fileCommands.OpenFile(context,app.render.Scene.Get().root,filePath);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {})
                    .catch((err) => console.log(err.message));
            }
        }

        openScene() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showOpenDialog({
                properties:['openFile'],
                filters: [
                    { name:"bg2 engine scenes", extensions:["vitscnj"]}
                ]
            });
            if (filePath && filePath.length>0) {
                filePath = app.standarizePath(filePath[0]);
                let cmd = new app.fileCommands.OpenScene(context,filePath);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {})
                    .catch((err) => {
                        if (err) {
                            console.log(err.message);
                        }
                        else {
                            // command cancelled by user
                        }
                    });
            }
        }
    }

    new FileCommandHandler();
})