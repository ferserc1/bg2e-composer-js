app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("MaterialEditorController",['$scope',function($scope) {
        $scope.slidertest = {
            value: 10
        }
    }]);

    angularApp.directive("materialEditor", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/material-editor.html`,
            compile: app.workspaceElementCompile(),
            controller: 'MaterialEditorController'
        };
    });
})