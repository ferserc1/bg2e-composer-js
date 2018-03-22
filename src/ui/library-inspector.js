app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryInspectorController",['$scope',function($scope) {
        function update(library) {
            setTimeout(() => {
                $scope.currentNode = library.currentNode;
                $scope.$apply();
            },50);
        }

        app.library.Manager.Get().libraryChanged("libraryInspector",(library) => {
            update(library);
        });
        
        update(app.library.Manager.Get().current);
    }]);

    angularApp.directive("libraryInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/library-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {
            },
            controller: 'LibraryInspectorController'
        }
    })
});