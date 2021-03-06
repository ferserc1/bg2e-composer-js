app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    const path = require("path");
    const fs = require("fs");

    angularApp.controller("LibraryNodeEditorController",["$scope",function($scope) {
        let libMgr = app.library.Manager.Get("edit");

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
                    $scope.hidden = $scope.node.hidden;
                }

                app.render.Scene.Get().showPreviewCustomBackground = true;
                
                if ($scope.node && $scope.node.type=="material") {
                    app.render.Scene.Get().drawablePreviewModel = null;
                    app.render.Scene.Get().previewNode.enabled = true;
                    app.render.Scene.Get().showPreviewCustomBackground = false;
                    app.render.Scene.Get().resetLibraryCamera();
                    let modifier = null;
                    if ($scope.node.materialModifier['class'] == "PBRMaterial") {
                        if (app.ComposerWindowController.Get().renderModel==app.RenderModel.LEGACY) {
                            console.error("Could not edit PBR material. Change the graphic settings to PBR mode.",true);
                        }
                        else {
                            $scope.material = new bg.base.PBRMaterial();
                            modifier = new bg.base.PBRMaterialModifier($scope.node.materialModifier);
                        }
                    }
                    else {
                        //if (app.ComposerWindowController.Get().renderModel==app.RenderModel.PBR) {
                        //    console.error("Could not edit phong material. Change the graphic settings to non-PBR mode.",true);
                        //}
                        //else {
                            $scope.material = new bg.base.Material();
                            modifier = new bg.base.MaterialModifier($scope.node.materialModifier);
                        //}
                    }

                    if (modifier) {
                        $scope.material.applyModifier(gl, modifier, libMgr.current.repoPath);
                        updateMaterialNode();
                    }
                    else {
                        libMgr.current.deselectAll();
                        app.render.Scene.Get().previewNode.enabled = false;
                        app.render.Scene.Get().drawablePreviewModel = null;
                        app.render.Scene.Get().previewNode.enabled = false;
                    }
                }
                else if ($scope.node && $scope.node.type=="model") {
                    let modelPath = path.resolve(path.join(libMgr.current.repoPath,$scope.node.file));
                    modelPath = app.standarizePath(modelPath);
                    app.render.Scene.Get().showPreviewCustomBackground = true;
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
                $scope.node.hidden = $scope.hidden;

                libMgr.current.save();
            }
        }

        $scope.onApplyToAll = function() {

        }

        $scope.convertToPBR = function() {
            let save = false;
            let selectNode = null;
            if (libMgr.current.selection.length>1) {
                libMgr.current.selection.forEach((node) => {
                    save = libMgr.current.convertToPBR(node) || save;
                });
            }
            else if (libMgr.current.selection.length==1) {
                save = libMgr.current.convertToPBR(libMgr.current.selection[0]);
                selectNode = libMgr.current.selection[0];
            }
            
            if (save) {
                libMgr.current.save();
                libMgr.current.deselectAll();

                if (selectNode) {
                    libMgr.current.selectNode(selectNode);
                }
            }
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
            let mask = 0;
            if ($scope.material instanceof bg.base.Material) {
                mask = ~bg.base.MaterialFlag.LIGHT_MAP; // All settings except lightmap
            }
            else if ($scope.material instanceof bg.base.PBRMaterial) {
                mask = 0xFFFFFFFF;
            }
            let mod = $scope.material.getModifierWithMask(mask);
            $scope.node.materialModifier = mod.serialize();

            mod = $scope.node.materialModifier;

            if (mod['class']=="PBRMaterial") {
                if (typeof(mod.diffuse) == "string") {
                    mod.diffuse = fixRelative(mod.diffuse);
                }
                if (typeof(mod.metallic) == "string") {
                    mod.metallic = fixRelative(mod.metallic);
                }
                if (typeof(mod.roughness) == "string") {
                    mod.roughness = fixRelative(mod.roughness);
                }
                if (typeof(mod.lightEmission) == "string") {
                    mod.lightEmission = fixRelative(mod.lightEmission);
                }
                if (typeof(mod.height) == "string") {
                    mod.height = fixRelative(mod.height);
                }
                if (typeof(mod.normal) == "string") {
                    mod.normal = fixRelative(mod.normal);
                }
            }
            else {
                mod.shininessMask = fixRelative(mod.shininessMask);
                mod.lightEmissionMask = fixRelative(mod.lightEmissionMask);
                mod.texture = fixRelative(mod.texture);
                mod.normalMap = fixRelative(mod.normalMap);
                mod.reflectionMask = fixRelative(mod.reflectionMask);
                mod.roughnessMask = fixRelative(mod.roughnessMask);
            }

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

        $scope.editField = "";

        $scope.removeKey = function(key) {
            delete $scope.node.metadata[key];
            libMgr.current.save();
        }

        $scope.setKeyString = function(evt,key) {
            $scope.metaKey = evt.target.value;
            if (evt.code=='Enter') {
                $scope.commitMetadataChanged(key);
            }
        }

        $scope.setValueString = function(evt,key) {
            $scope.metaValue = evt.target.value;
            if (evt.code=='Enter') {
                $scope.commitMetadataChanged(key);
            }
        }

        $scope.beginEdit = function(key) {
            $scope.editField = key;
            $scope.metaKey = key;
            $scope.metaValue = $scope.node.metadata[key];
        }

        $scope.commitMetadataChanged = function(key) {
            $scope.editField = "";
            delete $scope.node.metadata[key];
            if ($scope.metaKey!="") {
                $scope.node.metadata[$scope.metaKey] = $scope.metaValue;
            }
            libMgr.current.save();
        }

        $scope.addMetadataItem = function() {
            let newKey = "key";
            let index = 1;
            while (Object.keys($scope.node.metadata).indexOf(newKey)!=-1) {
                newKey = "key_" + ++index;
            }

            $scope.node.metadata[newKey] = "";
            $scope.beginEdit(newKey);
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