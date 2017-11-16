app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("MaterialEditorController",['$scope',function($scope) {
        $scope.slidertest = {
            value: 0,
            options: {
                floor: 0,
                ceil: 1,
                step: 0.0001,
                precision: 3
            }
        }

        $scope.diffuseColor = [0,0,0.88,1];
        $scope.specularColor = [0,0,0,1];
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