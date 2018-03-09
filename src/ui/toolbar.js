app.addDefinitions(() => {
    app.ui = app.ui || {};

    let g_toolbar = null;

    class Toolbar {
        static Get() {
            if (!g_toolbar) {
                g_toolbar = new Toolbar();
            }
            return g_toolbar;
        }

        constructor() {
            this._items = app.config.toolbar;
        }

        get items() {
            return this._items;
        }
    }

    app.ui.Toolbar = Toolbar;
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ToolbarController", ['$scope',function($scope) {
        $scope.toolbarItems = app.ui.Toolbar.Get().items;
        $scope.commandLock = false;

        $scope.action = function(item) {
            app.CommandHandler.Trigger(item.command, {});
        }

        $scope.isVisible = function(item) {
            return item.allowOnLocked || !$scope.commandLock;
        }

        app.on('commandLockChanged', "toolbar", (params) => {
            setTimeout(() => {
                $scope.commandLock = params.locked;
                $scope.$apply();
            },50);
        });
    }]);

    angularApp.directive('toolbar', () => {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/toolbar.html`,
            compile: app.workspaceElementCompile(),
            controller: 'ToolbarController'
        }
    })
});