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

        $scope.items = [
            { id:0, label:"R" },
            { id:1, label:"G" },
            { id:2, label:"B" },
            { id:3, label:"A" }
        ];
        $scope.channel = $scope.items[0];

        $scope.invert = true;

        $scope.vec2 = [0,0];
        $scope.vec3 = [0,0,4];
        $scope.vec4 = [0,0,1,2];
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