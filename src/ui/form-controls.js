app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("colorPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/color-picker.html`,
            scope: {
                label:"@",
                value:"="
            },
            controller: ['$scope', function($scope) {
                $scope.options = {
                    floor: 0,
                    ceil: 1,
                    step: 0.0001,
                    precision: 2
                }

                $scope.preview = { 'background-color': 'rgba(0,0,0,0)' };
                $scope.$watch("value", () => {
                    $scope.preview['background-color'] = 'rgba('
                        + Math.round($scope.value[0] * 255) + ',' +
                        + Math.round($scope.value[1] * 255) + ',' +
                        + Math.round($scope.value[2] * 255) + ',' +
                        + $scope.value[3] + ')';
                }, true);
            }]
        };
    });
})