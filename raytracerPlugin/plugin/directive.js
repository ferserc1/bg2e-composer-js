
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


    function doRenderLightmaps() {
        return new Promise((resolve,reject) => {
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
                    type: 'modal-full'
                })
                    .then((comp) => {
                        resolve(comp);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
            else {
                throw new Error("No steady nodes with drawable components found in the scene");
            }
        });
    }

    app.raytracer.renderLightmaps = function() {
        return new Promise((resolve,reject) => {
            app.CommandHandler.Get('FileCommandHandler').saveScene()
                .then((status) => {
                    if (!status) {
                        throw new Error("You need to save the scene to generate lightmaps.");
                    }
                    return doRenderLightmaps();
                })
    
                .then(() => {
                    resolve();
                })
    
                .catch((err) => {
                    alert(err.message);
                });
        })
     }

     return {
         menu: {
             label: 'Plugins',
             menu: [
                 { 
                    label:"Render Global Ilumination", click: function(item, focusedWindow) {
                        focusedWindow.webContents.send('triggerMenu', { msg:'renderGlobalIlumination' })
                    }
                }
             ]
         }
     };
}