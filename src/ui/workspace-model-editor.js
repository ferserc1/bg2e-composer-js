app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ModelEditorController", ['$rootScope','$scope',function($rootScope,$scope) {
        // Main magerial, obtained from MaterialHandler
        $scope.currentMaterial = null;
        $scope.isLocked = false;
        app.on('commandLockChanged', 'sceneEditorController', (params) => {
            setTimeout(() => {
                $scope.isLocked = params.locked;
            },50);
        })

        $scope.switchWorkspace = function() {
            location.hash = "#!/sceneEditor";
        }

        app.render.Scene.Get().selectionManager.selectionChanged("sceneEditorController", (s) => {
            $scope.currentMaterial = app.ui.MaterialHandler.Get().updateCurrentFromSelection();
        });

        $scope.onMaterialChanged = function(material) {
            app.ui.MaterialHandler.Get().applyToSelected(false);
            app.ComposerWindowController.Get().updateView();
        };

        app.CommandManager.Get().onRedo("sceneEditorController",() => {
            $scope.currentMaterial = app.ui.MaterialHandler.Get().updateCurrentFromSelection();
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        });

        app.CommandManager.Get().onUndo("sceneEditorController",() => {
            $scope.currentMaterial = app.ui.MaterialHandler.Get().updateCurrentFromSelection();
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        });
    }]);
});