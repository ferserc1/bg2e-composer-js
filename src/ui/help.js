app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("AboutViewController",['$scope',function($scope) {
        let package = require(__dirname + '/package.json');
        $scope.versionString = package.version;

        $scope.otherCopyrightNotices = app.copyrightNotices;

        $scope.openLink = function(link) {
            var shell = require('electron').shell;
            shell.openExternal(link);
        }
    }]);

    angularApp.directive("about", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/about.html`,
       //     compile: app.workspaceElementCompile(),
            scope: {},
            controller: 'AboutViewController'
        }
    });

    app.ui = app.ui || {};

    class Help {
        static ShowAbout() {
            app.ui.DialogView.Show({
                templateUrl:`templates/${ app.config.templateName }/directives/about-view.html`,
                title:"About",
                showClose: false,
                type: 'modal-center',
                onAccept:() => { return true; }
            })
                .then((s) => {})
                .catch((err) => console.log(err));
        }
    }

    app.ui.Help = Help;
})