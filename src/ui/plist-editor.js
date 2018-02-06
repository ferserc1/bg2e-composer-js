app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("PlistEditorController",['$rootScope','$scope',function($rootScope,$scope) {

    }]);

    angularApp.directive("plistEditor", function() {
        return {
            restrict:'E',
            templateUrl:`templates/${ app.config.templateName }/directives/plist-editor.html`,
            compile: app.workspaceElementCompile(),
            scope: {

            },
            controller: 'PlistEditorController'
        }
    })
})