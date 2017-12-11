app.addSource(() => {
    app.components.addComponent(() => {
        return class LightUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Light","Light","light-ui");
            }

            createInstance() {
                let light = new bg.base.Light(app.ComposerWindowController.Get().gl);
                light.ambient = bg.Color.Black();
                light.diffuse = new bg.Color(0.95,0.95,0.95,1);
                light.specular = new bg.Color(1,1,1,1);
                light.type = bg.base.LightType.POINT;
                return new bg.scene.Light(light);
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("lightUi",function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/light-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope',function($scope) {

            }]
        }
    });
})