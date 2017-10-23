app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive('sceneCanvas', function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/scene-canvas.html`,
            scope: {

            },
            link: function($scope,elem) {
                let canvas = elem[0].children[0];
                let ctrl = new app.ComposerWindowController();
                let mainLoop = bg.app.MainLoop.singleton;
            
                mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
                mainLoop.canvas = canvas;
                mainLoop.run(ctrl);
            },
            controller: ['$scope', function($scope) {
                
            }]
        }
    })
});