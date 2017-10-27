app.addDefinitions(() => {
    app.ui = app.ui || {};

});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("SceneInspectorController", ['$scope',function($scope) {

    }]);

    angularApp.directive('sceneInspector', () => {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/scene-inspector.html`,
            controller: 'SceneInspectorController'
        };
    });
})