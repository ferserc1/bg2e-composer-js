app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("PluginSettingsController",['$scope', function($scope) {
        let directives = app.getPluginSettingsDirectives();

    }]);

    angularApp.directive("pluginSettings", ['$compile', function($compile) {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/plugin-settings.html`,
            link: function(scope,element) {
                let htmlCode = "";
                app.getPluginSettingsDirectives().forEach((directive) => {
                    htmlCode += `
                    <div class="bg2-widget-panel">
                        <${ directive }></${ directive }>
                    </div>
                    `
                });
                if (htmlCode) {
                    let linkFn = $compile(htmlCode);
                    let content = linkFn(scope);
                    element.append(content);
                }
            },
            controller: 'PluginSettingsController'
        };
    }]);
})