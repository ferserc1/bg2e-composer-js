app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        constructor() {
            super();
            this._currentScenePath = null;
        }

        getMessages() {
            return [
                "newScene",
                "openFile",
                "openScene",
                "exportSelected",
                "saveScene",
                "saveSceneAs",
                "showPluginSettings"
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'newScene':
                this.newScene(params);
                break;
            case 'openFile':
                this.openFile(params);
                break;
            case 'openScene':
                this.openScene(params);
                break;
            case 'exportSelected':
                this.exportSelected(params);
                break;
            case 'saveScene':
                this.saveScene(params);
                break;
            case 'saveSceneAs':
                this.saveSceneAs(params);
                break;
            case 'showPluginSettings':
                this.showPluginSettings(params);
                break;
            }
        }

        newScene() {
            let context = app.ComposerWindowController.Get().gl;
            let cmd = new app.fileCommands.NewFile(context,app.render.Scene.Get().root);
            app.CommandManager.Get().doCommand(cmd)
                .then(() => {
                    this._currentScenePath = "";
                })
                .catch((err) => {
                    if (err) {
                        console.error(err.message)
                    }
                    // else, cancel by user 
                });
        }

        openFile() {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let options = {properties: ['openFile'],
                filters: [
                    { name:"Compatible files", extensions:['bg2','vwglb','obj']},
                    { name:"bg2 object", extensions:['bg2','vwglb']},
                    { name:"Wavefront OBJ", extensions:['obj']}
                ]
            };
            if (app.fbxPlugin.available) {
                options.filters.push({
                    name:"Autodesk FBX", extensions:['fbx']
                });
                options.filters[0].extensions.push('fbx');
            }
            let filePath = dialog.showOpenDialog(options);

            if (filePath && filePath.length>0) {
                filePath = app.standarizePath(filePath[0]);
                let cmd = new app.fileCommands.OpenFile(context,app.render.Scene.Get().root,filePath);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {})
                    .catch((err) => {
                        if (err) {
                            console.error(err.message)
                        }
                        // else, cancel by user
                    });
            }
        }

        openScene() {
            if (app.render.Scene.Get().confirmClearScene('openScene')) {
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
                        .then(() => {
                            this._currentScenePath = filePath;
                        })
                        .catch((err) => {
                            if (err) {
                                console.error(err.message,true);
                            }
                            else {
                                // command cancelled by user
                            }
                        });
                }
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
                                console.error(error.message,true);
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

        saveScene(params) {
            if (!this._currentScenePath) {
                this.saveSceneAs(params);
            }
            else {
                let context = app.ComposerWindowController.Get().gl;
                let cmd = new app.fileCommands.SaveScene(context,this._currentScenePath,app.render.Scene.Get().root);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        app.CommandManager.Get().clear();
                        if (params.followingCommand) {
                            app.CommandHandler.Trigger(params.followingCommand,{});
                        }
                    })
                    .catch((err) => {
                        if (err) {
                            console.error(err.message,true);
                        }
                        else {
                            // command cancelled by user
                        }
                    });
            }
        }

        saveSceneAs(params) {
            let context = app.ComposerWindowController.Get().gl;
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showSaveDialog({
                filters: [
                    { name:"bg2 engine scene", extensions:["vitscnj"]}
                ]
            });
            if (filePath) {
                filePath = app.standarizePath(filePath);
                let cmd = new app.fileCommands.SaveScene(context,filePath,app.render.Scene.Get().root);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        app.CommandManager.Get().clear();
                        this._currentScenePath = filePath;
                        if (params.followingCommand) {
                            setTimeout(() => {
                                app.CommandHandler.Trigger(params.followingCommand,{});
                            },10);
                        }
                    })
                    .catch((err) => {
                        if (err) {
                            console.error(err.message,true);
                        }
                        else {
                            // command cancelled by user
                        }
                    });
            }
        
        }

        showPluginSettings(params) {
            app.ui.DialogView.Show({
                templateUrl:`templates/${ app.config.templateName }/directives/plugin-settings-view.html`,
                title: "Plugin settings",
                showClose: false,
                type: 'modal',
                onAccept: () => { return true; }
            })
                .then(() => {})
                .catch((err) => { console.log(err); });
        }
    }

    new FileCommandHandler();
})