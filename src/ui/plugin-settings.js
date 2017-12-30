app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("PluginSettingsController",['$scope', function($scope) {

    }]);

    angularApp.directive("pluginSettings", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/plugin-settings.html`,
            controller: 'PluginSettingsController'
        };
    });
})