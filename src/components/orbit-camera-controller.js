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
                cameraController.enabled = false;
                return cameraController;
            }

            saveConstraints(minD,maxD,minP,maxP,minX,maxX,minY,maxY,minZ,maxZ) {
                minD = minD===null ? -Number.MAX_VALUE : minD;
                maxD = maxD===null ?  Number.MAX_VALUE : maxD;
                minX = minX===null ? -Number.MAX_VALUE : minX;
                maxX = maxX===null ?  Number.MAX_VALUE : maxX;
                minY = minY===null ? -Number.MAX_VALUE : minY;
                maxY = maxY===null ?  Number.MAX_VALUE : maxY;
                minZ = minZ===null ? -Number.MAX_VALUE : minZ;
                maxZ = maxZ===null ?  Number.MAX_VALUE : maxZ;

                return app.CommandManager.Get().doCommand(
                    new app.orbitCameraCommands.SetConstraints(
                        this.componentInstance,
                        minD,maxD,minP,maxP,minX,maxX,minY,maxY,minZ,maxZ
                    )
                )
            }

            setGizmoProperties(showLimits,gizmoColor) {
                this.componentInstance.showLimitGizmo = showLimits;
                this.componentInstance.limitGizmoColor = new bg.Color(gizmoColor);
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
                function updateUI() {
                    if (!$scope.component) return;

                    $scope.rotation = $scope.component.componentInstance.rotation.toArray();
                    $scope.distance = $scope.component.componentInstance.distance;
                    $scope.center = $scope.component.componentInstance.center.toArray();

                    $scope.minDistance = $scope.component.componentInstance.minDistance!=-Number.MAX_VALUE ? $scope.component.componentInstance.minDistance : null;
                    $scope.maxDistance = $scope.component.componentInstance.maxDistance!= Number.MAX_VALUE ? $scope.component.componentInstance.maxDistance : null;
                    $scope.minPitch = $scope.component.componentInstance.minPitch;
                    $scope.maxPitch = $scope.component.componentInstance.maxPitch;
                    $scope.minX = $scope.component.componentInstance.minX!=-Number.MAX_VALUE ? $scope.component.componentInstance.minX : null;
                    $scope.maxX = $scope.component.componentInstance.maxX!= Number.MAX_VALUE ? $scope.component.componentInstance.maxX : null;
                    $scope.minY = $scope.component.componentInstance.minY!=-Number.MAX_VALUE ? $scope.component.componentInstance.minY : null;
                    $scope.maxY = $scope.component.componentInstance.maxY!= Number.MAX_VALUE ? $scope.component.componentInstance.maxY : null;
                    $scope.minZ = $scope.component.componentInstance.minZ!=-Number.MAX_VALUE ? $scope.component.componentInstance.minZ : null;
                    $scope.maxZ = $scope.component.componentInstance.maxZ!= Number.MAX_VALUE ? $scope.component.componentInstance.maxZ : null;

                    $scope.showLimits = $scope.component.componentInstance.showLimitGizmo;
                    $scope.gizmoColor = $scope.component.componentInstance.limitGizmoColor.toArray();
                }

                $scope.$watch("rotation",() => {
                    $scope.component.componentInstance.enabled = true;
                    $scope.component.componentInstance.rotation.x = isNaN($scope.rotation[0]) ? $scope.component.componentInstance.rotation.x : $scope.rotation[0];
                    $scope.component.componentInstance.rotation.y = isNaN($scope.rotation[1]) ? $scope.component.componentInstance.rotation.y : $scope.rotation[1];
                    $scope.component.componentInstance.frame(0);
                    $scope.component.componentInstance.enabled = false;
                    app.ComposerWindowController.Get().updateView();
                },true)

                $scope.$watch("distance", () => {
                    $scope.component.componentInstance.enabled = true;
                    $scope.component.componentInstance.distance = isNaN($scope.distance) ? $scope.component.componentInstance.distance : $scope.distance;
                    $scope.component.componentInstance.frame(0);
                    $scope.component.componentInstance.enabled = false;
                    app.ComposerWindowController.Get().updateView();
                })

                $scope.$watch("center",() => {
                    $scope.component.componentInstance.enabled = true;
                    $scope.component.componentInstance.center.x = isNaN($scope.center[0]) ? $scope.component.componentInstance.center.x : $scope.center[0];
                    $scope.component.componentInstance.center.y = isNaN($scope.center[1]) ? $scope.component.componentInstance.center.y : $scope.center[1];
                    $scope.component.componentInstance.center.z = isNaN($scope.center[2]) ? $scope.component.componentInstance.center.z : $scope.center[2];
                    $scope.component.componentInstance.frame(0);
                    $scope.component.componentInstance.enabled = false;
                    app.ComposerWindowController.Get().updateView();
                },true)

                $scope.onCommitChanges = function() {
                    $scope.component.saveConstraints(
                        $scope.minDistance,$scope.maxDistance,
                        $scope.minPitch,$scope.maxPitch,
                        $scope.minX,$scope.maxX,$scope.minY,$scope.maxY,$scope.minZ,$scope.maxZ
                    )
                    .then(() => {
                        app.ComposerWindowController.Get().updateView();
                    });
                };

                $scope.updateGizmo = function() {
                    $scope.component.setGizmoProperties($scope.showLimits,$scope.gizmoColor);
                    app.ComposerWindowController.Get().updateView();
                };

                $scope.$watch('gizmoColor',() => {
                    $scope.component.setGizmoProperties($scope.showLimits,$scope.gizmoColor);
                    app.ComposerWindowController.Get().updateView();
                });

                app.CommandManager.Get().onUndo(() => {
                    updateUi();
                    $scpoe.$apply();
                });

                app.CommandManager.Get().onRedo(() => {
                    updateUi();
                    $scpoe.$apply();
                });

                updateUI();
            }]
        }
    })
})