app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    function updateTexture(material,field,newValue) {
        if (material[field] && material[field].fileName==newValue) {
            return Promise.resolve();
        }
        if (!newValue) {
            material[field] = null;
            return Promise.resolve();
        }
        else {
            return new Promise((resolve,reject) => {
                let context = app.ComposerWindowController.Get().gl;
                bg.base.Loader.Load(context,newValue)
                    .then((texture) => {
                        material[field] = texture;
                        resolve();
                    })
                    .catch((err) => {
                        console.error(err,true);
                        reject();
                    });
            })
        }
    }

    function updateVector(material,field,newValue) {
        material[field] = newValue.length==2 ? new bg.Vector2(newValue) :
                          newValue.length==3 ? new bg.Vector3(newValue) :
                          newValue.length==4 ? new bg.Vector4(newValue) :
                          null;
    }



    angularApp.controller("MaterialEditorController",['$rootScope','$scope','$timeout',function($rootScope,$scope,$timeout) {
        $scope.maskChannels = [
            { id:0, label:"R" },
            { id:1, label:"G" },
            { id:2, label:"B" },
            { id:3, label:"A" }
        ];

        $scope.diffuse = [1,1,1,1];
        $scope.specular = [1,1,1,1];
        $scope.alphaCutoff = 0.5;
        $scope.shininess = 0;
        $scope.shininessMask = "";
        $scope.shininessMaskChannel = $scope.maskChannels[0];
        $scope.shininessMaskInvert = false;
        $scope.lightEmission = 0;
        $scope.lightEmissionMask = "";
        $scope.lightEmissionMaskChannel = $scope.maskChannels[0];
        $scope.lightEmissionMaskInvert = false;
        $scope.texture = "";
        $scope.textureOffset = [0,0];
        $scope.textureScale = [1,1];
        $scope.lightMap = "";
        $scope.normalMap = "";
        $scope.normalMapOffset = [0,0];
        $scope.normalMapScale = [1,1];
        $scope.reflection = 0;
        $scope.reflectionMask = "";
        $scope.reflectionMaskChannel = $scope.maskChannels[0];
        $scope.reflectionMaskInvert = false;
        $scope.castShadows = true;
        $scope.receiveShadows = true;
        $scope.cullFace = true;
        $scope.roughness = 0;
        $scope.roughnessMask = "";
        $scope.roughnessMaskChannel = $scope.maskChannels[0];
        $scope.roughnessMaskInvert = false;
        $scope.unlit = false;

        $scope.isDisabled = true;

        $scope.applyToAll = function() {
            if ($scope.applyToAllPressed) {
                $scope.applyToAllPressed();
            }
        };

        let commitTimer = null;
        $scope.onCommitChanges = function() {
            if ($scope.commitChanges) {
                if (commitTimer) {
                    clearTimeout(commitTimer);
                }
                commitTimer = setTimeout(() => {
                    $scope.commitChanges();
                }, 50);
            }
        };

        function updateMaterial() {
            if ($scope.material) {
                let m = $scope.material;
                let promises = [];

                m.diffuse = new bg.Vector4($scope.diffuse);
                m.specular = new bg.Vector4($scope.specular);
                m.alphaCutoff = $scope.alphaCutoff;

                m.shininess = $scope.shininess;
                promises.push(updateTexture(m,'shininessMask',$scope.shininessMask));
                m.shininessMaskChannel = $scope.shininessMaskChannel.id;
                m.shininessMaskInvert = $scope.shininessMaskInvert;

                m.lightEmission = $scope.lightEmission;
                promises.push(updateTexture(m,'lightEmissionMask',$scope.lightEmissionMask));
                m.lightEmissionMaskChannel = $scope.lightEmissionMaskChannel.id;
                m.lightEmissionMaskInvert = $scope.lightEmissionMaskInvert;

                promises.push(updateTexture(m,'texture',$scope.texture));
                m.textureOffset = new bg.Vector2($scope.textureOffset);
                m.textureScale = new bg.Vector2($scope.textureScale);
                promises.push(updateTexture(m,'lightmap',$scope.lightMap));
                promises.push(updateTexture(m,'normalMap',$scope.normalMap));
                m.normalMapOffset = new bg.Vector2($scope.normalMapOffset);
                m.normalMapScale = new bg.Vector2($scope.normalMapScale);
                m.reflectionAmount = $scope.reflection;
                promises.push(updateTexture(m,'reflectionMask',$scope.reflectionMask));
                m.reflectionMaskChannel = $scope.reflectionMaskChannel.id;
                m.reflectionMaskInvert = $scope.reflectionMaskInvert;
                m.castShadows = $scope.castShadows;
                m.receiveShadows = $scope.receiveShadows;
                m.cullFace = $scope.cullFace;
                m.roughness = $scope.roughness;
                promises.push(updateTexture(m,'roughnessMask',$scope.roughnessMask));
                m.roughnessMaskChannel = $scope.roughnessMaskChannel.id;
                m.roughnessMaskInvert = $scope.roughnessMaskInvert;
                m.unlit = $scope.unlit;

                if ($scope.materialChanged) {
                    Promise.all(promises).then(() => $scope.materialChanged($scope.material));
                }
            }
        }

        function updateUI() {
            let m = $scope.material;
            if ($scope.material) {
                $scope.diffuse = m.diffuse.toArray();
                $scope.specular = m.specular.toArray();
                $scope.alphaCutoff = m.alphaCutoff;
                $scope.shininess = m.shininess;
                $scope.shininessMask = m.shininessMask && m.shininessMask.fileName || "";
                $scope.shininessMaskChannel = $scope.maskChannels[m.shininessMaskChannel] || $scope.maskChannels[0];
                $scope.shininessMaskInvert = m.shininessMaskInvert;
                $scope.lightEmission = m.lightEmission;
                $scope.lightEmissionMask = m.lightEmissionMask && m.lightEmissionMask.fileName || "";
                $scope.lightEmissionMaskChannel = $scope.maskChannels[m.lightEmissionMaskChannel] || $scope.maskChannels[0];
                $scope.lightEmissionMaskInvert = m.lightEmissionMaskInvert;
                $scope.texture = m.texture && m.texture.fileName || "";
                $scope.textureOffset = m.textureOffset.toArray();
                $scope.textureScale = m.textureScale.toArray();
                $scope.lightMap = m.lightmap && m.lightmap.fileName || "";
                $scope.normalMap = m.normalMap && m.normalMap.fileName || "";
                $scope.normalMapOffset = m.normalMapOffset.toArray();
                $scope.normalMapScale = m.normalMapScale.toArray();
                $scope.reflection = m.reflectionAmount;
                $scope.reflectionMask = m.reflectionMask && m.reflectionMask.fileName || "";
                $scope.reflectionMaskChannel = $scope.maskChannels[m.reflectionMaskChannel] || $scope.maskChannels[0];
                $scope.reflectionMaskInvert = m.reflectionMaskInvert;
                $scope.castShadows = m.castShadows;
                $scope.receiveShadows = m.receiveShadows;
                $scope.cullFace = m.cullFace;
                $scope.roughness = m.roughness;
                $scope.roughnessMask = m.roughnessMask && m.roughnessMask.fileName || "";
                $scope.roughnessMaskChannel = $scope.maskChannels[m.roughnessMaskChannel] || $scope.maskChannels[0];
                $scope.roughnessMaskInvert = m.roughnessMaskInvert;
                $scope.unlit = m.unlit;
                $scope.isDisabled = false;
            }
            else {
                $scope.isDisabled = true;
            }
        }

        $rootScope.$on("bg2UpdateMaterialUI", function() {
            updateUI();
        });

        $scope.$watch('material',() => {
            updateUI(); 
        });

        $scope.$watch("diffuse",() => {
            updateMaterial();
        },true);

        $scope.$watch("specular",() => {
            updateMaterial();
        },true);

        $scope.$watch("alphaCutoff",() => {
            updateMaterial();
        });

        $scope.$watch("shininess",() => {
            updateMaterial();
        });

        $scope.$watch("shininessMask",() => {
            updateMaterial();
        });

        $scope.$watch("shininessMaskChannel",() => {
            updateMaterial();
        });

        $scope.$watch("shininessMaskInvert",() => {
            updateMaterial();
        });

        $scope.$watch("lightEmission",() => {
            updateMaterial();
        });

        $scope.$watch("lightEmissionMask",() => {
            updateMaterial();
        });

        $scope.$watch("lightEmissionMaskChannel",() => {
            updateMaterial();
        });

        $scope.$watch("lightEmissionMaskInvert",() => {
            updateMaterial();
        });

        $scope.$watch("texture",() => {
            updateMaterial();
        });

        $scope.$watch("textureOffset",() => {
            updateMaterial();
        },true);

        $scope.$watch("textureScale",() => {
            updateMaterial();
        },true);

        $scope.$watch("lightMap",() => {
            updateMaterial();
        });

        $scope.$watch("normalMap",() => {
            updateMaterial();
        });

        $scope.$watch("normalMapOffset",() => {
            updateMaterial();
        },true);

        $scope.$watch("normalMapScale",() => {
            updateMaterial();
        },true);

        $scope.$watch("reflection",() => {
            updateMaterial();
        });

        $scope.$watch("reflectionMask",() => {
            updateMaterial();
        });

        $scope.$watch("reflectionMaskChannel",() => {
            updateMaterial();
        });

        $scope.$watch("reflectionMaskInvert",() => {
            updateMaterial();
        });

        $scope.$watch("roughness",() => {
            updateMaterial();
        });

        $scope.$watch("roughnessMask",() => {
            updateMaterial();
        });

        $scope.$watch("roughnessMaskChannel",() => {
            updateMaterial();
        });

        $scope.$watch("roughnessMaskInvert",() => {
            updateMaterial();
        });



        $scope.$watch("castShadows",() => {
            updateMaterial();
        });

        $scope.$watch("receiveShadows",() => {
            updateMaterial();
        });

        $scope.$watch("cullFace",() => {
            updateMaterial();
        });

        $scope.$watch("unlit",() => {
            updateMaterial();
        })
    }]);

    angularApp.directive("materialEditor", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/material-editor.html`,
            compile: app.workspaceElementCompile(),
            scope: {
                material:"=?",
                materialChanged:"=?",
                applyToAllPressed:"=?",
                commitChanges:"=?"
            },
            controller: 'MaterialEditorController'
        };
    });
})