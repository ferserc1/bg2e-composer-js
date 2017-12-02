app.addSource(() => {
    app.components.addComponent(() => {
        return class CameraUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Camera","Camera","camera-ui");
            }

            get camera() { return this.componentInstance; }

            get near() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.near;
            }

            get far() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.far;
            }

            get fov() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.fov;
            }

            get focalLength() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.focalLength;
            }

            get frameSize() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.frameSize;
            }

            get projectionType() {
                if (!this.camera.projectionStrategy) {
                    return 0;
                }
                else if (this.camera.projectionStrategy instanceof bg.scene.PerspectiveProjectionStrategy) {
                    return 1;
                }
                else if (this.camera.projectionStrategy instanceof bg.scene.OpticalProjectionStrategy) {
                    return 2;
                }
            }

            setProjectionType(type) {
                let strategy = null;
                switch (type) {
                case 0:
                    break;
                case 1:
                    strategy = new bg.scene.PerspectiveProjectionStrategy();
                    break;
                case 2:
                    strategy = new bg.scene.OpticalProjectionStrategy();
                    break;
                }
                let cmd = new app.cameraCommands.SetProjectionStrategy(this.camera,strategy);
                return app.CommandManager.Get().doCommand(cmd);
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("cameraUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/camera-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope',function($scope) {
                $scope.testMessage = "Hello from camera UI";

                $scope.projections = [
                    { id: 0, label:"Auto" },
                    { id: 1, label:"Perspective Projection" },
                    { id: 2, label:"Lens Projection" },
                ]
                
                function updateValues() {
                    if (!$scope.component) return false;
                    
                    $scope.projectionType = $scope.projections[$scope.component.projectionType];
                    
                    // Clip planes
                    $scope.near = $scope.component.near;
                    $scope.far = $scope.component.far;
    
                    // Projection strategies
                    $scope.fov = $scope.component.fov;
                    $scope.focalLength = $scope.component.focalLength;
                    $scope.frameSize = $scope.component.frameSize;

                    return true;
                }

                $scope.changeProjection = function() {
                    let type = $scope.projectionType.id;
                    $scope.component.setProjectionType(type)
                        .then(() => {
                            app.ComposerWindowController.Get().postReshape()
                            app.ComposerWindowController.Get().updateView();
                            updateValues();
                            $scope.$apply();
                        });
                }

                // Handle undo/redo
                app.CommandManager.Get().onRedo("cameraUI", () => {
                    $scope.$apply(() => {
                        updateValues();
                    });
                });

                app.CommandManager.Get().onUndo("cameraUI", () => {
                    $scope.$apply(() => {
                        updateValues();
                    });
                });

                updateValues();
            }]
        };
    });
});