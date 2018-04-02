app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryNodeEditorController",["$scope",function($scope) {
        let libMgr = app.library.Manager.Get();

        function updateSelection() {
            setTimeout(() => {
                $scope.node = libMgr.current.selection[0];
                if ($scope.node) {
                    $scope.id = $scope.node.id;
                    $scope.name = $scope.node.name;
                    $scope.icon = libMgr.current.getResourceAbsolutePath($scope.node.icon);
                }

                $scope.$apply();
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