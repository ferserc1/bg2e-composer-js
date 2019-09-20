app.addSource(() => {
    app.components.addComponent(() => {
        return class Environment extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Environment","Environment","environment-ui");
            }

            createInstance(selectedNode) {
                let comp = new bg.scene.Environment();
                return comp;
            }

            updateTexture(textureUrl) {
                let comp = this.componentInstance;
                if (comp.equirectangularTexture && comp.equirectangularTexture.fileName==textureUrl) {
                    return Promise.resolve();
                }

                return app.CommandManager.Get().doCommand(
                    new app.environmentCommands.SetEnvironmentTexture(
                        this.componentInstance,
                        textureUrl)
                );
            }

            updateIrradiance(irr) {
                return app.CommandManager.Get().doCommand(
                    new app.environmentCommands.SetIrradianceIntensity(
                        this.componentInstance,
                        irr)
                );
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("EnvironmentController",['$scope', function($scope) {
        $scope.texture = null;
        $scope.irradianceIntensity = 1;

        // This is used to restore the original irradiance value after preview
        // the slider value. It's necesary to restore the original value to
        // allow the undo command processing
        let irradianceRestore = 0;

        $scope.updateValues = function() {
            let comp = $scope.component.componentInstance;
            if (comp.equirectangularTexture instanceof bg.base.Texture) {
                $scope.texture = comp.equirectangularTexture.fileName;
            }
            else {
                $scope.texture = "";
            }
            $scope.irradianceIntensity = comp.environment.irradianceIntensity;
            irradianceRestore = $scope.irradianceIntensity;
        };

        $scope.commitIrradiance = function(irr) {
            $scope.component.componentInstance.environment.irradianceIntensity = irradianceRestore;
            $scope.component.updateIrradiance($scope.irradianceIntensity)
                .then(() => app.ComposerWindowController.Get().updateView())
                .catch((err) => console.error(err.message));
        };

        $scope.commitTexture = function(value) {
            $scope.component.updateTexture($scope.texture)
                .then(() => app.ComposerWindowController.Get().updateView())
                .catch((err) => console.error(err.message));
        };

        app.render.Scene.Get().selectionManager.selectionChanged("environmentUi", () => {
            setTimeout(() => {
                $scope.updateValues();
                $scope.$apply();
            })
        })

        $scope.updateValues();

        $scope.$watch('irradianceIntensity', () => {
            $scope.component.componentInstance.environment.irradianceIntensity = $scope.irradianceIntensity;
            app.ComposerWindowController.Get().updateView();
        });
    }]);

    angularApp.directive("environmentUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/environment-ui.html`,
            scope: {
                component: "="
            },
            controller: "EnvironmentController"
        }
    });
})