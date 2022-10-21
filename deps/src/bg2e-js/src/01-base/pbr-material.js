(function() {
    // The texture offsets are deprecated in PBR materials

    bg.base.PBRMaterialFlag = {
        DIFFUSE                     : 1 << 0,   // diffuse, isTransparent, alphaCutoff, diffuseScale
        METALLIC                    : 1 << 1,   // metallic, metallicChannel, metallicScale
        ROUGHNESS                   : 1 << 2,   // roughness, roughnessChannel, roughnessScale
        FRESNEL                     : 1 << 3,   // fresnel color, fresnelScale
        AMBIENT_OCCLUSSION          : 1 << 4,   // ambientOcclussion, ambientOcclussionChannel
        LIGHT_EMISSION              : 1 << 5,   // lightEmission, lightEmissionChannel, lighEmissionScale
        NORMAL                      : 1 << 6,   // normal, normalScale
        LIGHT_MAP                   : 1 << 7,   // not used
        HEIGHT                      : 1 << 8,  // height, heightChannel, heightScale, heightIntensity
        SHADOWS                     : 1 << 9,  // castShadows/receiveShadows
        CULL_FACE                   : 1 << 10,  // cullFace
        UNLIT                       : 1 << 11   // unlit
    };

    function getColorOrTexture(data,defaultValue = bg.Color.Black()) {
        if (Array.isArray(diffuse) && diffuse.length==3) {
            return new bg.Color(data[0],data[1],data[2],1);
        }
        else if (Array.isArray(diffuse) && diffuse.length>=4) {
            return new bg.Color(data[0],data[1],data[2],data[3]);
        }
        else if (typeof(diffuse) == "string" && diffuse != "") {
            return diffuse;
        }
        else {
            return defaultValue;
        }
    }

    function getVector(data,defaultValue = bg.Vector2()) {
        if (Array.isArray(data) && data.length==2) {
            return new bg.Vector2(data);
        }
        else if (Array.isArray(data) && data.length==3) {
            return new bg.Vector3(data);
        }
        else if (Array.isArray(data) && data.length==4) {
            return new bg.Vector4(data);
        }
        else {
            return defaultValue;
        }
    }

    function getScalarOrTexture(data,defaultValue = 0) {
        if (data!==undefined && !isNaN(Number(data)) && data!=="") {
            return Number(data);
        }
        else if (data!==undefined && typeof(data)=="string" && data!="") {
            return data;
        }
        else {
            return defaultValue;
        }
    }

    function getScalar(data,defaultValue = 0) {
        if (data!==undefined && !isNaN(Number(data)) && data!=="") {
            return Number(data);
        }
        else {
            return defaultValue;
        }
    }

    function getBoolean(value, defaultValue=true) {
        if (typeof(value)=="string" && value!=="") {
            return /true/i.test(value) || /yes/i.test(value) || /1/.test(value);
        }
        else if (value!==undefined) {
            return value;
        }
        else {
            return defaultValue;
        }
    }

    function getVector(value,defaultValue=[0,0]) {
        if (value instanceof bg.Vector2 || value instanceof bg.Vector3 || value instanceof bg.Vector4) {
            return value.toArray();            
        }
        else if (Array.isArray(value)) {
            return value;
        }
        else {
            return defaultValue;
        }
    }

    function getColorOrTexture(value,defaultValue = [0,0,0,1]) {
        if (value instanceof bg.Color) {
            return value.toArray();
        }
        else if (Array.isArray(value)) {
            return value;
        }
        else if (typeof(value) == "string" && value != "") {
            return value;
        }
        else {
            return defaultValue;
        }
    }

    function getScalarOrTexture(value) {
        if (value!==undefined && !isNaN(Number(value))) {
            return Number(value);
        }
        else if (typeof(value) == "string" && value!="") {
            return value;
        }
        else {
            return 0;
        }
    }

    class PBRMaterialModifier {
        static ConvertToPBR(mod) {
            let result = new bg.base.PBRMaterialModifier();

            // Diffuse
            if ( mod.isEnabled(bg.base.MaterialFlag.DIFFUSE) &&
                !mod.isEnabled(bg.base.MaterialFlag.TEXTURE))
            {
				result.diffuse = mod.diffuse;
            }
            else if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE) && mod.texture!="") {
                result.diffuse = mod.texture;
            }

            // Normal map
            if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP) && mod.normalMap!="") {
				result.normal = mod.normalMap;
			}

            // Fresnel color: from specular
			if (mod.isEnabled(bg.base.MaterialFlag.SPECULAR)) {
                result.fresnel = mod.specular
            }
            
			
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET)) {
				result.diffuseOffset = mod.textureOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_SCALE)) {
				result.diffuseScale = mod.textureScale;
			}

			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET)) {
				result.normalOffset = mod.normalMapOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE)) {
				result.normalScale = mod.normalMapScale;
            }
            
            return result;
        }

        constructor(jsonData) {
            this._modifierFlags = 0;

            this._diffuse = bg.Color.White();
            this._isTransparent = false;
            this._alphaCutoff = 0.5;
            this._diffuseScale = new bg.Vector2(1);
            this._metallic = 0;
            this._metallicChannel = 0;
            this._metallicScale = new bg.Vector2(1);
            this._roughness = 1;
            this._roughnessChannel = 0;
            this._roughnessScale = new bg.Vector2(1);
            this._fresnel = bg.Color.White();
            this._fresnelScale = new bg.Vector2(1);
            this._ambientOcclussion = 1;
            this._ambientOcclussionChannel = 0;
            this._lightEmission = 0;
            this._lightEmissionChannel = 0;
            this._lightEmissionScale = new bg.Vector2(1);
            this._height = 0;
            this._heightChannel = 0;
            this._heightIntensity = 1;
            this._heightScale = new bg.Vector2(1);
            this._normal = new bg.Color(0.5,0.5,1,1);
            this._normalScale = new bg.Vector2(1);
            this._castShadows = true;
            this._cullFace = true;
            this._unlit = false;

            if (jsonData && (jsonData.type != "pbr" && jsonData['class'] != 'PBRMaterial')) {
                console.warn("non-pbr data used in pbr material modifier.");
                // TODO: Import from legacy material modifier
                if (jsonData.texture) {
                    this._diffuse = getColorOrTexture(jsonData.texture, this._diffuse);
                }
                else {
                    this._diffuse = new bg.Color(
                        jsonData.diffuseR!==undefined ? jsonData.diffuseR : 1,
                        jsonData.diffuseG!==undefined ? jsonData.diffuseG : 1,
                        jsonData.diffuseB!==undefined ? jsonData.diffuseB : 1,
                        jsonData.diffuseA!==undefined ? jsonData.diffuseA : 1
                    );
                }

                this._diffuseScale = new bg.Vector2(
                    jsonData.diffuseScaleX!==undefined ? jsonData.diffuseScaleX : this._diffuseScale.x,
                    jsonData.diffuseScaleY!==undefined ? jsonData.diffuseScaleY : this._diffuseScale.y
                );
                this._diffuseOffset = new bg.Vector2(
                    jsonData.diffuseOffsetX!==undefined ? jsonData.diffuseOffsetX : this._diffuseOffset.x,
                    jsonData.diffuseOffsetY!==undefined ? jsonData.diffuseOffsetY : this._diffuseOffset.y
                );

                if (jsonData.normalMap) {
                    this._normal = getColorOrTexture(jsonData.normalMap, this._normal);
                }
                this._normalScale = new bg.Vector2(
                    jsonData.normalMapScaleX!==undefined ? jsonData.normalMapScaleX : this._normalScale.x,
                    jsonData.normalMapScaleY!==undefined ? jsonData.normalMapScaleY : this._normalScale.y
                );
                this._normalOffset = new bg.Vector2(
                    jsonData.normalMapOffsetX!==undefined ? jsonData.normalMapOffsetX : this._normalOffset.x,
                    jsonData.normalMapOffsetY!==undefined ? jsonData.normalMapOffsetY : this._normalOffset.y
                );

                if (jsonData.diffuseR || jsonData.diffuseG || jsonData.diffuseB || jsonData.diffuseA || jsonData.texture) {
                    this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE);
                }
                if (jsonData.diffuseScaleX || jsonData.diffuseScaleY) {
                    this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE_SCALE);
                }
                if (jsonData.diffuseOffsetX || jsonData.diffuseOffsetY) {
                    this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE_OFFSET);
                }
                if (jsonData.normalMap) {
                    this.setEnabled(bg.base.PBRMaterialFlag.NORMAL);
                }
                if  (jsonData.normalMapScaleX || jsonData.normalMapScaleY) {
                    this.setEnabled(bg.base.PBRMaterialFlag.NORMAL_SCALE);
                }
                if  (jsonData.normalMapOffsetX || jsonData.normalMapOffsetY) {
                    this.setEnabled(bg.base.PBRMaterialFlag.NORMAL_OFFSET);
                }
            }
            else if (jsonData) {
                let defaultScale = jsonData.diffuseScale || this._diffuseScale;
                this._diffuse = getColorOrTexture(jsonData.diffuse, this._diffuse);
                this._isTransparent = getBoolean(jsonData.isTransparent, this._isTransparent);
                this._alphaCutoff = getScalar(jsonData.alphaCutoff, this._alphaCutoff);
                this._diffuseScale = new bg.Vector2(getVector(jsonData.diffuseScale, this._diffuseScale));
                this._metallic = getScalarOrTexture(jsonData.metallic, this._metallic);
                this._metallicChannel = getScalar(jsonData.metallicChannel, this._metallicChannel);
                this._metallicScale = new bg.Vector2(getVector(jsonData.metallicScale || defaultScale, this._metallicScale));
                this._roughness = getScalarOrTexture(jsonData.roughness, this._roughness);
                this._roughnessChannel = getScalar(jsonData.roughnessChannel, this._roughnessChannel);
                this._roughnessScale = new bg.Vector2(getVector(jsonData.roughnessScale || defaultScale, this._roughnessScale));
                this._fresnel = getColorOrTexture(jsonData.fresnel, this._fresnel);
                this._fresnelScale = new bg.Vector2(getVector(jsonData.fresnelScale || defaultScale, this._fresnelScale));
                this._ambientOcclussion = getScalarOrTexture(jsonData.ambientOcclussion, this._ambientOcclussion);
                this._ambientOcclussionChannel = getScalar(jsonData.ambientOcclussionChannel, this._ambientOcclussionChannel);
                this._lightEmission = getScalarOrTexture(jsonData.lightEmission, this._lightEmission);
                this._lightEmissionChannel = getScalar(jsonData.lightEmissionChannel, this._lightEmissionChannel);
                this._lightEmissionScale = new bg.Vector2(getVector(jsonData.lightEmissionScale || defaultScale, this._lightEmissionScale));
                this._height = getScalarOrTexture(jsonData.height, this._height);
                this._heightChannel = getScalar(jsonData.heightChannel, this._heightChannel);
                this._heightIntensity = getScalar(jsonData.heightIntensity, this._heightIntensity);
                this._heightScale = new bg.Vector2(getVector(jsonData.heightScale || defaultScale, this._heightScale));
                this._normal = getColorOrTexture(jsonData.normal, this._normal);
                this._normalScale = new bg.Vector2(getVector(jsonData.normalScale, this._normalScale));
                this._castShadows = getBoolean(jsonData.castShadows, this._castShadows);
                this._cullFace = getBoolean(jsonData.cullFace, this._cullFace);
                this._unlit = getBoolean(jsonData.unlit, this._unlit);

                // Convert JS arrays into bg.Vector
                if (Array.isArray(this._diffuse)) {
                    this._diffuse = new bg.Color(this._diffuse);
                }
                if (Array.isArray(this._fresnel)) {
                    this._fresnel = new bg.Color(this._fresnel);
                }
                if (Array.isArray(this.normal) && this.normal.length>=3) {
                    let n = this.normal;
                    this._normal = new bg.Color(
                        n[0],
                        n[1],
                        n[2],
                        n.length>3 ? n[3] : 1
                    );
                }


                if (jsonData.diffuse || jsonData.isTransparent || jsonData.alphaCutoff || jsonData.diffuseScale) {
                    this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE);
                }
                if (jsonData.metallic!==undefined || jsonData.metallicScale!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.METALLIC);
                }
                if (jsonData.roughness!==undefined || jsonData.roughnessScale!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.ROUGHNESS);
                }
                if (jsonData.fresnel!==undefined || jsonData.fresnelScale!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.FRESNEL);
                }
                if (jsonData.ambientOcclussion!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION);
                }
                if (jsonData.lightEmission!==undefined || jsonData.lightEmissionScale!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION);
                }
                if (jsonData.height!==undefined || jsonData.heightIntensity!==undefined || jsonData.heightScale!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.HEIGHT);
                }
                if (jsonData.normal || jsonData.normalScale) {
                    this.setEnabled(bg.base.PBRMaterialFlag.NORMAL);
                }
                if (jsonData.castShadows!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.SHADOWS);
                }
                if (jsonData.cullFace!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.CULL_FACE);
                }
                if (jsonData.unlit!==undefined) {
                    this.setEnabled(bg.base.PBRMaterialFlag.UNLIT);
                }

            }
        }

        get modifierFlags() { return this._modifierFlags; }
        set modifierFlags(f) { this._modifierFlags = f; }
        // Compatibility with MaterialModifier API
        get modifierMask() { return this._modifierFlags; }
        set modifierMask(f) { this._modifierFlags = f; }
        
		setEnabled(flag) { this._modifierFlags = this._modifierFlags | flag; }
        isEnabled(flag) { return (this._modifierFlags & flag)!=0; }
        
        // The offsets values are deprecated. The following accessor methods are defined for compatibility purposes
        get diffuseOffset() { console.warn("diffuseOffset is deprecated in PBR materials."); return new bg.Vector2(0); }
        set diffuseOffset(v) { console.warn("diffuseOffset is deprecated iin PBR materials."); }
        get normalOffset() { console.warn("normalOffset is deprecated in PBR materials."); return new bg.Vector2(0); }
        set normalOffset(v) { console.warn("normalOffset is deprecated in PBR materials."); }

        get diffuse() { return this._diffuse; }
        get isTransparent() { return this._isTransparent; }
        get alphaCutoff() { return this._alphaCutoff; }
        set diffuse(v) { this._diffuse = v; this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE); }
        set isTransparent(v) { this._isTransparent = v; this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE); }
        set alphaCutoff(v) { this._alphaCutoff = v; this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE); }
        get diffuseScale() { return this._diffuseScale; }
        set diffuseScale(v) { this._diffuseScale = v; this.setEnabled(bg.base.PBRMaterialFlag.DIFFUSE); }
        get metallic() { return this._metallic; }
        set metallic(v) { this._metallic = v; this.setEnabled(bg.base.PBRMaterialFlag.METALLIC); }
        get metallicChannel() { return this._metallicChannel; }
        set metallicChannel(v) { this._metallicChannel = v; this.setEnabled(bg.base.PBRMaterialFlag.METALLIC); }
        get metallicScale() { return this._metallicScale; }
        set metallicScale(v) { this._metallicScale = v; this.setEnabled(bg.base.PBRMaterialFlag.METALLIC); }
        get roughness() { return this._roughness; }
        set roughness(v) { this._roughness = v; this.setEnabled(bg.base.PBRMaterialFlag.ROUGHNESS); }
        get roughnessChannel() { return this._roughnessChannel; }
        set roughnessChannel(v) { this._roughnessChannel = v; this.setEnabled(bg.base.PBRMaterialFlag.ROUGHNESS); }
        get roughnessScale() { return this._roughnessScale; }
        set roughnessScale(v) { this._roughnessScale = v; this.setEnabled(bg.base.PBRMaterialFlag.ROUGHNESS); }
        get fresnel() { return this._fresnel; }
        set fresnel(v) { this._fresnel = v; this.setEnabled(bg.base.PBRMaterialFlag.FRESNEL); }
        get fresnelScale() { return this._fresnelScale; }
        set fresnelScale(v) { this._fresnelScale = v; this.setEnabled(bg.base.PBRMaterialFlag.FRESNEL); }
        get ambientOcclussion() { return this._ambientOcclussion; }
        set ambientOcclussion(v) { this._ambientOcclussion = v; this.setEnabled(bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION); }
        get ambientOcclussionChannel() { return this._ambientOcclussionChannel; }
        set ambientOcclussionChannel(v) { this._ambientOcclussionChannel = v; this.setEnabled(bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION); }
        get lightEmission() { return this._lightEmission; }
        set lightEmission(v) { this._lightEmission = v; this.setEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION); }
        get lightEmissionChannel() { return this._lightEmissionChannel; }
        set lightEmissionChannel(v) { this._lightEmissionChannel = v; this.setEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION); }
        get lightEmissionScale() { return this._lightEmissionScale; }
        set lightEmissionScale(v) { this._lightEmissionScale = v; this.setEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION); }
        get height() { return this._height; }
        set height(v) { this._height =v; this.setEnabled(bg.base.PBRMaterialFlag.HEIGHT); }
        get heightChannel() { return this._heightChannel; }
        set heightChannel(v) { this._heightChannel = v; this.setEnabled(bg.base.PBRMaterialFlag.HEIGHT); }
        get heightIntensity() { return this._heightIntensity; }
        set heightIntensity(v) { this._heightIntensity = v; this.setEnabled(bg.base.PBRMaterialFlag.HEIGHT); }
        get heightScale() { return this._heightScale; }
        set heightScale(v) { this._heightScale = v; this.setEnabled(bg.base.PBRMaterialFlag.HEIGH); }
        get normal() { return this._normal; }
        set normal(v) { this._normal =v; this.setEnabled(bg.base.PBRMaterialFlag.NORMAL); }
        get normalScale() { return this._normalScale; }
        set normalScale(v) { this._normalScale = v; this.setEnabled(bg.base.PBRMaterialFlag.NORMAL); }
        get castShadows() { return this._castShadows; }
        set castShadows(v) { this._castShadows = v; this.setEnabled(bg.base.PBRMaterialFlag.SHADOWS); }
        get cullFace() { return this._cullFace; }
        set cullFace(v) { this._cullFace = v; this.setEnabled(bg.base.PBRMaterialFlag.CULL_FACE); }
        get unlit() { return this._unlit; }
        set unlit(v) { this._unlit = v; this.setEnabled(bg.base.PBRMaterialFlag.UNLIT); }

        clone() {
            let copy = new PBRMaterialModifier();
            copy.assign(this);
            return copy;
        }

        assign(mod) {
            this._modifierFlags = mod._modifierFlags;
            
            this._diffuse = mod._diffuse;
            this._isTransparent = mod._isTransparent;
            this._alphaCutoff = mod._alphaCutoff;
            this._diffuseScale = mod._diffuseScale;
            this._metallic = mod._metallic;
            this._metallicChannel = mod._metallicChannel;
            this._metallicScale = mod._metallicScale;
            this._roughness = mod._roughness;
            this._roughnessChannel = mod._roughnessChannel;
            this._roughnessScale = mod._roughnessScale;
            this._fresnel = mod._fresnel;
            this._fresnelScale = mod._fresnelScale;
            this._ambientOcclussion = mod._ambientOcclussion;
            this._ambientOcclussionChannel = mod._ambientOcclussionChannel;
            this._lightEmission = mod._lightEmission;
            this._lightEmissionChannel = mod._lightEmissionChannel;
            this._lightEmissionScale = mod._lightEmissionScale;
            this._height = mod._height;
            this._heightChannel = mod._heightChannel;
            this._heightIntensity = mod._heightIntensity;
            this._heightScale = mod._heightScale;
            this._normal = mod._normal;
            this._normalScale = mod._normalScale;
            this._castShadows = mod._castShadows;
            this._cullFace = mod._cullFace;
            this._unlit = mod._unlit;        
        }

        serialize() {
            let result = {
                class: "PBRMaterial"
            };
            let mask = this._modifierFlags;

            if (mask & bg.base.PBRMaterialFlag.DIFFUSE) {
                result.diffuse = getColorOrTexture(this.diffuse);
                result.isTransparent = getBoolean(this.isTransparent);
                result.alphaCutoff = getBoolean(this.alphaCutoff);
                result.diffuseScale = getVector(this.diffuseScale);
            }
            if (mask & bg.base.PBRMaterialFlag.METALLIC) {
                result.metallic = getScalarOrTexture(this.metallic);
                result.metallicChannel = getScalar(this.metallicChannel);
                result.metallicScale = getVector(this.metallicScale);
            }
            if (mask & bg.base.PBRMaterialFlag.ROUGHNESS) {
                result.roughness = getScalarOrTexture(this.roughness);
                result.roughnessChannel = getScalar(this.roughnessChannel);
                result.roughnessScale = getVector(this.roughnessScale);
            }
            if (mask & bg.base.PBRMaterialFlag.FRESNEL) {
                result.fresnel = getColorOrTexture(this.fresnel);
                result.fresnelScale = getVector(this.fresnelScale);
            }
            if (mask & bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION) {
                result.ambientOcclussion = getScalarOrTexture(this.ambientOcclussion);
                result.ambientOcclussionChannel = getScalar(this.ambientOcclussionChannel);
            }
            if (mask & bg.base.PBRMaterialFlag.LIGHT_EMISSION) {
                result.lightEmission = getScalarOrTexture(this.lightEmission);
                result.lightEmissionChannel = getScalar(this.lightEmissionChannel);
                result.lightEmissionScale = getVector(this.lightEmissionScale);
            }
            if (mask & bg.base.PBRMaterialFlag.NORMAL) {
                result.normal = getColorOrTexture(this.normal);
                result.normalScale = getVector(this.normalScale);
            }
            if (mask & bg.base.PBRMaterialFlag.HEIGHT) {
                result.height = getScalarOrTexture(this.height);
                result.heightChannel = getScalar(this.heightChannel);
                result.heightScale = getScalar(this.heightScale);
                result.heightIntensity = getScalar(this.heightIntensity);
            }
            if (mask & bg.base.PBRMaterialFlag.SHADOWS) {
                result.castShadows = getBoolean(this.castShadows);
            }
            if (mask & bg.base.PBRMaterialFlag.CULL_FACE) {
                result.cullFace = getBoolean(this.cullFace);
            }
            if (mask & bg.base.PBRMaterialFlag.UNLIT) {
                result.unlit = getBoolean(this.unlit);
            }

            return result;
        }
    }

    bg.base.PBRMaterialModifier = PBRMaterialModifier;

    // Image load functions defined in bg.base.imageTools:
    //      isAbsolutePath(path)
    //      getTexture(context,texturePath,resourcePath)
    //      getPath(texture)        texture ? texture.fileName : ""
    //      readTexture(context,basePath,texData,mat,property)  

    // Returns a texture from a scalar or a vector parameter
    function getMap(context,matParam) {

        let vecValue = null;
        let num = Number(matParam);
        if (isNaN(num)) {
            if (matParam instanceof bg.Vector3) {
                vecValue = new bg.Vector4(matParam.x,matParam.y,matParam.z,0);
            }
            else if (matParam instanceof bg.Vector2) {
                vecValue = new bg.Vector4(matParam.x,matParam.y,0,0);
            }
            else if (matParam instanceof bg.Vector4) {
                vecValue = matParam;
            }
            else if (matParam===undefined) {
                vecValue = new bg.Vector4(0,0,0,0);
            }
        }
        else {
            vecValue = new bg.Vector4(num,num,num,num);
        }

        if (vecValue) {
            return bg.base.Texture.ColorTexture(context,vecValue,{ width: 1, height: 1 });
        }
        else {
            throw new Error("PBRMaterial invalid material parameter specified.");
        }
    }

    // Release the specified map, if is marked to release
    function release(mapName) {
        let map = this._shaderParameters[mapName];
        if (map && map.map && map.release) {
            map.map.destroy();
        }
    }

    // Combine height, metallic, roughness and ambient occlus into one map
    function combineMaps(gl) {
        // Combine height, metallic, roughness and ambient occlussion
        let height = {
            map: this._shaderParameters.height.map,
            channel: this._heightChannel
        };
        let metallic = {
            map: this._shaderParameters.metallic.map,
            channel: this._metallicChannel
        };
        let roughness = {
            map: this._shaderParameters.roughness.map,
            channel: this._roughnessChannel
        };
        let ao = {
            map: this._shaderParameters.ambientOcclussion.map,
            channel: this._ambientOcclussionChannel
        };


        if (!this._merger) {
            this._merger = new bg.tools.TextureMerger(gl);
        }
        let hmrao = this._merger.mergeMaps(height, metallic, roughness, ao);
        this._shaderParameters.heightMetallicRoughnessAO.map = hmrao

        if (this._texturesToMerge>0) {
            this._texturesToMerge--;
        }
    }

    // colorOrPath: MUST be a valid file name, a bg.Color instance or a scalar value
    function getMaterialMap(context,paramName,value,basePath) {
        return new Promise((resolve,reject) => {
            if (typeof(value) == "string") {
                if (!bg.base.imageTools.isAbsolutePath(value)) {
                    value = bg.base.imageTools.mergePath(basePath,value);
                }
                bg.base.Loader.Load(context,value)
                    .then((texture) => {
                        this[paramName] = texture;
                        resolve(texture);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
            else if (value instanceof bg.Color || typeof(value) == "number") {
                this[paramName] = value;
                resolve(value);
            }
            else if (Array.isArray(value)) {
                switch (value.length) {
                case 2:
                    this[paramName] = new bg.Vector2(value);
                    break;
                case 3:
                    this[paramName] = new bg.Vector3(value);
                    break;
                case 4:
                    this[paramName] = new bg.Vector4(value);
                    break;
                }
                resolve(this[paramName]);
            }
            else {
                reject(new Error("Invalid PBR color parameter"));
            }
        });
    }

    // Offsets are deprecated
    class PBRMaterial {
        static ImportFromLegacyMaterial(context,mat) {
            let result = new bg.base.PBRMaterial();
            result.diffuse  = mat.texture || mat.diffuse;
            result.diffuseScale = mat.textureScale;
            result.normalScale = mat.normalMapScale;
            if (mat.normalMap) {
                result.normal = mat.normalMap;
            }
            if (mat.roughnessMask) {
                result.roughness = mat.roughnessMask;
            }
            if (!result.roughness && mat.shininessMask) {
                result.roughness = mat.shininessMask;
            }
            if (mat.reflectionMask) {
                result.metallic = mat.reflectionMask;
            }
            result.castShadows = mat.castShadows;
            return result;
        }

        static FromMaterialDefinition(context,def,basePath="") {
            let mat = new PBRMaterial();
            
            mat.diffuseScale = new bg.Vector2(Array.isArray(def.diffuseScale) ? def.diffuseScale : [1,1]);
            
            mat.metallicChannel = getScalar(def.metallicChannel, 0);
            mat.metallicScale = new bg.Vector2(Array.isArray(def.metallicScale) ? def.metallicScale : [1,1]);
            mat.roughnessChannel = getScalar(def.roughnessChannel, 0);
            mat.roughnessScale = new bg.Vector2(Array.isArray(def.roughnessScale) ? def.roughnessScale : [1,1]);
            mat.fresnelScale = new bg.Vector2(Array.isArray(def.fresnelScale) ? def.fresnelScale : [1,1]);
            mat.lightEmissionChannel = getScalar(def.lightEmissionChannel, 0);
            mat.lightEmissionScale = new bg.Vector2(Array.isArray(def.lightEmissionScale) ? def.lightEmissionScale : [1,1]);
            mat.ambientOcclussionChannel = getScalar(def.ambientOcclussionChannel,0);
            mat.heightChannel = getScalar(def.heightChannel, 0);
            mat.heightScale = new bg.Vector2(Array.isArray(def.heightScale) ? def.heightScale : [1,1]);
            mat.heightIntensity = getScalar(def.heightIntensity, 1);
            mat.normalScale = new bg.Vector2(Array.isArray(def.normalScale) ? def.normalScale : [1,1]);
            mat.isTransparent = def.isTransparent;

            mat.alphaCutoff = getScalar(def.alphaCutoff, 0.5);
            mat.castShadows = getBoolean(def.castShadows, true);
            mat.cullFace = getBoolean(def.cullFace, true);

            mat.diffuseUV = getScalar(def.diffuseUV, 0);
            mat.metallicUV = getScalar(def.metallicUV, 0);
            mat.roughnessUV = getScalar(def.roughnessUV, 0);
            mat.fresnelUV = getScalar(def.fresnelUV, 0);
            mat.lightEmissionUV = getScalar(def.lightEmissionUV, 0);
            mat.ambientOcclussionUV = getScalar(def.ambientOcclussionUV, 1);
            mat.normalUV = getScalar(def.normalUV, 0);
            mat.heightUV = getScalar(def.heightUV, 0);

            mat.unlit = def.unlit !== undefined ? def.unlit : false;
            
            let promises = [
                getMaterialMap.apply(mat, [context, 'diffuse', getColorOrTexture(def.diffuse, bg.Color.White()), basePath]),
                getMaterialMap.apply(mat, [context, 'metallic', getScalarOrTexture(def.metallic, 0), basePath]),
                getMaterialMap.apply(mat, [context, 'roughness', getScalarOrTexture(def.roughness, 1), basePath]),
                getMaterialMap.apply(mat, [context, 'fresnel', getColorOrTexture(def.fresnel, bg.Color.White()), basePath]),
                getMaterialMap.apply(mat, [context, 'lightEmission', getScalarOrTexture(def.lightEmission, 0), basePath]),
                getMaterialMap.apply(mat, [context, 'height', getScalarOrTexture(def.height, 0), basePath]),
                getMaterialMap.apply(mat, [context, 'normal', getColorOrTexture(def.normal, new bg.Color(0.5,0.5,1,1)), basePath]),
                getMaterialMap.apply(mat, [context, 'ambientOcclussion', getScalarOrTexture(def.ambientOcclussion, 0), basePath])
            ];

            return new Promise((resolve,reject) => {
                Promise.all(promises)
                    .then((result) => {
                        mat.getShaderParameters(context);
                        resolve(mat);
                    })
                    .catch((err) => {
                        console.warn(err.message);
                        mat.getShaderParameters(context);
                        resolve(mat);
                    });
            });
        }

        updateFromLegacyMaterial(context,mat) {
            if (mat.texture && this.diffuse!=mat.texture) {
                this.diffuse = mat.texture;
            }
            this.diffuseScale = mat.textureScale;
            this.normalScale = mat.normalMapScale;
            if (mat.normalMap != this.normal) {
                this.normal = mat.normalMap;
            }
            if (mat.roughnessMask && mat.roughnessMask != this.roughness) {
                this.roughness = mat.roughnessMask;
            }
            if (!mat.roughnessMask && this.roughness != mat.shininessMask) {
                this.roughness = mat.shininessMask;
            }
            if (mat.reflectionMask != this.metallic) {
                this.metallic = mat.reflectionMask;
            }
        }

        constructor() {
            this._diffuse = bg.Color.White();
            this._alphaCutoff = 0.5;
            this._isTransparent = false;
            this._metallic = 0;
            this._metallicChannel = 0;
            this._roughness = 1;
            this._roughnessChannel = 0;
            this._fresnel = bg.Color.White();
            this._lightEmission = 0;
            this._lightEmissionChannel = 0;
            this._ambientOcclussion = 1;
            this._ambientOcclussionChannel = 0;
            this._normal = new bg.Color(0.5,0.5,1,1);
            this._normalChannel = 0;
            this._height = bg.Color.Black();
            this._heightChannel = 0;
            this._heightIntensity = 1.0;
            this._castShadows = true;
            this._cullFace = true;
            this._unlit = false;


            // This variable is a flat that indicate that the
            // combined heighMetallicRoughnessAO texture must be
            // updated, because at least one of the base textures
            // have been chanted
            this._texturesToMerge = 0;

            this._shaderParameters = {
                diffuse: { map: null, release: false },
                metallic: { map: null, release: false },
                roughness: { map: null, release: false },
                fresnel: { map: null, release: false },
                lightEmission: { map: null, release: false },
                ambientOcclussion: { map: null, release: false },
                normal: { map: null, release: false },
                height: { map: null, release: false },

                heightMetallicRoughnessAO: { map: null, release: false },

                // Scalar and vector parameters
                diffuseScale: new bg.Vector2(1,1),
                metallicScale: new bg.Vector2(1,1),
                roughnessScale: new bg.Vector2(1,1),
                fresnelScale: new bg.Vector2(1,1),
                lightEmissionScale: new bg.Vector2(1,1),
                heightScale: new bg.Vector2(1,1),
                normalScale: new bg.Vector2(1,1),
                alphaCutoff: 0.5,
                castShadows: true,

                // UV channels to use for each texture
                diffuseUV: 0,
                metallicUV: 0,
                roughnessUV: 0,
                fresnelUV: 0,
                lightEmissionUV: 0,
                ambientOcclussionUV: 1,
                normalUV: 0,
                heightUV: 0
            };
        }

        static Defaults(context) {
            let TexCache = bg.base.TextureCache;
            let whiteTexture = TexCache.WhiteTexture(context);
            let blackTexture = TexCache.BlackTexture(context);
            let normalTexture = TexCache.NormalTexture(context);

            return {
                diffuse: {
                    map: whiteTexture
                    // channel not used
                },
                metallic: {
                    map: blackTexture,
                    channel: 0
                },
                roughness: {
                    map: whiteTexture,
                    channel: 0
                },
                fresnel: {
                    map: whiteTexture,
                    // channel not used
                },
                lightEmission: {
                    map: blackTexture,
                    channel: 0
                },
                normal: {
                    map: normalTexture
                    // channel not used
                },
                ambientOcclussion: {
                    map: whiteTexture,
                    channel: 0
                },
                height: {
                    map: blackTexture,
                    channel: 0
                }
            };
        }

        clone() {
            let copy = new PBRMaterial();
            copy.assign(this);
            return copy;
        }

        assign(other) {
            this.diffuse = other.diffuse;
            this.isTransparent = other.isTransparent;
            this.alphaCutoff = other.alphaCutoff;
            this.diffuseScale = other.diffuseScale;
            this.metallic = other.metallic;
            this.metallicChannel = other.metallicChannel;
            this.metallicScale = other.metallicScale;
            this.roughness = other.roughness;
            this.roughnessChannel = other.roughnessChannel;
            this.roughnessScale = other.roughnessScale;
            this.fresnel = other.fresnel;
            this.fresnelScale = other.fresnelScale;
            this.lightEmission = other.lightEmission;
            this.lightEmissionChannel = other.lightEmissionChannel;
            this.lightEmissionScale = other.lightEmissionScale;
            this.ambientOcclussion = other.ambientOcclussion;
            this.ambientOcclussionChannel = other.ambientOcclussionChannel;
            this.height = other.height;
            this.heightChannel = other.heightChannel;
            this.heightScale = other.heightScale;
            this.heightIntensity = other.heightIntensity;
            this.normal = other.normal;
            this.normalScale = other.normalScale;
            this.castShadows = other.castShadows;
            this.cullFace = other.cullFace;
            this.unlit = other.unlit;

            // UV maps
            this.diffuseUV = other.diffuseUV;
            this.metallicUV = other.metallicUV;
            this.roughnessUV = other.roughnessUV;
            this.fresnelUV = other.fresnelUV;
            this.lightEmissionUV = other.lightEmissionUV;
            this.ambientOcclussionUV = other.ambientOcclussionUV;
            this.normalUV = other.normalUV;
            this.heightUV = other.heightUV;
        }

        /* Release the PBR material resources:
         *  The PBR material parameters are always textures. You can set scalar or vector parameters,
         *  but in that case will be converted into a minimum size texture, that is stored in the material
         *  object, and for that reason it's important to delete the material objects to release that 
         *  resources.
         * 
         *  If the specified parameters are textures, then the PBRMaterial will not release that objects
         *  when the destroy() function is called
         */
        destroy() {
            release.apply(this,["diffuse"]);
            release.apply(this,["metallic"]);
            release.apply(this,["roughness"]);
            release.apply(this,["fresnel"]);
            release.apply(this,["ambientOcclussion"]);
            release.apply(this,["lightEmission"]);
            release.apply(this,["normal"]);
            release.apply(this,["height"]);
        }

        /* Returns the PBR shader parameters
         *  This function returns the material _shaderParameters object, and if it's necesary, will
         *  create the texture resources (for example, if a scalar or vector parameter is set).
         * 
         */
        getShaderParameters(context) {
            let prepareResource = (paramName) => {
                if (!this._shaderParameters[paramName].map) {
                    this._shaderParameters[paramName].release = true;
                    this._shaderParameters[paramName].map = getMap.apply(this,[context,this[paramName]]);
                }
            }

            prepareResource("diffuse");
            prepareResource("metallic");
            prepareResource("roughness");
            prepareResource("fresnel");
            prepareResource("ambientOcclussion");
            prepareResource("lightEmission");
            prepareResource("normal");
            prepareResource("height");


            if (this._texturesToMerge>0 || this._shaderParameters.heightMetallicRoughnessAO.map==null) {
                combineMaps.apply(this,[context]);
            }

            return this._shaderParameters;
        }

        /* PBR material parameters
         *  The following functions returns the shader parameters. Each parameter may be an scalar,
         *  a vector or a texture value. If the parameter is intrinsically a one-dimesional value, for
         *  example, the roughness map, it will be accompanied by a channel index
         */
        get diffuse() { return this._diffuse; }
        get metallic() { return this._metallic; }
        get metallicChannel() { return this._metallicChannel; }
        get roughness() { return this._roughness; }
        get roughnessChannel() { return this._roughnessChannel; }
        get fresnel() { return this._fresnel; }
        get ambientOcclussion() { return this._ambientOcclussion; }
        get ambientOcclussionChannel() { return this._ambientOcclussionChannel; }
        get lightEmission() { return this._lightEmission; }
        get lightEmissionChannel() { return this._lightEmissionChannel; }
        get normal() { return this._normal; }
        get height() { return this._height; }
        get heightChannel() { return this._heightChannel; }

        set diffuse(v) {
            release.apply(this,["diffuse"]);
            this._shaderParameters.diffuse.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.diffuse.release = this._shaderParameters.diffuse.map == null;
            this._diffuse = v;
        }

        set metallic(v) {
            if (this._metallic==v) {
                return;
            }
            release.apply(this,["metallic"]);
            this._shaderParameters.metallic.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.metallic.release = this._shaderParameters.metallic.map == null;
            this._metallic = v;
            if( this._texturesToMerge==0 || v instanceof bg.base.Texture) {
                this._texturesToMerge++;
            }
        }

        set metallicChannel(c) { this._metallicChannel = c; }

        set roughness(v) {
            if (this._roughness==v) {
                return;
            }
            release.apply(this,["roughness"]);
            this._shaderParameters.roughness.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.roughness.release = this._shaderParameters.roughness.map == null;
            this._roughness = v;
            if( this._texturesToMerge==0 || v instanceof bg.base.Texture) {
                this._texturesToMerge++;
            }
        }

        set roughnessChannel(c) { this._roughnessChannel = c; }

        set fresnel(v) {
            release.apply(this,["fresnel"]);
            this._shaderParameters.fresnel.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.fresnel.release = this._shaderParameters.fresnel.map == null;
            this._fresnel = v;
        }

        set ambientOcclussion(ao) {
            if (this._ambientOcclussion==ao) {
                return;
            }
            release.apply(this,["ambientOcclussion"]);
            this._shaderParameters.ambientOcclussion.map = ao instanceof bg.base.Texture ? ao : null;
            this._shaderParameters.ambientOcclussion.release = this._shaderParameters.ambientOcclussion.map == null;
            this._ambientOcclussion = ao;
            if( this._texturesToMerge==0 || ao instanceof bg.base.Texture) {
                this._texturesToMerge++;
            }
        }

        set ambientOcclussionChannel(c) { this._ambientOcclussionChannel = c; }

        set height(v) {
            if (this._height==v) {
                return;
            }
            release.apply(this,["height"]);
            this._shaderParameters.height.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.height.release = this._shaderParameters.height.map == null;
            this._height = v;
            if( this._texturesToMerge==0 || v instanceof bg.base.Texture) {
                this._texturesToMerge++;
            }
        }

        set heightChannel(c) { this._heightChannel = c; }

        set lightEmission(v) {
            release.apply(this,["lightEmission"]);
            this._shaderParameters.lightEmission.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.lightEmission.release = this._shaderParameters.lightEmission.map == null;
            this._lightEmission = v;
        }

        set lightEmissionChannel(c) { this._lightEmissionChannel = c; }

        set normal(v) {
            release.apply(this,["normal"]);
            this._shaderParameters.normal.map = v instanceof bg.base.Texture ? v : null;
            this._shaderParameters.normal.release = this._shaderParameters.normal.map == null;
            this._normal = v;
        }


        // Deprecated parameters: offsets
        get diffuseOffset() { console.warn("diffuseOffset: deprecated parameter."); return new bg.Vector2(0); }
        set diffuseOffset(v) { console.warn("diffuseOffset: deprecated parameter.");  }
        get normalOffset() { console.warn("normalOffset: deprecated parameter."); return new bg.Vector2(0); }
        set normalOffset(v) { console.warn("normalOffset: deprecated parameter.");  }

        // Vector and scalar parameters
        get alphaCutoff() { return this._alphaCutoff; }
        set alphaCutoff(v) { this._alphaCutoff = v; }
        get isTransparent() { return this._isTransparent; }
        set isTransparent(v) { this._isTransparent = v; }
        get diffuseScale() { return this._shaderParameters.diffuseScale; }
        set diffuseScale(v) { this._shaderParameters.diffuseScale = v || new bg.Vector2(1,1); }
        get metallicScale() { return this._shaderParameters.metallicScale; }
        set metallicScale(v) { this._shaderParameters.metallicScale = v || new bg.Vector2(1,1); }
        get roughnessScale() { return this._shaderParameters.roughnessScale; }
        set roughnessScale(v) { this._shaderParameters.roughnessScale = v || new bg.Vector2(1,1); }
        get fresnelScale() { return this._shaderParameters.fresnelScale; }
        set fresnelScale(v) { this._shaderParameters.fresnelScale = v || new bg.Vector2(1,1); }
        get lightEmissionScale() { return this._shaderParameters.lightEmissionScale; }
        set lightEmissionScale(v) { this._shaderParameters.lightEmissionScale = v || new bg.Vector2(1,1); }
        get heightScale() { return this._shaderParameters.heightScale; }
        set heightScale(h) { this._shaderParameters.heightScale = h || new bg.Vector2(1,1); }
        get heightIntensity() { return this._heightIntensity; }
        set heightIntensity(h) { this._heightIntensity = h; }
        get normalScale() { return this._shaderParameters.normalScale; }
        set normalScale(v) { this._shaderParameters.normalScale = v || new bg.Vector2(1,1); }
        get castShadows() { return this._castShadows; }
        set castShadows(c) { this._castShadows = c; }
        get cullFace() { return this._cullFace; }
        set cullFace(c) { this._cullFace = c; }
        get unlit() { return this._unlit; }
        set unlit(v) { this._unlit = v; }
        get diffuseUV() { return this._shaderParameters.diffuseUV; }
        set diffuseUV(uv) { this._shaderParameters.diffuseUV = uv; }
        get metallicUV() { return this._shaderParameters.metallicUV; }
        set metallicUV(uv) { this._shaderParameters.metallicUV = uv; }
        get roughnessUV() { return this._shaderParameters.roughnessUV; }
        set roughnessUV(uv) { this._shaderParameters.roughnessUV = uv; }
        get fresnelUV() { return this._shaderParameters.fresnelUV; }
        set fresnelUV(uv) { this._shaderParameters.fresnelUV = uv; }
        get lightEmissionUV() { return this._shaderParameters.lightEmissionUV; }
        set lightEmissionUV(uv) { this._shaderParameters.lightEmissionUV = uv; }
        get ambientOcclussionUV() { return this._shaderParameters.ambientOcclussionUV; }
        set ambientOcclussionUV(uv) { this._shaderParameters.ambientOcclussionUV = uv; }
        get normalUV() { return this._shaderParameters.normalUV; }
        set normalUV(uv) { this._shaderParameters.normalUV = uv; }
        get heightUV() { return this._shaderParameters.heightUV; }
        set heightUV(uv) { this._shaderParameters.heightUV = uv; }

        getExternalResources(resources=[]) {
            function tryadd(texture) {
                if (texture instanceof bg.base.Texture &&
                    texture.fileName && 
                    texture.fileName!="" &&
                    resources.indexOf(texture.fileName)==-1)
                {
                    resources.push(texture.fileName);
                }
            }
            tryadd(this.diffuse);
            tryadd(this.metallic);
            tryadd(this.roughness);
            tryadd(this.fresnel);
            tryadd(this.lightEmission);
            tryadd(this.ambientOcclussion);
            tryadd(this.height);
            tryadd(this.normal);
            return resources;
        }

        copyMaterialSettings(mat,mask) {
            if (mat instanceof PBRMaterial) {
                if (mask & bg.base.PBRMaterialFlag.DIFFUSE) {                  // diffuse, isTransparent, alphaCutoff, diffuseScale
                    mat.diffuse = this.diffuse;
                    mat.alphaCutoff = this.alphaCutoff;
                    mat.isTransparent = this.isTransparent;
                    mat.diffuseScale = this.diffuseScale;
                }   
                if (mask & bg.base.PBRMaterialFlag.METALLIC) {                 // metallic, metallicChannel, metallicScale
                    mat.metallic = this.metallic;
                    mat.metallicChannel = this.metallicChannel;
                    mat.metallicScale = this.metallicScale;
                }   
                if (mask & bg.base.PBRMaterialFlag.ROUGHNESS) {                // roughness, roughnessChannel, roughnessScale
                    mat.roughness = this.roughness;
                    mat.roughnessChannel = this.roughnessChannel;
                    mat.roughnessScale = this.roughnessScale;
                }   
                if (mask & bg.base.PBRMaterialFlag.FRESNEL) {                   // fresnel color, fresnelScale
                    mat.fresnel = this.fresnel;
                    mat.fresnelScale = this.fresnelScale;
                }
                if (mask & bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION) {       // ambientOcclussion, ambientOcclussionChannel
                    mat.ambientOcclussion = this.ambientOcclussion;
                    mat.ambientOcclussionChannel = this.ambientOcclussionChannel;
                }
                if (mask & bg.base.PBRMaterialFlag.LIGHT_EMISSION) {           // lightEmission, lightEmissionChannel, lightEmissionScale
                    mat.lightEmission = this.lightEmission;
                    mat.lightEmissionChannel = this.lightEmissionChannel;
                    mat.lightEmissionScale = this.lightEmissionScale;
                }   
                if (mask & bg.base.PBRMaterialFlag.HEIGHT) {                   // height, heightChannel, heightScale, heightIntensity
                    mat.height = this.height;
                    mat.heightChannel = this.heightChannel;
                    mat.heightScale = this.heightScale;
                    mat.heightIntensity = this.heightIntensity;
                } 
                if (mask & bg.base.PBRMaterialFlag.NORMAL) {                   // normal, normalScale
                    mat.normal = this.normal;
                    mat.normalScale = this.normalScale;
                }
                if (mask & bg.base.PBRMaterialFlag.LIGHT_MAP) {                // not used
    
                }   
                if (mask & bg.base.PBRMaterialFlag.SHADOWS) {                  // castShadows/receiveShadows
                    mat.castShadows = this.castShadows;
                }   
                if (mask & bg.base.PBRMaterialFlag.CULL_FACE) {                // cullFace
                    mat.cullFace = this.cullFace;
                }   
                if (mask & bg.base.PBRMaterialFlag.UNLIT) {                    // unlit
                    mat.unlit = this.unlit;
                }

                // UV channels: skyped
            }
            else {
                console.warn("Could not copy material: the target is not a PBR material");
            }
        }

        applyModifier(context,mod,resourcePath) {
            if (mod instanceof bg.base.MaterialModifier) {
                console.warn("MaterialModifier applied to PBRMaterial. Performing automatic converstion to PBRMaterialModifier.");
                mod = bg.base.PBRMaterialModifier.ConvertToPBR(mod);
            }

            if (mod.isEnabled(bg.base.PBRMaterialFlag.SHADOWS)) {          // castShadows/receiveShadows
                this.castShadows = mod.castShadows;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.CULL_FACE)) {        // cullFace
                this.cullFace = mod.cullFace;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.UNLIT)) {            // unlit
                this.unlit = mod.unlit;
            }
            
            // Texture or scalar/vector
            function getTexture(texturePath) {
                if (!bg.base.imageTools.isAbsolutePath(texturePath)) {
                    texturePath = bg.base.imageTools.mergePath(resourcePath, texturePath);
                }

                let result = bg.base.TextureCache.Get(context).find(texturePath);
                if (!result) {
                    result = new bg.base.Texture(context);
                    result.create();
                    result.fileName = texturePath;
                    bg.base.TextureCache.Get(context).register(texturePath,result);

                    (function(p,t) {
                        bg.utils.Resource.Load(p)
                            .then((imgData) => {
                                t.bind();
                                t.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
                                t.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
                                t.fileName = p;
                                t.setImage(imgData);
                            });
                    })(texturePath,result);
                }
                return result;
            }

            function textureOrScalar(value) {
                if (typeof(value)=="string" && value!=="") {
                    // texture
                    return getTexture(value);
                }
                else if (!isNaN(value)) {
                    // scalar
                    return value;
                }
                else {
                    throw new Error("Invalid parameter: expecting texture path or scalar");
                }
            }
            function textureOrColor(value) {
                if (typeof(value)=="string" && value!=="") {
                    // texture
                    return getTexture(value);
                }
                else if (value instanceof bg.Color) {
                    // color
                    return value;
                }
                else if (Array.isArray(value) && value.length==4) {
                    return new bg.Color(value);
                }
                else {
                    throw new Error("Invalid parameter: expecting texture path or color");
                }
            }

            if (mod.isEnabled(bg.base.PBRMaterialFlag.DIFFUSE)) {          // diffuse, isTransparent, alphaCutoff, diffuseScasle
                this.diffuse = textureOrColor(mod.diffuse);
                this.isTransparent = mod.isTransparent;
                this.alphaCutoff = mod.alphaCutoff;
                this.diffuseScale = mod.diffuseScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.METALLIC)) {         // metallic, metallicChannel, metallicScale
                this.metallic = textureOrScalar(mod.metallic);
                this.metallicChannel = mod.metallicChannel;
                this.metallicScale = mod.metallicScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.ROUGHNESS)) {        // roughness, roughnessChannel, roughnessScale
                this.roughness = textureOrScalar(mod.roughness);
                this.roughnessChannel = mod.roughnessChannel;
                this.roughnessScale = mod.roughnessScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.FRESNEL)) {       // fresnel color, fresnelScale
                this.fresnel = textureOrColor(mod.fresnel);
                this.fresnelScale = mod.fresnelScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION)) {        // ambientOcclussion, ambientOcclussionChannel
                this.ambientOcclussion = textureOrScalar(mod.ambientOcclussion);
                this.ambientOcclussionChannel = mod.ambientOcclussionChannel;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION)) {   // lightEmission, lightEmissionChannel, lightEmissionScale
                this.lightEmission = textureOrScalar(mod.lightEmission);
                this.lightEmissionChannel = mod.lightEmissionChannel;
                this.lightEmissionScale = mod.lightEmissionScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.HEIGHT)) {           // height, heightChannel, heightScale, heightIntensity
                this.height = textureOrScalar(mod.height);
                this.heightChannel = mod.heightChannel;
                this.heightScale = mod.heightScale;
                this.heightIntensity = mod.heightIntensity;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.NORMAL)) {           // normal, normalScale
                this.normal = textureOrColor(mod.normal);
                this.normalScale = mod.normalScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.LIGHT_MAP)) {        // not used
            }

            // UV channels: skyped
        }

        getModifierWithMask(modifierMask) {
            let mod = new PBRMaterialModifier();
            mod.modifierMask = modifierMask;

            function colorOrTexturePath(paramName) {
                let data = this[paramName];
                if (data instanceof bg.base.Texture) {
                    return data.fileName;
                }
                else {
                    return data;
                }
            }

            function scalarOrTexturePath(paramName) {
                let data = this[paramName];
                if (data instanceof bg.base.Texture) {
                    return data.fileName;
                }
                else {
                    return data;
                }
            }

            if (mod.isEnabled(bg.base.PBRMaterialFlag.DIFFUSE)) {
                mod.diffuse = colorOrTexturePath.apply(this,["diffuse"]);
                mod.isTransparent = this.isTransparent;
                mod.alphaCutoff = this.alphaCutoff;
                mod.diffuseScale = this.diffuseScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.METALLIC)) {
                mod.metallic = scalarOrTexturePath.apply(this,["metallic"]);
                mod.metallicChannel = this.metallicChannel;
                mod.metallicScale = this.metallicScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.ROUGHNESS)) {
                mod.roughness = scalarOrTexturePath.apply(this,["roughness"]);
                mod.roughnessChannel = this.roughnessChannel;
                mod.roughnessScale = this.roughnessScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.FRESNEL)) {
                mod.fresnel = colorOrTexturePath.apply(this,["fresnel"]);
                mod.fresnelScale = this.fresnelScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.AMBIENT_OCCLUSSION)) {
                mod.ambientOcclussion = scalarOrTexturePath.apply(this,["ambientOcclussion"]);
                mod.ambientOcclussionChannel = this.ambientOcclussionChannel;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.LIGHT_EMISSION)) {
                mod.lightEmission = scalarOrTexturePath.apply(this,["lightEmission"]);
                mod.lightEmissionChannel = this.lightEmissionChannel;
                mod.lightEmissionScale = this.lightEmissionScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.HEIGHT)) {
                mod.height = scalarOrTexturePath.apply(this,["height"]);
                mod.heightChannel = this.heightChannel;
                mod.heightScale = this.heightScale;
                mod.heightIntensity = this.heightIntensity;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.NORMAL)) {
                mod.normal = colorOrTexturePath.apply(this,["normal"]);
                mod.normalScale = this.normalScale;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.LIGHT_MAP)) {
                // not used
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.SHADOWS)) {
                mod.castShadows = this.castShadows;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.CULL_FACE)) {
                mod.cullFace = this.cullFace;
            }
            if (mod.isEnabled(bg.base.PBRMaterialFlag.UNLIT)) {
                mod.unlit = this.unlit;
            }

            // The UV channels are not compatible with material modifiers, because they are related
            // with the geometry, and not the material

            return mod;
        }

        static GetMaterialWithJson(context,data,path) {
            return PBRMaterial.FromMaterialDefinition(context,data,path);            
        }
    }

    bg.base.PBRMaterial = PBRMaterial;

})();