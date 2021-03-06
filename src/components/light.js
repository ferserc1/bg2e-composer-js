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

            updateLight(params) {
                return new Promise((resolve,reject) => {
                    app.CommandManager.Get().doCommand(
                        new app.lightCommands.SetLightParameters(this.componentInstance.light,params)
                    )
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
                });
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
                $scope.onCommitChanges = function() {
                    let params = {
                        type:$scope.type.id,
                        enabled:$scope.enabled,
                        ambient:new bg.Vector4($scope.ambient),
                        diffuse:new bg.Vector4($scope.diffuse),
                        specular:new bg.Vector4($scope.specular),
                        intensity:$scope.intensity,
                        constantAttenuation:$scope.constantAttenuation,
                        linearAttenuation:$scope.linearAttenuation,
                        quadraticAttenuation:$scope.quadraticAttenuation,
                        cutoffDistance:$scope.cutoffDistance,
                        castShadows:$scope.castShadows,
                        //shadowBias:$scope.shadowBias,
                        shadowStrength:$scope.shadowStrength,
                        spotCutoff:$scope.spotCutoff,
                        spotExponent:$scope.spotExponent
                    };
                    $scope.component.updateLight(params)
                        .then(() => {
                            app.ComposerWindowController.Get().updateView();
                            $scope.$apply(() => updateUI());
                        })
                }

                $scope.lightTypes = [
                    { id:bg.base.LightType.DIRECTIONAL, label:'Directional' },
                    { id:bg.base.LightType.SPOT, label:'Spot' },
                    { id:bg.base.LightType.POINT, label:'Point' }
                ];

                $scope.showSpot = false;
                $scope.showDirectional = false;
                $scope.showPoint = false;

                $scope.pbrMode = app.ComposerWindowController.Get().renderModel==app.RenderModel.PBR;

                function updateUI() {
                    let l = $scope.component.componentInstance.light;
                    $scope.showSpot = false;
                    $scope.showDirectional = false;
                    $scope.showPoint = false;
                    switch (l.type) {
                    case bg.base.LightType.DIRECTIONAL:
                        $scope.type = $scope.lightTypes[0];
                        $scope.showDirectional = true;
                        break;
                    case bg.base.LightType.SPOT:
                        $scope.type = $scope.lightTypes[1];
                        $scope.showSpot = true;
                        break;
                    case bg.base.LightType.POINT:
                        $scope.type = $scope.lightTypes[2];
                        $scope.showPoint = true;
                        break;
                    }
                    $scope.enabled = l.enabled;
                    $scope.ambient = l.ambient.toArray();
                    $scope.diffuse = l.diffuse.toArray();
                    $scope.specular = l.specular.toArray();
                    $scope.intensity = l.intensity;
                    $scope.constantAttenuation = l.constantAttenuation;
                    $scope.linearAttenuation = l.linearAttenuation;
                    $scope.quadraticAttenuation = l.quadraticAttenuation;
                    $scope.cutoffDistance = l.cutoffDistance;
                    $scope.castShadows = l.castShadows;
                    $scope.shadowBias = l.shadowBias;
                    $scope.shadowStrength = l.shadowStrength;
                    $scope.spotCutoff = l.spotCutoff;
                    $scope.spotExponent = l.spotExponent;
                }

                updateUI();
            }]
        }
    });
})