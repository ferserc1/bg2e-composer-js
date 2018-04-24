app.addSource(() => {
    app.components.addComponent(() => {
        return class ColliderUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Collider","Collider","collider-ui");
            }

            createInstance() {
                return new bg.scene.Collider(new bg.physics.BoxCollider(1,1,1));
            }

            setColliderShape(shape) {
               return app.CommandManager.Get().doCommand(new app.physicsCommands.SetCollider(this.componentInstance.node,shape));
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
                    { id:1, label:"Sphere collider" },
                    { id:2, label:"Hull collider" }
                ];
                $scope.shape = $scope.shapes[0];
                $scope.width = 1;
                $scope.height = 1;
                $scope.depth = 1;
                $scope.radius = 1;
                $scope.margin = 0.01;

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
                    case shape instanceof bg.physics.ConvexHullCollider:
                        $scope.shape = $scope.shapes[2];
                        $scope.margin = shape.margin;
                        break;
                    }
                }

                $scope.onCommitChanges = function() {
                    let shape = null;
                    switch ($scope.shape.id) {
                    case 0:
                        shape = new bg.physics.BoxCollider($scope.width,$scope.height,$scope.depth);
                        break;
                    case 1:
                        shape = new bg.physics.SphereCollider($scope.radius);
                        break;
                    case 2:
                        shape = new bg.physics.ConvexHullCollider($scope.margin);
                        break;
                    }
                    $scope.component.setColliderShape(shape)
                        .then(() => {
                            app.render.Scene.Get().notifySceneChanged();
                        });
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