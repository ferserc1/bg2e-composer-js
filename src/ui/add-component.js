app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("addComponent", function() {
        return {
            restrict:"E",
            templateUrl:`templates/${ app.config.templateName }/directives/add-component.html`,
            scope:{
                selected:"="
            },
            controller: ['$scope',function($scope) {
                $scope.componentList = [];
                $scope.selected = null;

                for (let key in app.components.componentList) {
                    let compUI = app.components.componentList[key];
                    $scope.componentList.push({
                        id:key,
                        name:compUI.componentName,
                        componentUI:compUI,
                        isSelected:false
                    });
                }

                $scope.select = function(sel) {
                    $scope.selected = sel.componentUI;
                    $scope.componentList.forEach((item) => {
                        item.isSelected = item==sel;
                    });
                }
            }]
        }
    });
})