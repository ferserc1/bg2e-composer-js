app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryInspectorController",['$scope',function($scope) {
        let libMgr = app.library.Manager.Get();
        function update(library) {
            setTimeout(() => {
                $scope.currentNode = library.currentNode;
                $scope.navigator = library.navigator;
                $scope.$apply();
            },50);
        }

        libMgr.libraryChanged("libraryInspector",(library) => {
            update(library);
        });
        
        update(libMgr.current);

        $scope.enterNode = function(node) {
            libMgr.current.currentNode = node;
            libMgr.notifyLibraryChanged();
        };

        $scope.selectNode = function(node) {
            
        };
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