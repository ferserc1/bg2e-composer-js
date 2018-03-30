app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryEditorController",['$rootScope','$scope',function($rootScope,$scope) {
        $scope.selectedNode = null;
    }])
});