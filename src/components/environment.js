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

            updateComponentData(tex,irradianceIntensity) {
// TODO: Implement using a command
                let comp = this.componentInstance;
                comp.environment.irradianceIntensity = irradianceIntensity;
                if (comp.equirectangularTexture && comp.equirectangularTexture.fileName==tex) {
                    return Promise.resolve();
                }
                else if (!tex) {
                    comp.equirectangularTexture = null;
                    return Promise.resolve();
                }
                else {
                    return new Promise((resolve,reject) => {
                        let context = app.ComposerWindowController.Get().gl;
                        bg.base.Loader.Load(context,tex)
                            .then((texture) => {
                                comp.equirectangularTexture = texture;
                                resolve();
                            })
                            .catch((err) => {
                                console.error(err.message,true);
                                reject();
                            })
                    })
                }
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

        $scope.onCommitChanges = function() {
            $scope.component.componentInstance.environment.irradianceIntensity = irradianceRestore;
            $scope.component.updateComponentData($scope.texture,$scope.irradianceIntensity)
                .then(() => app.ComposerWindowController.Get().updateView());
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