app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryNodeEditorController",["$scope",function($scope) {
        let libMgr = app.library.Manager.Get();

        function updateMaterialNode() {
            let node = app.render.Scene.Get().materialNode;
            let drw = node.drawable;
            let mat = drw && drw.getMaterial(0);
            if (mat) {
                mat.assign($scope.material);
            }
        }

        function updateSelection() {
            setTimeout(() => {
                let gl = app.ComposerWindowController.Get().gl;
                $scope.node = libMgr.current.selection[0];
                if ($scope.node) {
                    $scope.id = $scope.node.id;
                    $scope.name = $scope.node.name;
                    $scope.icon = libMgr.current.getResourceAbsolutePath($scope.node.icon);
                }

                if ($scope.node && $scope.node.type=="material") {
                    app.render.Scene.Get().materialNode.enabled = true;
                    app.render.Scene.Get().resetLibraryCamera();
                    $scope.material = new bg.base.Material();
                    let modifier = new bg.base.MaterialModifier($scope.node.materialModifier);
                    $scope.material.applyModifier(gl, modifier, libMgr.current.repoPath);
                    updateMaterialNode();
                }
                else {
                    $scope.material = null;
                    app.render.Scene.Get().materialNode.enabled = false;
                }
                $scope.$apply();
                app.ComposerWindowController.Get().updateView();
            },50);
        }

        libMgr.current.selectionChanged("libraryNodeEditor", (selection) => {
            updateSelection();
        });

        $scope.saveChanges = function() {
            if ($scope.node) {
                $scope.node.id = $scope.id;
                $scope.node.name = $scope.name;
                $scope.node.icon = libMgr.current.getResourceLocalPath($scope.icon);

                libMgr.current.save();
            }
        }

        $scope.onApplyToAll = function() {

        }

        $scope.commitChanges = function() {

        }

        $scope.onMaterialChanged = function() {

        }


    }]);

    angularApp.directive("libraryNodeEditor", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/library-node-editor.html`,
            compile: app.workspaceElementCompile(),
            scope: {
            },
            controller: 'LibraryNodeEditorController'
        };
    })
})