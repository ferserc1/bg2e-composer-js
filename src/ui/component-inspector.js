app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ComponentInspectorController",['$scope',function($scope) {

    }]);

    angularApp.directive("componentInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/component-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {

            },
            controller: 'ComponentInspectorController'
        };
    });
})