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

        $scope.uvSets = [
            { id:0, label:"UV 0" },
            { id:1, label:"UV 1" }
        ];

        const MaterialType = {
            PHONG: 0,
            PBR: 1
        };
        $scope.materialType = MaterialType.PHONG;
        $scope.materialVars = {};
        $scope.pbrMaterialVars = {};

        $scope.showUvs = /^false$/i.test($scope.showUvs) ? false : true;
        $scope.showAmbientOcclussion = /^false$/i.test($scope.showAmbientOcclussion) ? false : true;

        function resetValues() {
            $scope.materialVars.diffuse = [1,1,1,1];
            $scope.materialVars.specular = [1,1,1,1];
            $scope.materialVars.alphaCutoff = 0.5;
            $scope.materialVars.shininess = 0;
            $scope.materialVars.shininessMask = "";
            $scope.materialVars.shininessMaskChannel = $scope.maskChannels[0];
            $scope.materialVars.shininessMaskInvert = false;
            $scope.materialVars.lightEmission = 0;
            $scope.materialVars.lightEmissionMask = "";
            $scope.materialVars.lightEmissionMaskChannel = $scope.maskChannels[0];
            $scope.materialVars.lightEmissionMaskInvert = false;
            $scope.materialVars.texture = "";
            $scope.materialVars.textureOffset = [0,0];
            $scope.materialVars.textureScale = [1,1];
            $scope.materialVars.lightMap = "";
            $scope.materialVars.normalMap = "";
            $scope.materialVars.normalMapOffset = [0,0];
            $scope.materialVars.normalMapScale = [1,1];
            $scope.materialVars.reflection = 0;
            $scope.materialVars.reflectionMask = "";
            $scope.materialVars.reflectionMaskChannel = $scope.maskChannels[0];
            $scope.materialVars.reflectionMaskInvert = false;
            $scope.materialVars.castShadows = true;
            $scope.materialVars.receiveShadows = true;
            $scope.materialVars.cullFace = true;
            $scope.materialVars.roughness = 0;
            $scope.materialVars.roughnessMask = "";
            $scope.materialVars.roughnessMaskChannel = $scope.maskChannels[0];
            $scope.materialVars.roughnessMaskInvert = false;
            $scope.materialVars.unlit = false;

            // Values that could be vector/scalar or texture
            $scope.pbrMaterialVars.diffuse = [1,1,1,1];
            $scope.pbrMaterialVars.diffuseTexture = null;
            $scope.pbrMaterialVars.metallic = 0;
            $scope.pbrMaterialVars.metallicTexture = null;
            $scope.pbrMaterialVars.roughness = 0.9;
            $scope.pbrMaterialVars.roughnessTexture = null;
            $scope.pbrMaterialVars.fresnel = [1,1,1,1];
            $scope.pbrMaterialVars.fresnelTexture = null;
            $scope.pbrMaterialVars.lightEmission = 0;
            $scope.pbrMaterialVars.lightEmissionTexture = null;
            $scope.pbrMaterialVars.ambientOcclussion = 1;
            $scope.pbrMaterialVars.ambientOcclussionTexture = null;

            $scope.pbrMaterialVars.metallicChannel = $scope.maskChannels[0];
            $scope.pbrMaterialVars.roughnessChannel = $scope.maskChannels[0];
            $scope.pbrMaterialVars.lightEmissionChannel = $scope.maskChannels[0];
            $scope.pbrMaterialVars.heightChannel = $scope.maskChannels[0];
            $scope.pbrMaterialVars.ambientOcclussionChannel = $scope.maskChannels[0];

            $scope.pbrMaterialVars.diffuseUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.metallicUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.roughnessUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.fresnelUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.ambientOcclussionUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.normalUV = $scope.uvSets[0];
            $scope.pbrMaterialVars.heightUV = $scope.uvSets[0];

            // Other values that only can be scalar, vector or texture
            $scope.pbrMaterialVars.normalTexture = null;
            $scope.pbrMaterialVars.heightTexture = 0;
            $scope.pbrMaterialVars.alphaCutoff = 0.5;
            $scope.pbrMaterialVars.isTransparent = false;
            $scope.pbrMaterialVars.diffuseScale = [1, 1];
            $scope.pbrMaterialVars.normalScale = [1, 1];
            $scope.pbrMaterialVars.metallicScale = [1, 1];
            $scope.pbrMaterialVars.roughnessScale = [1, 1];
            $scope.pbrMaterialVars.fresnelScale = [1, 1];
            $scope.pbrMaterialVars.castShadows = true;
            $scope.pbrMaterialVars.heightIntensity = 1;
            $scope.pbrMaterialVars.heightScale = [1, 1];
            $scope.pbrMaterialVars.cullFace = true;
            $scope.pbrMaterialVars.unlit = false;

            $scope.showPhong = false;
            $scope.showPbr = false;
        }

        resetValues();

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
            if ($scope.material instanceof bg.base.Material) {
                let m = $scope.material;
                let promises = [];

                m.diffuse = new bg.Vector4($scope.materialVars.diffuse);
                m.specular = new bg.Vector4($scope.materialVars.specular);
                m.alphaCutoff = $scope.materialVars.alphaCutoff;

                m.shininess = $scope.materialVars.shininess;
                promises.push(updateTexture(m,'shininessMask',$scope.materialVars.shininessMask));
                m.shininessMaskChannel = $scope.materialVars.shininessMaskChannel.id;
                m.shininessMaskInvert = $scope.materialVars.shininessMaskInvert;

                m.lightEmission = $scope.materialVars.lightEmission;
                promises.push(updateTexture(m,'lightEmissionMask',$scope.materialVars.lightEmissionMask));
                m.lightEmissionMaskChannel = $scope.materialVars.lightEmissionMaskChannel.id;
                m.lightEmissionMaskInvert = $scope.materialVars.lightEmissionMaskInvert;

                promises.push(updateTexture(m,'texture',$scope.materialVars.texture));
                m.textureOffset = new bg.Vector2($scope.materialVars.textureOffset);
                m.textureScale = new bg.Vector2($scope.materialVars.textureScale);
                promises.push(updateTexture(m,'lightmap',$scope.materialVars.lightMap));
                promises.push(updateTexture(m,'normalMap',$scope.materialVars.normalMap));
                m.normalMapOffset = new bg.Vector2($scope.materialVars.normalMapOffset);
                m.normalMapScale = new bg.Vector2($scope.materialVars.normalMapScale);
                m.reflectionAmount = $scope.materialVars.reflection;
                promises.push(updateTexture(m,'reflectionMask',$scope.materialVars.reflectionMask));
                m.reflectionMaskChannel = $scope.materialVars.reflectionMaskChannel.id;
                m.reflectionMaskInvert = $scope.materialVars.reflectionMaskInvert;
                m.castShadows = $scope.materialVars.castShadows;
                m.receiveShadows = $scope.materialVars.receiveShadows;
                m.cullFace = $scope.materialVars.cullFace;
                m.roughness = $scope.materialVars.roughness;
                promises.push(updateTexture(m,'roughnessMask',$scope.materialVars.roughnessMask));
                m.roughnessMaskChannel = $scope.materialVars.roughnessMaskChannel.id;
                m.roughnessMaskInvert = $scope.materialVars.roughnessMaskInvert;
                m.unlit = $scope.materialVars.unlit;

                if ($scope.materialChanged) {
                    Promise.all(promises).then(() => $scope.materialChanged($scope.material));
                }
            }
            else if ($scope.material instanceof bg.base.PBRMaterial) {
                let m = $scope.material;
                let promises = [];

                function setMixedValue(property) {
                    let texture = $scope.pbrMaterialVars[`${ property }Texture`];
                    let other = $scope.pbrMaterialVars[property];
                    if (texture) {
                        promises.push(updateTexture(m,property,texture));
                    }
                    else if (Array.isArray(other)) {
                        switch (other.length) {
                        case 2:
                            m[property] = new bg.Vector2(other);
                            break;
                        case 3:
                            m[property] = new bg.Vector3(other);
                            break;
                        case 4:
                            m[property] = new bg.Vector4(other);
                            break;
                        default:
                            console.warn(`Unexpected array length found in material property "${ property }"`);
                        }
                    }
                    else if (typeof(other) == "number") {
                        m[property] = other;
                    }
                }

                setMixedValue("diffuse");
                setMixedValue("metallic");
                setMixedValue("roughness");
                setMixedValue("fresnel");
                setMixedValue("lightEmission");
                setMixedValue("ambientOcclussion");
        
                m.metallicChannel = $scope.pbrMaterialVars.metallicChannel.id;
                m.roughnessChannel = $scope.pbrMaterialVars.roughnessChannel.id;
                m.lightEmissionChannel = $scope.pbrMaterialVars.lightEmissionChannel.id;
                m.heightChannel = $scope.pbrMaterialVars.heightChannel.id;
                m.ambientOcclussionChannel = $scope.pbrMaterialVars.ambientOcclussionChannel.id;

                if ($scope.pbrMaterialVars.normalTexture) {
                    promises.push(updateTexture(m,'normal',$scope.pbrMaterialVars.normalTexture));
                }
                else {
                    m.normal = new bg.Vector4(0.5,0.5,1.0,1.0);
                }
                if ($scope.pbrMaterialVars.heightTexture) {
                    promises.push(updateTexture(m,'height',$scope.pbrMaterialVars.heightTexture));
                }
                else {
                    m.height = 0;
                }
        
                m.alphaCutoff = $scope.pbrMaterialVars.alphaCutoff;
                m.isTransparent = $scope.pbrMaterialVars.isTransparent;
                m.diffuseScale = new bg.Vector2($scope.pbrMaterialVars.diffuseScale);
                m.normalScale = new bg.Vector2($scope.pbrMaterialVars.normalScale);

                m.metallicScale = new bg.Vector2($scope.pbrMaterialVars.metallicScale);
                m.roughnessScale = new bg.Vector2($scope.pbrMaterialVars.roughnessScale);

                m.fresnelScale = new bg.Vector2($scope.pbrMaterialVars.fresnelScale);

                m.castShadows = $scope.pbrMaterialVars.castShadows;
                m.heightIntensity = $scope.pbrMaterialVars.heightIntensity;
                m.heightScale = new bg.Vector2($scope.pbrMaterialVars.heightScale);
                m.cullFace = $scope.pbrMaterialVars.cullFace;
                m.unlit = $scope.pbrMaterialVars.unlit;

                m.diffuseUV = $scope.pbrMaterialVars.diffuseUV.id;
                m.ambientOcclussionUV = $scope.pbrMaterialVars.ambientOcclussionUV.id;
                m.metallicUV = $scope.pbrMaterialVars.metallicUV.id;
                m.roughnessUV = $scope.pbrMaterialVars.roughnessUV.id;
                m.fresnelUV = $scope.pbrMaterialVars.fresnelUV.id;
                m.normalUV = $scope.pbrMaterialVars.normalUV.id;
                m.heightUV = $scope.pbrMaterialVars.heightUV.id;
                
                if ($scope.materialChanged) {
                    Promise.all(promises).then(() => $scope.materialChanged($scope.material));
                }
            }
            else {
                resetValues();
            }
        }

        function updateUI() {
            let m = $scope.material;
            if ($scope.material instanceof bg.base.Material) {
                $scope.materialVars.diffuse = m.diffuse.toArray();
                $scope.materialVars.specular = m.specular.toArray();
                $scope.materialVars.alphaCutoff = m.alphaCutoff;
                $scope.materialVars.shininess = m.shininess;
                $scope.materialVars.shininessMask = m.shininessMask && m.shininessMask.fileName || "";
                $scope.materialVars.shininessMaskChannel = $scope.maskChannels[m.shininessMaskChannel] || $scope.maskChannels[0];
                $scope.materialVars.shininessMaskInvert = m.shininessMaskInvert;
                $scope.materialVars.lightEmission = m.lightEmission;
                $scope.materialVars.lightEmissionMask = m.lightEmissionMask && m.lightEmissionMask.fileName || "";
                $scope.materialVars.lightEmissionMaskChannel = $scope.maskChannels[m.lightEmissionMaskChannel] || $scope.maskChannels[0];
                $scope.materialVars.lightEmissionMaskInvert = m.lightEmissionMaskInvert;
                $scope.materialVars.texture = m.texture && m.texture.fileName || "";
                $scope.materialVars.textureOffset = m.textureOffset.toArray();
                $scope.materialVars.textureScale = m.textureScale.toArray();
                $scope.materialVars.lightMap = m.lightmap && m.lightmap.fileName || "";
                $scope.materialVars.normalMap = m.normalMap && m.normalMap.fileName || "";
                $scope.materialVars.normalMapOffset = m.normalMapOffset.toArray();
                $scope.materialVars.normalMapScale = m.normalMapScale.toArray();
                $scope.materialVars.reflection = m.reflectionAmount;
                $scope.materialVars.reflectionMask = m.reflectionMask && m.reflectionMask.fileName || "";
                $scope.materialVars.reflectionMaskChannel = $scope.maskChannels[m.reflectionMaskChannel] || $scope.maskChannels[0];
                $scope.materialVars.reflectionMaskInvert = m.reflectionMaskInvert;
                $scope.materialVars.castShadows = m.castShadows;
                $scope.materialVars.receiveShadows = m.receiveShadows;
                $scope.materialVars.cullFace = m.cullFace;
                $scope.materialVars.roughness = m.roughness;
                $scope.materialVars.roughnessMask = m.roughnessMask && m.roughnessMask.fileName || "";
                $scope.materialVars.roughnessMaskChannel = $scope.maskChannels[m.roughnessMaskChannel] || $scope.maskChannels[0];
                $scope.materialVars.roughnessMaskInvert = m.roughnessMaskInvert;
                $scope.materialVars.unlit = m.unlit;

                $scope.showPhong = true;
                $scope.showPbr = false;
            }
            else if ($scope.material instanceof bg.base.PBRMaterial) {
                function setMixedValue(propertyName) {
                    let materialValue = $scope.material[propertyName];
                    if (materialValue instanceof bg.base.Texture) {
                        $scope.pbrMaterialVars[`${ propertyName }Texture`] = materialValue.fileName;
                    }
                    else if (materialValue instanceof bg.Vector4 ||
                        materialValue instanceof bg.Vector3 ||
                        materialValue instanceof bg.Vector2)
                    {
                        $scope.pbrMaterialVars[propertyName] = materialValue.toArray();
                        $scope.pbrMaterialVars[`${ propertyName }Texture`] = null;
                    }
                    else if (typeof(materialValue) == "number") {
                        $scope.pbrMaterialVars[propertyName] = materialValue;
                        $scope.pbrMaterialVars[`${ propertyName }Texture`] = null;
                    }
                }
                setMixedValue("diffuse");
                setMixedValue("metallic");
                setMixedValue("roughness");
                setMixedValue("fresnel");
                setMixedValue("lightEmission");
                setMixedValue("ambientOcclussion");
                
                $scope.pbrMaterialVars.metallicChannel = $scope.maskChannels[$scope.material.metallicChannel] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.roughnessChannel = $scope.maskChannels[$scope.material.roughnessChannel] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.lightEmissionChannel = $scope.maskChannels[$scope.material.lightEmissionChannel] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.heightChannel = $scope.maskChannels[$scope.material.heightChannel] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.ambientOcclussionChannel = $scope.maskChannels[$scope.material.ambientOcclussionChannel] || $scope.maskChannels[0];

                $scope.pbrMaterialVars.diffuseUV = $scope.maskChannels[$scope.material.diffuseUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.ambientOcclussionUV = $scope.maskChannels[$scope.material.ambientOcclussionUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.metallicUV = $scope.maskChannels[$scope.material.metallicUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.roughnessUV = $scope.maskChannels[$scope.material.roughnessUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.fresnelUV = $scope.maskChannels[$scope.material.fresnelUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.normalUV = $scope.maskChannels[$scope.material.normalUV] || $scope.maskChannels[0];
                $scope.pbrMaterialVars.heightUV = $scope.maskChannels[$scope.material.heightUV] || $scope.maskChannels[0];

                if ($scope.material.normal instanceof bg.base.Texture) {
                    $scope.pbrMaterialVars.normalTexture = $scope.material.normal.fileName;
                }
                else {
                    $scope.pbrMaterialVars.normalTexture = null;
                }
                if ($scope.material.height instanceof bg.base.Texture) {
                    $scope.pbrMaterialVars.heightTexture = $scope.material.height.fileName;
                }
                else {
                    $scope.pbrMaterialVars.heightTexture = null;
                }
                $scope.pbrMaterialVars.alphaCutoff = $scope.material.alphaCutoff;
                $scope.pbrMaterialVars.isTransparent = $scope.material.isTransparent;
                $scope.pbrMaterialVars.diffuseScale = $scope.material.diffuseScale.toArray();
                $scope.pbrMaterialVars.normalScale = $scope.material.normalScale.toArray();

                $scope.pbrMaterialVars.metallicScale = $scope.material.metallicScale.toArray();
                $scope.pbrMaterialVars.roughnessScale = $scope.material.roughnessScale.toArray();

                $scope.pbrMaterialVars.fresnelScale = $scope.material.fresnelScale.toArray();

                $scope.pbrMaterialVars.castShadows = $scope.material.castShadows;
                $scope.pbrMaterialVars.heightIntensity = $scope.material.heightIntensity;
                $scope.pbrMaterialVars.heightScale = $scope.material.heightScale.toArray();
                $scope.pbrMaterialVars.cullFace = $scope.material.cullFace;
                $scope.pbrMaterialVars.unlit = $scope.material.unlit;
            
                $scope.showPhong = false;
                $scope.showPbr = true;
            }
            else {
                resetValues();
                $scope.showPhong = false;
                $scope.showPbr = false;
            }
        }

        $rootScope.$on("bg2UpdateMaterialUI", function() {
            // Defer the $rootScope UI update to ensure that the new values are set
            setTimeout(() => {
                updateUI();
                $scope.$apply();
            }, 50);
        });

        $scope.$watch('material',() => {
            updateUI();
        });

        $scope.convertToPBRAvailable = app.ComposerWindowController.Get().renderModel==app.RenderModel.PBR && $scope.convertToPbrPressed;
        $scope.convertToPBR = () => {
            if ($scope.convertToPbrPressed) {
                $scope.convertToPbrPressed();
            }
        };

        $scope.$watch("materialVars.diffuse",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.specular",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.alphaCutoff",() => { updateMaterial(); });
        $scope.$watch("materialVars.shininess",() => { updateMaterial(); });
        $scope.$watch("materialVars.shininessMask",() => { updateMaterial(); });
        $scope.$watch("materialVars.shininessMaskChannel",() => { updateMaterial(); });
        $scope.$watch("materialVars.shininessMaskInvert",() => { updateMaterial(); });
        $scope.$watch("materialVars.lightEmission",() => { updateMaterial(); });
        $scope.$watch("materialVars.lightEmissionMask",() => { updateMaterial(); });
        $scope.$watch("materialVars.lightEmissionMaskChannel",() => { updateMaterial(); });
        $scope.$watch("materialVars.lightEmissionMaskInvert",() => { updateMaterial(); });
        $scope.$watch("materialVars.texture",() => { updateMaterial(); });
        $scope.$watch("materialVars.textureOffset",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.textureScale",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.lightMap",() => { updateMaterial(); });
        $scope.$watch("materialVars.normalMap",() => { updateMaterial(); });
        $scope.$watch("materialVars.normalMapOffset",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.normalMapScale",() => { updateMaterial(); },true);
        $scope.$watch("materialVars.reflection",() => { updateMaterial(); });
        $scope.$watch("materialVars.reflectionMask",() => { updateMaterial(); });
        $scope.$watch("materialVars.reflectionMaskChannel",() => { updateMaterial(); });
        $scope.$watch("materialVars.reflectionMaskInvert",() => { updateMaterial(); });
        $scope.$watch("materialVars.roughness",() => { updateMaterial(); });
        $scope.$watch("materialVars.roughnessMask",() => { updateMaterial(); });
        $scope.$watch("materialVars.roughnessMaskChannel",() => { updateMaterial(); });
        $scope.$watch("materialVars.roughnessMaskInvert",() => { updateMaterial(); });
        $scope.$watch("materialVars.castShadows",() => { updateMaterial(); });
        $scope.$watch("materialVars.receiveShadows",() => { updateMaterial(); });
        $scope.$watch("materialVars.cullFace",() => { updateMaterial(); });
        $scope.$watch("materialVars.unlit",() => { updateMaterial(); });
        
        $scope.$watch("pbrMaterialVars.diffuse", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.diffuseTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.metallic", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.metallicTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.metallicChannel", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.metallicScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.roughness", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.roughnessTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.roughnessChannel", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.roughnessScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.fresnel", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.fresnelTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.fresnelScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.ambientOcclussionTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.ambientOcclussionChannel", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.lightEmission", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.lightEmissionTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.lightEmissionChannel", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.normalTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.heightTexture", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.heightChannel", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.alphaCutoff", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.isTransparent", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.diffuseScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.normalScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.castShadows", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.heightIntensity", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.heightScale", () => updateMaterial(),true);
        $scope.$watch("pbrMaterialVars.cullFace", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.unlit", () => updateMaterial());

        $scope.$watch("pbrMaterialVars.diffuseUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.metallicUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.roughnessUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.fresnelUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.normalUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.heightUV", () => updateMaterial());
        $scope.$watch("pbrMaterialVars.ambientOcclussionUV", () => updateMaterial());


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
                commitChanges:"=?",
                convertToPbrPressed:"=?",
                showUvs:"@?",
                showAmbientOcclussion:"@?"
            },
            controller: 'MaterialEditorController'
        };
    });
})