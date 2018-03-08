app.addSource(() => {
    app.components.addComponent(() => {
        return class ColliderUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Collider","Collider","collider-ui");
            }

            createInstance() {
                return new bg.scene.Collider(new bg.physics.BoxCollider(1,1,1));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("colliderUi", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/collider-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.shapes = [
                    { id:0, label:"Box collider" },
                    { id:1, label:"Sphere collider" }
                ];
                $scope.shape = $scope.shapes[0];
                $scope.width = 0;
                $scope.height = 0;
                $scope.depth = 0;
                $scope.radius = 0;

                $scope.updateValues = function() {
                    if (!$scope.component) return false;

                    let shape = $scope.component.componentInstance.shape;
                    switch (true) {
                    case shape instanceof bg.physics.BoxCollider:
                        $scope.shape = $scope.shapes[0];
                        $scope.width = shape.width;
                        $scope.height = shape.height;
                        $scope.depth = shape.depth;
                        break;
                    case shape instanceof bg.physics.SphereCollider:
                        $scope.shape = $scope.shapes[1];
                        $scope.radius = shape.radius;
                        break;
                    }
                }

                $scope.onCommitChanges = function() {
                    // TODO: Implement
                };

                app.render.Scene.Get().selectionManager.selectionChanged("colliderUi", () => {
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