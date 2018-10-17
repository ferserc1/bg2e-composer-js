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
            app.switchWorkspace(app.Workspaces.SceneEditor);
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

        $scope.libraryNodeSelected = app.workspaceUtilities.libraryNodeSelected;

        $scope.currentMaterial = null;

        $scope.onApplyToAll = function() {
            app.ui.MaterialHandler.Get().applyToAll();
            app.ComposerWindowController.Get().updateView();
        };

        $scope.commitChanges = function() {
            app.ui.MaterialHandler.Get().restoreCurrent();
            app.ui.MaterialHandler.Get().applyToSelected(true);
            // Update the UI, to ensure that the material match the UI
            $scope.currentMaterial = app.ui.MaterialHandler.Get().currentMaterial;
            $rootScope.$emit("bg2UpdateMaterialUI");
            app.ComposerWindowController.Get().updateView();
        };

        app.render.Scene.Get().selectionManager.selectionChanged("sceneEditorController", (s) => {
            $scope.currentMaterial = app.ui.MaterialHandler.Get().updateCurrentFromSelection();
        });

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