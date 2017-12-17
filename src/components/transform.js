app.addSource(() => {
    app.components.addComponent(() => {
        return class TransformUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Transform","Transform","transform-ui");
            }

            createInstance() {
                return new bg.scene.Transform(bg.Matrix4.Translation(0,0,0));
            }

            resetPosition() {
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.ResetPosition(this.componentInstance)
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            }

            resetRotation() {
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.ResetRotation(this.componentInstance)
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            }

            resetScale() {
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.ResetScale(this.componentInstance)
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            }

            resetAll() {
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.Reset(this.componentInstance)
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            }

            mult(matrix) {
                app.CommandManager.Get().doCommand(
                    new app.transformCommands.MultMatrix(this.componentInstance,matrix)
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("transformUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/transform-ui.html`,
            scope: {
                component: "="
            },
            controller: ["$scope",function($scope) {
                $scope.doTranslate = function(x,y,z) {
                    $scope.component.mult(bg.Matrix4.Translation(x,y,z));
                }

                $scope.doScale = function(x,y,z) {
                    $scope.component.mult(bg.Matrix4.Scale(x,y,z));
                }

                $scope.doRotate = function(alpha,x,y,z) {
                    $scope.component.mult(bg.Matrix4.Rotation(bg.Math.degreesToRadians(alpha),x,y,z));
                }
            }]
        }
    });
})