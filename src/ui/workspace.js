app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    function commitMaterials(target,multi=true) {
        return new Promise((resolve,reject) => {
            if (!this.currentMaterial) {
                reject(new Error("Current material is null"));
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
    }]);
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ModelEditorController", ['$rootScope','$scope',function($rootScope,$scope) {

    }]);
});

app.addWorkspace(() => {
    return {
        name:"Scene editor",
        endpoint:'/sceneEditor',
        templateUrl: `templates/${ app.config.templateName }/views/scene-editor.html`,
        controller: 'SceneEditorController',
        isDefault:true
    };
});

app.addWorkspace(() => {
    return {
        name:"Model editor",
        endpoint:'/modelEditor',
        templateUrl: `templates/${ app.config.templateName }/views/model-editor.html`,
        controller: 'ModelEditorController',
        isDefault: false
    };
});