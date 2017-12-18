app.addSource(() => {
    let path = require('path');

    app.components.addComponent(() => {
        return class SkyboxUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Skybox","Skybox","skybox-ui");
            }

            createInstance() {
                let skybox = new bg.scene.Skybox();
                skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,path.resolve('data/cubemap_posx.jpg'));
                skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,path.resolve('data/cubemap_negx.jpg'));
                skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,path.resolve('data/cubemap_posy.jpg'));
                skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,path.resolve('data/cubemap_negy.jpg'));
                skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,path.resolve('data/cubemap_posz.jpg'));
                skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,path.resolve('data/cubemap_negz.jpg'));
                skybox.loadSkybox(app.ComposerWindowController.Get().gl)

                return skybox;
            }

            save(posX,negX,posY,negY,posZ,negZ) {
                posX = posX || path.resolve('data/cubemap_posx.jpg')
                negX = negX || path.resolve('data/cubemap_negx.jpg')
                posY = posY || path.resolve('data/cubemap_posy.jpg')
                negY = negY || path.resolve('data/cubemap_negy.jpg')
                posZ = posZ || path.resolve('data/cubemap_posz.jpg')
                negZ = negZ || path.resolve('data/cubemap_negz.jpg')

                return app.CommandManager.Get().doCommand(
                    new app.skyboxCommands.LoadSkybox(
                        this.componentInstance,
                        posX, negX,
                        posY, negY,
                        posZ, negZ
                    )
                );
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("skyboxUi", function() {
        return {
            restrict: "E",
            // Reuse cubemap-ui.html template
            templateUrl: `templates/${ app.config.templateName }/directives/cubemap-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope',function($scope) {
                $scope.posX = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.POSITIVE_X,path);
                $scope.negX = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X,path);
                $scope.posY = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y,path);
                $scope.negY = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,path);
                $scope.posZ = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z,path);
                $scope.negZ = $scope.component.componentInstance.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,path);

                $scope.save = function() {
                    $scope.component.save(
                        $scope.posX,$scope.negX,
                        $scope.posY,$scope.negY,
                        $scope.posZ,$scope.negZ
                    )
                    .then(() => app.ComposerWindowController.Get().updateView());
                }
            }]
        }
    })
})