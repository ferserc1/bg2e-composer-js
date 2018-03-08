app.addSource(() => {
    app.components.addComponent(() => {
        return class RigidBodyUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.RigidBody","Rigid body","rigid-body-ui");
            }

            createInstance() {
                return new bg.scene.RigidBody(1);
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

                    setTimeout(() => $scope.$apply(),10);
                }

                $scope.onCommitChanges = function() {
                    // TODO: Commig
                }

                app.render.Scene.Get().selectionManager.selectionChanged("rigidBodyUi", () => $scope.updateValues());

                $scope.updateValues();

            }]
        };
    });
});