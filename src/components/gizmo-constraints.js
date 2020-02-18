app.addSource(() => {
    app.components.addComponent(() => {
        return class GizmoConstraintsUI extends app.components.ComponentUI {
            constructor() {
                super("bg.manipulation.GizmoConstraints", "Gizmo Constraints","gizmo-constraints-ui");
            }

            createInstance() {
                return new bg.manipulation.GizmoConstraints();
            }

            updateBounds(bounds) {
                app.CommandManager.Get().doCommand(
                    new app.gizmoConstraintsCommands.SetBounds(this.componentInstance,bounds)
                ).then(() => app.ComposerWindowController.Get().updateView());
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("gizmoConstraintsUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/gizmo-constraints-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.bounds = $scope.component.componentInstance.bounds.toArray();

                $scope.commit = function() {
                    $scope.component.updateBounds($scope.bounds);
                }
            }]
        };
    })
})