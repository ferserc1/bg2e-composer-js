app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryInspectorController",['$scope',function($scope) {
        let libMgr = app.library.Manager.Get();
        function update(library) {
            setTimeout(() => {
                $scope.libraryName = library.filePath || "(Library not saved)";
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
            libMgr.current.deselectAll();
            libMgr.current.currentNode = node;
            libMgr.notifyLibraryChanged();
        };

        $scope.selectNode = function(node,event) {
            if (!event.shiftKey) {
                libMgr.current.deselectAll();
            }
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
        };

        $scope.addToSelection = function(node) {
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
        };

        $scope.getIconClass = function(node) {
            return "bg2-library-item-" + node.type;
        }

        $scope.addNode = function() {
            libMgr.current.addNode(app.library.NodeType.GROUP);
            libMgr.notifyLibraryChanged();
        };

        $scope.removeNode = function() {

        };

        $scope.copySelection = function() {

        };

        $scope.cutSelection = function() {

        };

        $scope.paste = function() {

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