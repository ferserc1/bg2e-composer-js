app.addDefinitions(() => {
    app.ui = app.ui || {};

});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("StatusBarController", ['$scope',function($scope) {

    }]);

    angularApp.directive("statusBar", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/status-bar.html`,
            controller: 'StatusBarController'
        };
    });
});
