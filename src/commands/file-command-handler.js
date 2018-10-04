app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        constructor() {
            super();
            this._currentScenePath = null;
        }

        get currentScenePath() { return this._currentScenePath; }

        getMessages() {
            return [
                "newScene",
                "openFile",
                "openScene",
                "exportSelected",
                "saveScene",
                "saveSceneAs",
                "showPluginSettings",
                "newLibrary",
                "openLibrary",
                "saveLibrary",
                "saveLibraryAs"
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
            case "newLibrary":
                this.newLibrary(params);
                break;
            case "openLibrary":
                this.openLibrary(params);
                break;
            case "saveLibrary":
                this.saveLibrary(params);
                break;
            case "saveLibraryAs":
                this.saveLibraryAs(params);
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
                
                let filters = [ { name:"bg2 engine scenes", extensions:["vitscnj"]} ];
                if (app.vitscnPlugin.available) {
                    filters.push({ name:"bg2 engine scene package", extensions:["vitscn"]});
                }
                let filePath = dialog.showOpenDialog({
                    properties:['openFile'],
                    filters: filters
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
            let exportNodes = [];
            app.render.Scene.Get().selectionManager.selection.forEach((sel) => {
                if (sel.node && sel.node.drawable) {
                    exportNodes.push(sel.node);
                }
            })

            if (exportNodes.length==1) {
                let filePath = dialog.showSaveDialog({
                    filters: [
                        { name:"bg2 object file", extensions:["bg2"]}
                    ]
                });
                if (filePath) {
                    filePath = app.standarizePath(filePath);
                    let cmd = new app.fileCommands.ExportObject(context,filePath,exportNodes[0]);
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
            else if (exportNodes.length>1) {
                const path = require("path");
                const mkdirp = require("mkdirp");
                let getName = (node) => { return (node.drawable.name || node.name || "").replace(/\s+/,"_") };
                if (exportNodes.some((node) => getName(node)=="" )) {
                    console.error("Could not export multiple models: some untitled elements found.",true);
                    return;
                }
                else if (exportNodes.some((n1,i1) => {
                    return exportNodes.some((n2,i2) => {
                        return getName(n1)==getName(n2) && i1!=i2;
                    })
                })) {
                    console.error("Could not export multiple models: some objects have the same name.",true);
                    return;
                }
                let folderPath = dialog.showOpenDialog({
                    properties: ["openDirectory"]
                });
                if (folderPath) {
                    folderPath = folderPath[0];
                    exportNodes.forEach((node) => {
                        let folderName = getName(node);
                        let filePath = path.join(folderPath,folderName);
                        mkdirp(filePath);
                        filePath = app.standarizePath(path.join(filePath,`${folderName}.bg2`));
                        let cmd = new app.fileCommands.ExportObject(context,filePath,node);
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
                    });
                }
            }
        }

        saveScene(params = {}) {
            if (!this._currentScenePath) {
                return this.saveSceneAs(params);
            }
            else {
                return new Promise((resolve,reject) => {
                    let context = app.ComposerWindowController.Get().gl;
                    let cmd = new app.fileCommands.SaveScene(context,this._currentScenePath,app.render.Scene.Get().sceneRoot);
                    app.CommandManager.Get().doCommand(cmd)
                        .then(() => {
                            app.CommandManager.Get().clear();
                            if (params.followingCommand) {
                                app.CommandHandler.Trigger(params.followingCommand,{});
                            }
                            resolve(true);
                        })
                        .catch((err) => {
                            if (err) {
                                console.error(err.message,true);
                                reject(err);
                            }
                            else {
                                // command cancelled by user
                                resolve(false);
                            }
                        });
                });
            }
        }

        saveSceneAs(params = {}) {
            return new Promise((resolve,reject) => {
                let context = app.ComposerWindowController.Get().gl;
                const {dialog} = require('electron').remote;
                
                let filePath = dialog.showSaveDialog({
                    filters: [
                        { name:"bg2 engine scene", extensions:["vitscnj"]}
                    ]
                });
                if (filePath) {
                    filePath = app.standarizePath(filePath);
                    let cmd = new app.fileCommands.SaveScene(context,filePath,app.render.Scene.Get().sceneRoot);
                    app.CommandManager.Get().doCommand(cmd)
                        .then(() => {
                            app.CommandManager.Get().clear();
                            this._currentScenePath = filePath;
                            if (params.followingCommand) {
                                setTimeout(() => {
                                    app.CommandHandler.Trigger(params.followingCommand,{});
                                },10);
                            }
                            resolve(true);
                        })
                        .catch((err) => {
                            if (err) {
                                console.error(err.message,true);
                                resolve(err);
                            }
                            else {
                                // command cancelled by user
                                resolve(false);
                            }
                        });
                }
                else {
                    resolve(false);
                }
            });
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

        newLibrary(params) {
            let mode = "edit";
            if (typeof(params) == "object") {
                mode = params.mode || "edit"
            }
            else if (typeof(params) == "string") {
                mode = params || "edit";
            }
            return new Promise((resolve,reject) => {
                let context = app.ComposerWindowController.Get().gl;
                const {dialog} = require('electron').remote;
                
                let filePath = dialog.showSaveDialog({
                    filters: [
                        { name:"Create new library", extensions:["json","vitlib"] }
                    ]
                });
                if (filePath) {
                    filePath = app.standarizePath(filePath);
                    app.library.Manager.Get("edit").newLibrary(filePath)
                        .then(() => {
                            app.switchWorkspace(app.Workspaces.LibraryEditor);
                            resolve(true);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    resolve(false);
                }
            });
        }

        openLibrary(params) {
            let mode = "edit";
            if (typeof(params) == "object") {
                mode = params.mode || "edit"
            }
            else if (typeof(params) == "string") {
                mode = params || "edit";
            }
            return new Promise((resolve,reject) => {
                let context = app.ComposerWindowController.Get().gl;
                const {dialog} = require('electron').remote;
                
                let filePath = dialog.showOpenDialog({
                    properties:['openFile'],
                    filters: [
                        { name:"Library file", extensions:["json","vitlib"]}
                    ]
                });
                if (filePath && filePath.length>0) {
                    filePath = app.standarizePath(filePath[0]);
                    app.library.Manager.Get(mode).open(filePath)
                        .then(() => {
                            if (mode=="edit") {
                                app.switchWorkspace(app.Workspaces.LibraryEditor);
                            }
                            resolve(true);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            })
        }
    }

    new FileCommandHandler();
})