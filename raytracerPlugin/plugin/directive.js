
module.exports = function(app,angularApp,bg) {
    
    angularApp.directive("raytracerPluginSettings", function() {
        return {
            restrict: 'E',
            templateUrl:__dirname + '/../templates/raytracer-ui-settings.html',
            controller: ['$scope',function($scope) {
               
            }]
        }
    });

    angularApp.directive("raytracerUi", function() {
        return {
            restrict: 'E',
            templateUrl:__dirname + '/../templates/raytracer-ui.html',
            controller: ['$scope',function($scope) {
                $scope.qualityOptions = [
                    { id:0, label:'Draft' },
                    { id:1, label:'Medium' },
                    { id:2, label:'High' }
                ];
                $scope.quality = $scope.qualityOptions[0];
                $scope.beginRender = function() {
                    $scope.rendering = true;

                    // TODO: Implement this
                    setTimeout(() => {
                        renderingDone();
                    },2000);
                };
                $scope.cancel = function() {
                    app.ui.DialogView.Close()
                };
                $scope.rendering = false;

                function renderingDone() {
                    app.ui.DialogView.Close();
                }
            }]
        }
    })



    app.raytracer.renderLightmaps = function() {
        let sceneRoot = app.render.Scene.Get().root;
        let findDrawables = new bg.scene.FindComponentVisitor("bg.scene.Drawable");
        sceneRoot.accept(findDrawables);

        let drawablesToRender = [];
        findDrawables.result.forEach((node) => {
            if (node.steady) {
                drawablesToRender.push(node.drawable);
            }
        });

        if (drawablesToRender.length>0) {
            // TODO: Implement the rendering process interface
            app.ui.DialogView.Show({
                templateUrl:__dirname + '/../templates/raytracer-ui-view.html',
                title:"Add Component",
                showClose: false,
                type: 'modal-full',
                onAccept:(result) => { return result; }
            })
                .then((comp) => {
                    
                })
                .catch((err) => console.log(err));
        }
        else {
            alert("No steady nodes with drawable components found in the scene");
        }
     }
}