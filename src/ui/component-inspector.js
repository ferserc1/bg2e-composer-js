app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ComponentInspectorController",['$scope',function($scope) {
        $scope.selection = $scope.selection || [];
        $scope.selectedNode = null;
        $scope.components = [];

        $scope.$watch("selection",function() {
            $scope.selectedNode = $scope.selection.length && $scope.selection[0];
            $scope.components = [];
            $scope.unknownComponents = [];
            if ($scope.selectedNode) {
                for (let identifier in $scope.selectedNode._components)  {
                    let instance = $scope.selectedNode.component(identifier);
                    let ui = app.components.getUIForComponent(identifier) || {};
                    if (ui) {
                        ui.componentInstance = instance;
                        $scope.components.push(ui);
                    }
                    else {
                        $scope.unknownComponents.push(identifier);
                    }
                }
            }
        });
        
        $scope.addComponent = function() {

        };


    }]);

    angularApp.directive("componentInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/component-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {
                selection:"="
            },
            controller: 'ComponentInspectorController'
        };
    });
})