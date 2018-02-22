
module.exports = function(app,angularApp,bg) {
    
    angularApp.directive("raytracerPluginSettings", function() {
        return {
            restrict: 'E',
            template:
            `
                <h2>Raytracer</h2>
            `,
            controller: ['$scope',function($scope) {
                
            }]
        }
    });



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
                templateUrl:`templates/${ app.config.templateName }/directives/add-component-view.html`,
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