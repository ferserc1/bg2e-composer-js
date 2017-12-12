app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("GraphicSettingsController",['$scope',function($scope) {
        $scope.renderPaths = [
            {
                id: app.RenderPath.FORWARD,
                label: "Forward render"
            },
            {
                id: app.RenderPath.DEFERRED,
                label: "Deferred render"
            }
        ];
        $scope.raytracerQualities = [
            {
                id: 'low',
                label: "Low"
            },
            {
                id: 'mid',
                label: "Medium"
            },
            {
                id: 'high',
                label: "High"
            },
            {
                id: 'extreme',
                label: "Extreme"
            }
        ];
        $scope.ssaoQualities = [
            {
                id:8,
                label: 'Low'
            },
            {
                id:16,
                label: 'Medium'
            },
            {
                id:32,
                label: 'High'
            },
            {
                id:64,
                label: 'Extreme'
            }
        ];
        $scope.ssaoBlurs = [
            {
                id:1,
                label: 'disabled'
            },
            {
                id:2,
                label: '2x'
            },
            {
                id:4,
                label: '4x'
            },
            {
                id:8,
                label: '8x'
            }
        ];
        $scope.shadowQualities = [
            {
                id: 512,
                label: "512x512"
            },
            {
                id: 1024,
                label: "1024x1024"
            },
            {
                id: 2048,
                label: "2048x2048"
            },
            {
                id: 4096,
                label: "4096x4096"
            }
        ];
        $scope.shadowTypes = [
            {
                id: bg.render.ShadowType.HARD,
                label: "Hard Shadows"
            },
            {
                id: bg.render.ShadowType.SOFT,
                label: "Soft Shadows"
            }
        ];
        $scope.renderPath = $scope.renderPaths[app.ComposerWindowController.Get().renderPath];
        $scope.antialiasing = app.ComposerWindowController.Get().renderSettings.antialiasing;
        $scope.raytracerQualities.some((q) => {
            if (q.id==app.ComposerWindowController.Get().renderSettings.raytracerQuality) {
                $scope.raytracerQuality = q;
                return true;
            }
        });
        $scope.ssao = app.ComposerWindowController.Get().renderSettings.ssaoEnabled;
        $scope.ssaoQualities.some((q) => {
            if (q.id==app.ComposerWindowController.Get().renderSettings.ssaoSamples) {
                $scope.ssaoQuality = q;
                return true;
            }
        });
        $scope.ssaoBlurs.some((q) => {
            if (q.id==app.ComposerWindowController.Get().renderSettings.ssaoBlur) {
                $scope.ssaoBlur = q;
                return true;
            }
        });
        $scope.ssaoRadius = app.ComposerWindowController.Get().renderSettings.ssaoRadius;
        $scope.ssaoMaxDistance = app.ComposerWindowController.Get().renderSettings.ssaoMaxDistance;

        $scope.shadowTypes.some((t) => {
            if (t.id==app.ComposerWindowController.Get().renderSettings.shadowType) {
                $scope.shadowType = t;
                return true;
            }
        });
        $scope.shadowQualities.some((q) => {
            if (q.id==app.ComposerWindowController.Get().renderSettings.shadowQuality) {
                $scope.shadowQuality = q;
                return true;
            }
        });
        $scope.error = "";
        $scope.warning = "";

        if (!app.ComposerWindowController.Get().supportHighQualityRender) {
            $scope.error = "Error: Extension WEBGL_draw_buffers does not supported.";
            $scope.warning = "Warning: your computer does not support deferred render. Check that you have installed the last version of the graphics drivers. ";
        }
        
        $scope.$watch("renderPath",function() {
            app.ComposerWindowController.Get().renderPath = $scope.renderPath.id;
        });

        $scope.$watch("antialiasing",function() {
            app.ComposerWindowController.Get().renderSettings.antialiasing = $scope.antialiasing;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("raytracerQuality",function() {
            app.ComposerWindowController.Get().renderSettings.raytracerQuality = $scope.raytracerQuality.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("ssao", function() {
            app.ComposerWindowController.Get().renderSettings.ssaoEnabled = $scope.ssao;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("ssaoQuality", function() {
            app.ComposerWindowController.Get().renderSettings.ssaoSamples = $scope.ssaoQuality.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("ssaoBlur", function() {
            app.ComposerWindowController.Get().renderSettings.ssaoBlur = $scope.ssaoBlur.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("ssaoRadius", function() {
            app.ComposerWindowController.Get().renderSettings.ssaoRadius = $scope.ssaoRadius;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("ssaoMaxDistance", function() {
            app.ComposerWindowController.Get().renderSettings.ssaoMaxDistance = $scope.ssaoMaxDistance;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("shadowType", function() {
            app.ComposerWindowController.Get().renderSettings.shadowType = $scope.shadowType.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("shadowQuality", function() {
            app.ComposerWindowController.Get().renderSettings.shadowQuality = $scope.shadowQuality.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.showDeferredSettings = function() {
            return $scope.renderPath.id==app.RenderPath.DEFERRED;
        };
    }]);

    angularApp.directive("graphicSettings", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/graphic-settings.html`,
            controller: 'GraphicSettingsController'
        }
    })
})