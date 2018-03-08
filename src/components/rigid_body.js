app.addSource(() => {
    app.components.addComponent(() => {
        return class RigidBodyUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.RigidBody","Rigid body","rigid-body-ui");
            }

            createInstance() {
                let rb = new bg.scene.RigidBody();
                rb.body.mass = 1;
                return rb;
            }

            setMass(mass) {
                return app.CommandManager.Get().doCommand(new app.physicsCommands.SetRigidBodyMass(this.componentInstance.body,mass));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("rigidBodyUi", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/rigid-body-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.mass = 1;

                $scope.updateValues = function() {
                    if (!$scope.component) return false;
                    $scope.mass = $scope.component.componentInstance.body.mass;
                }

                $scope.onCommitChanges = function() {
                    $scope.component.setMass($scope.mass)
                        .then(() => {
                            app.render.Scene.Get().notifySceneChanged();
                        });
                }

                app.render.Scene.Get().selectionManager.selectionChanged("rigidBodyUi", () => {
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