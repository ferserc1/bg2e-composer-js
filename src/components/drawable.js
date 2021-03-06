app.addSource(() => {
    app.components.addComponent(() => {
        function selectedDrawableNodes() {
            let result = [];
            app.render.Scene.Get().selectionManager.selection.forEach((item) => {
                if (item.node && item.node.drawable && result.indexOf(item.node)==-1) {
                    result.push(item.node);
                }
            });
            return result;
        }

        return class DrawableUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Drawable","Drawable","drawable-ui");
            }

            createInstance() {
                return bg.scene.PrimitiveFactory.Cube(app.ComposerWindowController.Get().gl,1,1,1);
            }

            execCommand(cmd) {
                return new Promise((resolve,reject) => {
                    app.CommandManager.Get().doCommand(
                        cmd
                    )
                    .then(() => {
                        app.render.Scene.Get().notifySceneChanged();
                        app.ComposerWindowController.Get().updateView();
                        resolve();
                    })
                    .catch((err) => {
                        alert(err);
                        reject();
                    });
                })
            }

            importFromFile(file) {
                if (file) {
                    return this.execCommand(new app.drawableCommands.LoadFromFile(this.componentInstance.node,file));
                }
            }

            createCube(w,h,d) {
                return this.execCommand(new app.drawableCommands.CreateCube(this.componentInstance.node,w,h,d));
            }

            createSphere(r,slices,stacks) {
                return this.execCommand(new app.drawableCommands.CreateSphere(this.componentInstance.node,r,slices,stacks));
            }

            createPlane(w,d) {
                return this.execCommand(new app.drawableCommands.CreatePlane(this.componentInstance.node,w,d));
            }

            setName(name) {
                return this.execCommand(new app.drawableCommands.SetName(this.componentInstance,name));
            }

            applyTransform() {
                return this.execCommand(new app.drawableCommands.ApplyTransform(selectedDrawableNodes()));
            }

            moveToCenter() {
                return this.execCommand(new app.drawableCommands.MoveToCenter(selectedDrawableNodes()));
            }

            putOnFloor() {
                return this.execCommand(new app.drawableCommands.PutOnFloor(selectedDrawableNodes()));
            }

            centerPivot() {
                return this.execCommand(new app.drawableCommands.CenterPivot(selectedDrawableNodes(), false));
            }

            pivotOnFloor() {
                return this.execCommand(new app.drawableCommands.CenterPivot(selectedDrawableNodes(), true));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("drawableUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/drawable-ui.html`,
            scope: {
                component:"="
            },
            controller: ['$scope',function($scope) {
                $scope.name = $scope.component.componentInstance.name;
                $scope.creationTools = [
                    { id:0, label:"Load from file" },
                    { id:1, label:"Cube" },
                    { id:2, label:"Sphere" },
                    { id:3, label:"Plane" }
                ];
                $scope.creationTool = $scope.creationTools[0];
                $scope.filePath = "";
                $scope.fileFilters = [];

                $scope.width = 1;
                $scope.height = 1;
                $scope.depth = 1;
                $scope.radius = 0.5;
                $scope.slices = 20;
                $scope.stacks = 20;

                $scope.createButtonName = $scope.component.componentInstance._items>0 ? "Create" : "Replace Drawable";

                $scope.canApplyTransform = $scope.component.componentInstance.transform!=null;

                $scope.applyTransform = function() {
                    if ($scope.canApplyTransform) {
                        $scope.component.applyTransform();
                    }
                };

                $scope.moveToCenter = function() {
                    if ($scope.canApplyTransform) {
                        $scope.component.moveToCenter();
                        app.ComposerWindowController.Get().updateView();
                    }
                };

                $scope.putOnFloor = function() {
                    if ($scope.canApplyTransform) {
                        $scope.component.putOnFloor();
                        app.ComposerWindowController.Get().updateView();
                    }
                };

                $scope.centerPivot = function() {
                    if ($scope.canApplyTransform) {
                        $scope.component.centerPivot();
                        app.ComposerWindowController.Get().updateView();
                    }
                };

                $scope.pivotOnFloor = function() {
                    if ($scope.canApplyTransform) {
                        $scope.component.pivotOnFloor();
                        app.ComposerWindowController.Get().updateView();
                    }
                };

                app.render.Scene.Get().selectionManager.selectionChanged("drawableComponentUI", () => {
                    setTimeout(() => {
                        $scope.name = $scope.component.componentInstance.name;
                        $scope.$apply()
                    }, 10);
                });

                $scope.$watch('creationTool', () => {

                });

                $scope.setDrawableName = function() {
                    $scope.component.setName($scope.name);
                };

                app.render.Scene.Get().selection
                $scope.createDrawable = function() {
                    switch ($scope.creationTool.id) {
                    case 0:
                        $scope.component.importFromFile($scope.filePath);
                        break;
                    case 1:
                        $scope.component.createCube($scope.width,$scope.height,$scope.depth);
                        break;
                    case 2:
                        $scope.component.createSphere($scope.radius,$scope.slices,$scope.stacks);
                        break;
                    case 3:
                        $scope.component.createPlane($scope.width,$scope.depth);
                        break;
                    }
                }
            }]
        }
    })
})