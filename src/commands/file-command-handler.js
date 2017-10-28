app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                "openFile",
                "openScene",
                "exportSelected"
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
            case 'exportSelected':
                this.exportSelected(params);
                break;
            }
        }

        openFile() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [
                    { name:"Compatible files", extensions:['bg2','vwglb','obj']},
                    { name:"bg2 object", extensions:['bg2','vwglb']},
                    { name:"Wavefront OBJ", extensions:['obj']}
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

        exportSelected() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            let selection = app.render.Scene.Get().selectionManager.selection;

            if (selection.length==1 && selection[0].node && selection[0].node.drawable) {
                let filePath = dialog.showSaveDialog({
                    filters: [
                        { name:"bg2 object file", extensions:["bg2"]}
                    ]
                });
                if (filePath) {
                    filePath = app.standarizePath(filePath);
                    let cmd = new app.fileCommands.ExportObject(context,filePath,selection[0].node);
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
            else if (selection.length>1) {
                // TODO: Export multiple items
            }
        }
    }

    new FileCommandHandler();
})