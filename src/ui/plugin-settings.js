app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("PluginSettingsController",['$scope', function($scope) {
        let directives = app.getPluginSettingsDirectives();
        $scope.pluginPath = "";
        $scope.pluginSearchPaths = [];

        function updatePluginPathsUI() {
            $scope.pluginSearchPaths = [];
            app.plugins.customPaths.forEach((p) => {
                $scope.pluginSearchPaths.push(p);
            });
        }

        updatePluginPathsUI();
        
        $scope.reloadApp = function() {
            if (confirm("All the unsaved changes will be lost, Do you want to continue?")) {
                window.location.href = "";
                window.reload();
            }
        }

        $scope.showDevTools = function() {
            let { remote } = require('electron');
            remote.getCurrentWindow().toggleDevTools();
        }

        $scope.pluginPathSelected = function() {
            // Do something when the user push the path selection button
        }

        $scope.addPluginPath = function() {
            if ($scope.pluginPath != "") {
                app.plugins.addCustomPath($scope.pluginPath);
                updatePluginPathsUI();
                $scope.pluginPath = "";
            }
        }

        $scope.removePath = function(path) {
            app.plugins.removeCustomPath(path);
            updatePluginPathsUI();
        }
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
                    let content = null;
                    try {
                        let linkFn = $compile(htmlCode);
                        content = linkFn(scope);
                        element.append(content);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            },
            controller: 'PluginSettingsController'
        };
    }]);
})