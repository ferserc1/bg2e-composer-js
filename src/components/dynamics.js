app.addSource(() => {
    app.components.addComponent(() => {
        return class DynamicsUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Dynamics","Dynamics","dynamics-ui");
            }

            createInstance() {
                let w = new bg.physics.World();
                w.gravity = new bg.Vector3(0,-10,0);
                return new bg.scene.Dynamics(w);
            }

            setGravity(gravity) {
                return app.CommandManager.Get().doCommand(new app.physicsCommands.SetWorldGravity(this.componentInstance.world,gravity));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("dynamicsUi", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/dynamics-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.gravity = [0,0,0];

                $scope.updateValues = function() {
                    if (!$scope.component) return false;
                    $scope.gravity = $scope.component.componentInstance.world.gravity.toArray();

                    setTimeout(() => $scope.$apply(),10);
                }

                $scope.onCommitChanges = function() {
                    $scope.component.setGravity($scope.gravity)
                        .then(() => {
                            app.render.Scene.Get().notifySceneChanged();
                        })
                }

                app.render.Scene.Get().selectionManager.selectionChanged("dynamicsUi", () => {
                    setTimeout(() => {
                        $scope.updateValues();
                        $scope.$apply();
                    },50);
                });

                $scope.updateValues();
            }]
        };
    });
});