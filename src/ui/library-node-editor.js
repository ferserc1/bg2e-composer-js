app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryNodeEditorController",["$scope",function($scope) {
        $scope.test = "Hello";

        let libMgr = app.library.Manager.Get();

        function updateSelection() {
            setTimeout(() => {
                $scope.node = libMgr.current.selection[0];
                $scope.$apply();
            },50);
        }

        libMgr.current.selectionChanged("libraryNodeEditor", (selection) => {
            updateSelection();
        });
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