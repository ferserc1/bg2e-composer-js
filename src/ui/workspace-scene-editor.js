app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

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
            app.ui.MaterialHandler.Get().applyToSelected(false);
            app.ComposerWindowController.Get().updateView();
        };

        $scope.onApplyToAll = function() {
            app.ui.MaterialHandler.Get().applyToAll();
            app.ComposerWindowController.Get().updateView();
        };

        $scope.convertToPBR = function() {
            app.ui.MaterialHandler.Get().convertToPBR();
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
            $scope.selection = NodeHandler.Get().selectedNodes;
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

        app.render.Scene.Get().sceneWillClose("sceneEditorController", (oldScene) => {
            console.log("The scene will be closed");
            return true;
        });

        app.render.Scene.Get().sceneWillOpen("sceneEditorController", (oldScene,newScene) => {
            console.log("Open new scene");
        });

        $scope.libraryNodeSelected = app.workspaceUtilities.libraryNodeSelected;
    }]);
});