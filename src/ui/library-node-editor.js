app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    const path = require("path");
    const fs = require("fs");

    angularApp.controller("LibraryNodeEditorController",["$scope",function($scope) {
        let libMgr = app.library.Manager.Get();

        $scope.fileFilters = [ { name:"bg2 engine models", extensions:["bg2","vwglb"]} ];
        $scope.modelFile = "";

        function updateMaterialNode() {
            let node = app.render.Scene.Get().materialPreviewModel;
            let drw = node.drawable;
            if (drw) {
                drw.forEach((plist,mat) => {
                    mat.assign($scope.material);
                });
            }
        }

        function updateSelection() {
            setTimeout(() => {
                let gl = app.ComposerWindowController.Get().gl;
                $scope.node = libMgr.current.selection[0];
                if ($scope.node) {
                    $scope.id = $scope.node.id;
                    $scope.name = $scope.node.name;
                    $scope.icon = libMgr.current.getResourceAbsolutePath($scope.node.icon);
                }

                if ($scope.node && $scope.node.type=="material") {
                    app.render.Scene.Get().drawablePreviewModel = null;
                    app.render.Scene.Get().previewNode.enabled = true;
                    app.render.Scene.Get().resetLibraryCamera();
                    $scope.material = new bg.base.Material();
                    let modifier = new bg.base.MaterialModifier($scope.node.materialModifier);
                    $scope.material.applyModifier(gl, modifier, libMgr.current.repoPath);
                    updateMaterialNode();
                }
                else if ($scope.node && $scope.node.type=="model") {
                    let modelPath = path.resolve(path.join(libMgr.current.repoPath,$scope.node.file));
                    modelPath = app.standarizePath(modelPath);
                    if (fs.existsSync(modelPath)) {
                        bg.base.Loader.Load(gl,modelPath)
                            .then((node) => {
                                app.render.Scene.Get().drawablePreviewModel = node.drawable;
                                app.render.Scene.Get().previewNode.enabled = true;
                                app.ComposerWindowController.Get().updateView();
                            });
                        $scope.modelFile = modelPath;
                    }
                    else {
                        app.render.Scene.Get().drawablePreviewModel = null;
                        app.render.Scene.Get().previewNode.enabled = false;
                    }
                }
                else {
                    $scope.material = null;
                    app.render.Scene.Get().previewNode.enabled = false;
                    app.render.Scene.Get().drawablePreviewModel = null;
                    app.render.Scene.Get().previewNode.enabled = false;
                }

                $scope.$apply();
                app.ComposerWindowController.Get().updateView();
            },50);
        }

        function registerSelectionObserver() {
            libMgr.current.selectionChanged("libraryNodeEditor", (selection) => {
                updateSelection();
            });
        }

        registerSelectionObserver();

        libMgr.libraryChanged("libraryNodeEditor", () => {
            updateSelection();
            registerSelectionObserver();
        });

        $scope.selectModel = function() {
            libMgr.current.addModel($scope.node,$scope.modelFile)
                .then(() => {
                    libMgr.current.save();
                })
                .catch((err) => {
                    console.error(err.message);
                })
        };

        $scope.saveChanges = function() {
            if ($scope.node) {
                $scope.node.id = $scope.id;
                $scope.node.name = $scope.name;
                $scope.node.icon = libMgr.current.getResourceLocalPath($scope.icon);

                libMgr.current.save();
            }
        }

        $scope.onApplyToAll = function() {

        }

        $scope.commitChanges = function() {
            let promises = [];
            let fixRelative = (filePath) => {
                if (!filePath) return "";

                let pathParsed = path.parse(filePath);
                let dstPath = path.join(libMgr.current.repoPath,pathParsed.base);
                promises.push(bg.base.Writer.CopyFile(filePath,dstPath));
                return pathParsed.base;
            };
            let mod = $scope.material.getModifierWithMask(~0 & ~bg.base.MaterialFlag.LIGHT_MAP);
            $scope.node.materialModifier = mod.serialize();

            mod = $scope.node.materialModifier;

            mod.shininessMask = fixRelative(mod.shininessMask);
            mod.lightEmissionMask = fixRelative(mod.lightEmissionMask);
			mod.texture = fixRelative(mod.texture);
            mod.normalMap = fixRelative(mod.normalMap);
            mod.reflectionMask = fixRelative(mod.reflectionMask);
			mod.roughnessMask = fixRelative(mod.roughnessMask);

            Promise.all(promises).then(() => {
                libMgr.current.save();
            });
        }

        $scope.screenshot = function() {
            let format = "image/jpeg";
            let imageName = bg.utils.generateUUID() + '.jpg';
            if ($scope.node.icon) {
                let fullPath = path.join(libMgr.current.repoPath,$scope.node.icon);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
            app.ComposerWindowController.Get().screenshot(format,256,256).then((screenshot) => {
                let re = new RegExp(`^data:${ format };base64,`);
                var base64Data = screenshot.replace(re, "");
                let dstPath = path.join(libMgr.current.repoPath,imageName);

                fs.writeFile(dstPath, base64Data, 'base64', function(err) {
                    if (!err) {
                        $scope.node.icon = imageName;
                        libMgr.current.save();
                        updateSelection();
                    }
                    else {
                        console.error(err.message,true);
                    }
                });
            })
        }

        $scope.onMaterialChanged = function() {
            updateMaterialNode();
            app.ComposerWindowController.Get().updateView();
        }
    }]);

    angularApp.directive("libraryNodeEditor", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/library-node-editor.html`,
            compile: app.workspaceElementCompile(),
            scope: {
            },
            controller: 'LibraryNodeEditorController'
        };
    })
})