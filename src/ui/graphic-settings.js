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
            },
            {
                id: app.RenderPath.PBR,
                label: "Forward render PBR"
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
        $scope.raytracerScaleOptions = [
            { id: 0.1, label: "10%" },
            { id: 0.2, label: "20%" },
            { id: 0.3, label: "30%" },
            { id: 0.4, label: "40%" },
            { id: 0.5, label: "50%" },
            { id: 0.6, label: "60%" },
            { id: 0.7, label: "70%" },
            { id: 0.8, label: "80%" },
            { id: 0.9, label: "90%" },
            { id: 1, label: "100%" }
        ];
        $scope.scaleRenderOptions = [
            { id: 0.3, label: "30%" },
            { id: 0.4, label: "40%" },
            { id: 0.5, label: "50%" },
            { id: 0.6, label: "60%" },
            { id: 0.7, label: "70%" },
            { id: 0.8, label: "80%" },
            { id: 0.9, label: "90%" },
            { id: 1, label: "100%" }
        ];
        $scope.skinOptions = [];
        app.skins.forEach((skin) => {
            $scope.skinOptions.push({
                id: skin.path,
                label: skin.name
            });
        });
        $scope.renderPath = $scope.renderPaths[app.ComposerWindowController.Get().renderPath];
        $scope.antialiasing = app.ComposerWindowController.Get().renderSettings.antialiasing;
        $scope.raytracerQualities.some((q) => {
            if (q.id==app.ComposerWindowController.Get().renderSettings.raytracerQuality) {
                $scope.raytracerQuality = q;
                return true;
            }
        });
        $scope.raytracerScaleOptions.some((opt) => {
            if (opt.id==app.ComposerWindowController.Get().renderSettings.raytracerScale) {
                $scope.raytracerScale = opt;
                return true;
            }
        });
        let currentSkin = app.currentSkin;
        if (currentSkin) {
            $scope.skinOptions.some((opt) => {
                if (opt.label==currentSkin.name) {
                    $scope.skin = opt;
                    return true;
                }
            });
        }

        function updateCurrentResolution() {
            let canvas = bg.app.MainLoop.singleton.canvas.domElement;
            setTimeout(() => {
                $scope.$apply(() => {
                    $scope.currentResW = Math.round(canvas.width * $scope.renderScale.id);
                    $scope.currentResH = Math.round(canvas.height * $scope.renderScale.id);
                });
            },10);
        }
        $scope.scaleRenderOptions.some((opt) => {
            if (opt.id==app.ComposerWindowController.Get().renderSettings.renderScale) {
                $scope.renderScale = opt;
                updateCurrentResolution();
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
            let currentRenderModel = app.ComposerWindowController.Get().renderModel;
            let reload = false;
            let confirmMessage = null;
            if (currentRenderModel != app.RenderModel.PBR && $scope.renderPath.id==app.RenderPath.PBR) {
                confirmMessage = "The current render path is not compatible with Physically Based Rendering. To change the rendering model it is necessary to restart the application and all changes in the current scene will be lost. Do you want to continue?";
            }
            else if (currentRenderModel == app.RenderModel.PBR && $scope.renderPath.id != app.RenderPath.PBR) {
                confirmMessage = "The current render path is not compatible with the selected Phong shader forward or deferred render path. To change the rendering model it is necessary to restart the application and all changes in the current scene will be lost. Do you want to continue?";
            }

            if (confirmMessage && confirm(confirmMessage)) {
                app.ComposerWindowController.Get().renderPath = $scope.renderPath.id;
                setTimeout(() => {
                    window.location.href = "";
                    window.reload();
                },100);
            }
            else if (!confirmMessage) {
                app.ComposerWindowController.Get().renderPath = $scope.renderPath.id;
            }
        });

        $scope.$watch("antialiasing",function() {
            app.ComposerWindowController.Get().renderSettings.antialiasing = $scope.antialiasing;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("raytracerQuality",function() {
            app.ComposerWindowController.Get().renderSettings.raytracerQuality = $scope.raytracerQuality.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch("raytracerScale",function() {
            app.ComposerWindowController.Get().renderSettings.raytracerScale = $scope.raytracerScale.id;
            app.ComposerWindowController.Get().saveRenderSettings();
        });

        $scope.$watch('renderScale',function() {
            app.ComposerWindowController.Get().renderSettings.renderScale = $scope.renderScale.id;
            app.ComposerWindowController.Get().saveRenderSettings();
            updateCurrentResolution();
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

        $scope.$watch("skin", function() {
            if ($scope.skin && $scope.skin.label) {
                app.currentSkin = $scope.skin.label;
            }
        });
    }]);

    angularApp.directive("graphicSettings", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/graphic-settings.html`,
            controller: 'GraphicSettingsController'
        }
    })
})