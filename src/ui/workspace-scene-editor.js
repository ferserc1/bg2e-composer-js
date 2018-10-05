app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    function commitMaterials(target,multi=true) {
        return new Promise((resolve,reject) => {
            if (!this.currentMaterial) {
                resolve(false);
            }
            else if (target.length) {
                if (!multi) {
                    target = [target[0]];
                }
                let cmd = new app.materialCommands.ApplyMaterial(this.currentMaterial,target);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        // Update the material backup
                        this._materialBackup.assign(this.currentMaterial);
                        resolve()
                    });
            }
            else {
                resolve();
            }
        })
    }

    let s_materialHandlerSingleton = null;
    class MaterialHandler {
        static Get() {
            if (!s_materialHandlerSingleton) {
                s_materialHandlerSingleton = new MaterialHandler();
            }
            return s_materialHandlerSingleton;
        }

        constructor() {
            this._currentMaterial = null;
            
            // This attribute stores the selected material, to restore it just before
            // execute the ApplyMaterial command.
            this._materialBackup = null;
        }

        getMaterialsFromSelection() {
            let result = []
            app.render.Scene.Get().selectionManager.selection.forEach((item) => {
                if (item.material) {
                    result.push(item.material);
                }
            });
            return result;
        }

        get currentMaterial() { return this._currentMaterial; }
        set currentMaterial(m) { this._currentMaterial = m; }

        updateCurrentFromSelection() {
            let mat = this.getMaterialsFromSelection();
            mat = mat.length>0 && mat[0];
            if (mat) {
                this._materialBackup = new bg.base.Material();
                this._materialBackup.assign(mat);
                this._currentMaterial = new bg.base.Material();
                this._currentMaterial.assign(mat);
            }
            else {
                this._currentMaterial = null;
            }
            return this.currentMaterial;
        }

        restoreCurrent() {
            let mat = this.getMaterialsFromSelection();
            if (this._materialBackup && mat.length) {
                mat[0].assign(this._materialBackup);
            }
        }

        // Apply the currentMaterial to the first selected material, using a command
        // if commit==true
        applyToSelected(commit = false) {
            if (commit) {
                return commitMaterials.apply(this,[this.getMaterialsFromSelection(),false]);
            }
            else {
                let mat = this.getMaterialsFromSelection();
                if (mat.length && this.currentMaterial) {
                    mat[0].assign(this.currentMaterial);
                }
                return Promise.resolve();
            }
        }

        // Apply the currentMaterial to all the selection, using a command
        applyToAll() {
            if (!this.currentMaterial) {
                throw new Error("Unexpected applyToAll received: currentMaterial is null");
            }
            return commitMaterials.apply(this,[this.getMaterialsFromSelection(),true]);
        }
    }

    app.ui.MaterialHandler = MaterialHandler;

    let g_nodeHandler = null;
    class NodeHandler {
        static Get() {
            if (!g_nodeHandler) {
                g_nodeHandler = new NodeHandler();
            }
            return g_nodeHandler;
        }

        constructor() {
        }

        get selectedNodes() {
            let result = [];
            app.render.Scene.Get().selectionManager.selection.forEach((item) => {
                if (item.node) {
                    result.push(item.node);
                }
            });
            return result;
        }
    }
    
    angularApp.controller("SceneEditorController", ['$rootScope','$scope', function($rootScope,$scope) {
        $scope.isLocked = false;
        app.on('commandLockChanged', 'sceneEditorController', (params) => {
            setTimeout(() => {
                $scope.isLocked = params.locked;
            },50);
        });

        $scope.switchWorkspace = function() {
            app.switchWorkspace(app.Workspaces.ModelEditor);
        }

        // Main magerial, obtained from MaterialHandler
        $scope.currentMaterial = null;

        // This array stores the currently selected nodes

        $scope.tabs = ["Material","Components"];
        $scope.currentTab = 0;

        $scope.onMaterialChanged = function(material) {
            MaterialHandler.Get().applyToSelected(false);
            app.ComposerWindowController.Get().updateView();
        };

        $scope.onApplyToAll = function() {
            MaterialHandler.Get().applyToAll();
            app.ComposerWindowController.Get().updateView();
        };

        $scope.commitChanges = function() {
            MaterialHandler.Get().restoreCurrent();
            MaterialHandler.Get().applyToSelected(true);
            // Update the UI, to ensure that the material match the UI
            $scope.currentMaterial = MaterialHandler.Get().currentMaterial;
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        };

        app.render.Scene.Get().selectionManager.selectionChanged("sceneEditorController", (s) => {
            $scope.currentMaterial = MaterialHandler.Get().updateCurrentFromSelection();
            $scope.selection = NodeHandler.Get().selectedNodes;
        });

        app.CommandManager.Get().onRedo("sceneEditorController",() => {
            $scope.currentMaterial = MaterialHandler.Get().updateCurrentFromSelection();
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        });

        app.CommandManager.Get().onUndo("sceneEditorController",() => {
            $scope.currentMaterial = MaterialHandler.Get().updateCurrentFromSelection();
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        });

        app.render.Scene.Get().sceneWillClose("sceneEditorController", (oldScene) => {
            console.log("The scene will be closed");
            return true;
        });

        app.render.Scene.Get().sceneWillOpen("sceneEditorController", (oldScene,newScene) => {
            console.log("Open new scene");
        });

        $scope.libraryNodeSelected = function(node,resPath) {
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
    }]);
});