app.addSource(() => {
    app.components.addComponent(() => {
        return class DynamicsUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Dynamics","Dynamics","dynamics-ui");
            }

            createInstance() {
                return new bg.scene.Dynamics(new bg.Vector3(0,-10,0));
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
                    // TODO: Commit
                }

                app.render.Scene.Get().selectionManager.selectionChanged("dynamicsUi", () => $scope.updateValues());

                $scope.updateValues();
            }]
        };
    });
});