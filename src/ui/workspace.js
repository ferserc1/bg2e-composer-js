app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    
    angularApp.controller("SceneEditorController", ['$scope', function($scope) {
        $scope.currentMaterial = null;

        $scope.onMaterialChanged = function(material) {
            let firstSelected = app.render.Scene.Get().selectionManager.selection.length &&
                                app.render.Scene.Get().selectionManager.selection[0];
            if (firstSelected && firstSelected.material) {
                let cmd = new app.materialCommands.ApplyMaterial($scope.currentMaterial,firstSelected.material);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => app.ComposerWindowController.Get().updateView());
            }
        };

        $scope.onApplyToAll = function() {
            let targets = [];
            app.render.Scene.Get().selectionManager.selection.forEach((item) => {
                if (item.material) {
                    targets.push(item.material);
                }
            });
            if (targets.length) {
                let cmd = new app.materialCommands.ApplyMaterial($scope.currentMaterial,targets);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => app.ComposerWindowController().Get().updateView());
            }
        };

        function getMaterialFromSelection(force=false) {
            let mat = null;
            app.render.Scene.Get().selectionManager.selection.some((item) => {
                mat = item.material;
                return mat!=null; 
            });
            if (mat!=$scope.currentMaterial || force) {
                if (mat) {
                    $scope.currentMaterial = new bg.base.Material();
                    $scope.currentMaterial.assign(mat);
                }
                else {
                    $scope.currentMaterial = null;
                }
            }
        }
        app.render.Scene.Get().selectionManager.selectionChanged("sceneEditorController", (s) => {
            getMaterialFromSelection();
        });

        app.CommandManager.Get().onRedo("sceneEditorController",() => {
            $scope.$apply(() => {
                getMaterialFromSelection(true);
            });
        });

        app.CommandManager.Get().onUndo("sceneEditorController",() => {
            $scope.$apply(() => {
                getMaterialFromSelection(true);
            });
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

app.addWorkspace(() => {
    return {
        name:"Scene editor",
        endpoint:'/sceneEditor',
        templateUrl: `templates/${ app.config.templateName }/views/scene-editor.html`,
        controller: 'SceneEditorController',
        isDefault:true
    }
});