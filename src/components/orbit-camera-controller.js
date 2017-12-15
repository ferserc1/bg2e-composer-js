app.addSource(() => {
    app.components.addComponent(() => {
        return class OrbitCameraControllerUI extends app.components.ComponentUI {
            constructor() {
                super("bg.manipulation.OrbitCameraController","Orbit Camera Controller","orbit-camera-controller-ui");
            }

            createInstance() {
                let cameraController = new bg.manipulation.OrbitCameraController();
                cameraController._minX = -Number.MAX_VALUE;
                cameraController._maxX =  Number.MAX_VALUE;
                cameraController._minY = -Number.MAX_VALUE;
                cameraController._maxY =  Number.MAX_VALUE;
                cameraController._minZ = -Number.MAX_VALUE;
                cameraController._maxZ =  Number.MAX_VALUE;
                cameraController.maxPitch = 90;
                cameraController.minPitch = -90;
                cameraController.maxDistance = Number.MAX_VALUE;
                return cameraController;
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("orbitCameraControllerUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/orbit-camera-controller-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope',function($scope) {
                
            }]
        }
    })
})