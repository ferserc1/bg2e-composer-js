app.addSource(() => {
    app.components.addComponent(() => {
        return class CameraUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Camera","Camera","camera-ui");
            }

            createInstance() {
                return new bg.scene.Camera();
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

            get viewWidth() {
                return this.camera.projectionStrategy && this.camera.projectionStrategy.viewWidth;
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
                else if (this.camera.projectionStrategy instanceof bg.scene.OrthographicProjectionStrategy) {
                    return 3;
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
                case 3:
                    strategy = new bg.scene.OrthographicProjectionStrategy();
                    break;
                }
                let cmd = new app.cameraCommands.SetProjectionStrategy(this.camera,strategy);
                return app.CommandManager.Get().doCommand(cmd);
            }

            saveProjection(fov,near,far) {
                if (this.projectionType==1) {
                    return app.CommandManager.Get().doCommand(
                        new app.cameraCommands.SavePerspective(this.camera,fov,near,far)
                    );
                }
                else {
                    return Promise.resolve();
                }
            }

            saveLens(focalLength,frameSize,near,far) {
                if (this.projectionType==2) {
                    return app.CommandManager.Get().doCommand(
                        new app.cameraCommands.SaveLens(this.camera,focalLength,frameSize,near,far)
                    )
                }
                else {
                    return Promise.resolve();
                }
            }

            setAsMain() {
                if (!this.isMainCamera) {
                    return app.CommandManager.Get().doCommand(
                        new app.cameraCommands.SetMain(this.camera)
                    );
                }
            }

            get isMainCamera() {
                return app.render.Scene.Get().camera == this.camera;
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    let s_previewWindow = null;
    let s_previewCamera = null;
    let s_previewSize = { w: 400, h: 400 };
    let s_updateTimer = null;

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
                    { id: 3, label:"Orthographic" }
                ]

                app.ComposerWindowController.Get().onViewUpdated("cameraUI", () => {
                    updateThumb();
                })

                function updateThumb() {
                    let sel = app.render.Scene.Get().selectionManager.selection;
                    if (sel[0] && sel[0].node && sel[0].node.camera==$scope.component.componentInstance) {
                        let renderer = app.ComposerWindowController.Get().lowQualityRenderer;
                        let scene = app.render.Scene.Get().root;
                        let cam = $scope.component.componentInstance;
                        $scope.cameraThumb = renderer.getImage(scene,cam,200,150,app.render.Scene.Get().camera);
                        app.ComposerWindowController.Get().display(false);
                        $scope.$apply();
                    }
                }
                
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

                    $scope.isMainCamera = $scope.component.isMainCamera;

                    setTimeout(() => {
                        updateThumb();
                    },10);

                    return true;
                }

                $scope.changeProjection = function() {
                    let type = $scope.projectionType.id;
                    $scope.component.setProjectionType(type)
                        .then(() => {
                            app.ComposerWindowController.Get().postReshape();
                            app.ComposerWindowController.Get().updateView();
                            updateValues();
                            $scope.$apply();
                        });
                }

                $scope.saveProjection = function() {
                    $scope.component.saveProjection($scope.fov,$scope.near,$scope.far)
                        .then(() => {
                            app.ComposerWindowController.Get().postReshape();
                            app.ComposerWindowController.Get().updateView();
                        });
                }

                function updatePreviewWindow() {
                    if (s_previewWindow && s_previewCamera) {
                        let renderer = app.ComposerWindowController.Get().lowQualityRenderer;
                        let scene = app.render.Scene.Get().root;

                        let image = renderer.getImage(
                            scene,
                            s_previewCamera,
                            s_previewSize.w,
                            s_previewSize.h);
                        let img = new Image();
                        img.src = image;
                        img.style = "position: absolute; left: 0px; top: 0px;";
                        s_previewWindow.document.body.innerHTML = "";
                        s_previewWindow.document.body.appendChild(img);
                        app.ComposerWindowController.Get().postRedisplay();
                    }
                }

                function updateTimerFunction() {
                    if (s_updateTimer && (!s_previewWindow || s_previewWindow.closed)) {
                        console.log("Preview camera update done.");
                        clearTimeout(s_updateTimer);
                        s_updateTimer = null;
                    }
                    else if (s_previewWindow && s_previewCamera) {
                        updatePreviewWindow();
                        s_updateTimer = setTimeout(updateTimerFunction, 250);
                    }
                }

                function startUpdatePreviewTimer() {
                    if (!s_updateTimer) {
                        updateTimerFunction();
                    }
                }

                $scope.showPreview = function() {
                    if (!s_previewWindow || s_previewWindow.closed) {
                        let w = s_previewSize.w;
                        let h = s_previewSize.h;
                        let params = `width=${w},height=${h},nodeIntegration=no`;
                        s_previewWindow = window.open("","Camera Preview",params);
                        s_previewWindow.onresize = (evt) => {
                            s_previewSize.w = evt.target.innerWidth;
                            s_previewSize.h = evt.target.innerHeight;
                        }
                    }
                    
                    s_previewCamera = $scope.component.componentInstance;
                    updatePreviewWindow();
                    startUpdatePreviewTimer();
                }

                $scope.saveLens = function() {
                    $scope.component.saveLens($scope.focalLength,$scope.frameSize,$scope.near,$scope.far)
                        .then(() => {
                            app.ComposerWindowController.Get().postReshape();
                            app.ComposerWindowController.Get().updateView();
                        });
                }

                $scope.setAsMain = function() {
                    $scope.component.setAsMain()
                        .then(() => {
                            app.ComposerWindowController.Get().postReshape();
                            app.ComposerWindowController.Get().updateView();
                            updateValues();
                            $scope.$apply();
                        });
                }

                // Handle undo/redo
                app.CommandManager.Get().onRedo("cameraUI", () => {
                    $scope.$apply(() => {
                        updateValues();
                        app.ComposerWindowController.Get().postReshape();
                        app.ComposerWindowController.Get().updateView();
                    });

                });

                app.CommandManager.Get().onUndo("cameraUI", () => {
                    $scope.$apply(() => {
                        updateValues();
                        app.ComposerWindowController.Get().postReshape();
                        app.ComposerWindowController.Get().updateView();
                    });
                });

                app.render.Scene.Get().selectionManager.selectionChanged("cameraUI", () => {
                    setTimeout(() => {
                        updateValues();
                        $scope.$apply();
                    },100);
                })

                updateValues();
            }]
        };
    });
});