app.addSource(() => {
    let path = require('path');

    app.components.addComponent(() => {
        return class CubemapUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Cubemap","Cubemap","cubemap-ui");
            }

            createInstance() {
                let cubemap = new bg.scene.Cubemap();
                cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,path.resolve(app.resourcesDir + '/cubemap_posx.jpg'));
                cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,path.resolve(app.resourcesDir + '/cubemap_negx.jpg'));
                cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,path.resolve(app.resourcesDir + '/cubemap_posy.jpg'));
                cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,path.resolve(app.resourcesDir + '/cubemap_negy.jpg'));
                cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,path.resolve(app.resourcesDir + '/cubemap_posz.jpg'));
                cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,path.resolve(app.resourcesDir + '/cubemap_negz.jpg'));
                cubemap.loadCubemap(app.ComposerWindowController.Get().gl)

                return cubemap;
            }

            save(posX,negX,posY,negY,posZ,negZ) {
                posX = posX || path.resolve(app.resourcesDir + '/cubemap_posx.jpg')
                negX = negX || path.resolve(app.resourcesDir + '/cubemap_negx.jpg')
                posY = posY || path.resolve(app.resourcesDir + '/cubemap_posy.jpg')
                negY = negY || path.resolve(app.resourcesDir + '/cubemap_negy.jpg')
                posZ = posZ || path.resolve(app.resourcesDir + '/cubemap_posz.jpg')
                negZ = negZ || path.resolve(app.resourcesDir + '/cubemap_negz.jpg')

                return app.CommandManager.Get().doCommand(
                    new app.cubemapCommands.LoadCubemap(
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

    angularApp.directive("cubemapUi", function() {
        return {
            restrict: "E",
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