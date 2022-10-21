(function() {
    // NOTE: this plugin is intended to be used only in an Electron.js app
    if (!bg.isElectronApp) {
        return false;
    }

    let fs = require('fs');
    let path = require('path');

    function writeTexture(texture,fileData) {
        if (texture) {
            let dstPath = bg.base.Writer.StandarizePath(fileData.path).split("/");
            dstPath.pop();
            let paths = {
                src: bg.base.Writer.StandarizePath(texture.fileName),
                dst: null
            };

            let srcFileName = paths.src.split("/").pop();
            dstPath.push(srcFileName);
            dstPath = dstPath.join("/");
            paths.dst = dstPath;

            if (paths.src!=paths.dst) {
                fileData.copyFiles.push(paths);
            }
            return srcFileName;
        }
        else {
            return "";
        }
    }
    function serializeMaterial(plist,materialData,fileData) {
        let mat = null;

        if (materialData instanceof bg.base.Material) {
            mat = {
                "name": plist.name,
                "class": "GenericMaterial",

                "diffuseR": materialData.diffuse.r,
                "diffuseG": materialData.diffuse.g,
                "diffuseB": materialData.diffuse.b,
                "diffuseA": materialData.diffuse.a,

                "specularR": materialData.specular.r,
                "specularG": materialData.specular.g,
                "specularB": materialData.specular.b,
                "specularA": materialData.specular.a,

                "shininess": materialData.shininess,
                "refractionAmount": materialData.refractionAmount,
                "reflectionAmount": materialData.reflectionAmount,
                "lightEmission": materialData.lightEmission,

                "textureOffsetX": materialData.textureOffset.x,
                "textureOffsetY": materialData.textureOffset.y,
                "textureScaleX": materialData.textureScale.x,
                "textureScaleY": materialData.textureScale.y,

                "lightmapOffsetX": materialData.lightmapOffset.x,
                "lightmapOffsetY": materialData.lightmapOffset.y,
                "lightmapScaleX": materialData.lightmapScale.x,
                "lightmapScaleY": materialData.lightmapScale.y,

                "normalMapOffsetX": materialData.normalMapOffset.x,
                "normalMapOffsetY": materialData.normalMapOffset.y,
                "normalMapScaleX": materialData.normalMapScale.x,
                "normalMapScaleY": materialData.normalMapScale.y,

                "castShadows": materialData.castShadows,
                "receiveShadows": materialData.receiveShadows,

                "alphaCutoff": materialData.alphaCutoff,

                "shininessMaskChannel": materialData.shininessMaskChannel,
                "invertShininessMask": materialData.shininessMaskInvert,
                "lightEmissionMaskChannel": materialData.lightEmissionMaskChannel,
                "invertLightEmissionMask": materialData.lightEmissionMaskInvert,

                "displacementFactor": 0,
                "displacementUV": 0,
                "tessDistanceFarthest": 40.0,
                "tessDistanceFar": 30.0,
                "tessDistanceNear": 15.0,
                "tessDistanceNearest": 8.0,
                "tessFarthestLevel": 1,
                "tessFarLevel": 1,
                "tessNearLevel": 1,
                "tessNearestLevel": 1,

                "reflectionMaskChannel": materialData.reflectionMaskChannel,
                "invertReflectionMask": materialData.reflectionMaskInvert,

                "roughness": materialData.roughness,
                "roughnessMaskChannel": materialData.roughnessMaskChannel,
                "invertRoughnessMask": materialData.roughnessMaskInvert,

                "cullFace": materialData.cullFace,

                "unlit": materialData.unlit,

                "texture": writeTexture(materialData.texture,fileData),
                "lightmap": writeTexture(materialData.lightmap,fileData),
                "normalMap": writeTexture(materialData.normalMap,fileData),
                "shininessMask": writeTexture(materialData.shininessMask,fileData),
                "lightEmissionMask": writeTexture(materialData.lightEmissionMask,fileData),
                "displacementMap": "",
                "reflectionMask": writeTexture(materialData.reflectionMask,fileData),
                "roughnessMask": writeTexture(materialData.roughnessMask,fileData),
                "visible": plist.visible,
                "visibleToShadows": plist.visibleToShadows,
                "groupName": plist.groupName
            };
        }
        else if (materialData instanceof bg.base.PBRMaterial) {
            mat = {
                "name": plist.name,
                "class": "PBRMaterial",

                "metallicChannel": materialData.metallicChannel,
                "roughnessChannel": materialData.roughnessChannel,
                "lightEmissionChannel": materialData.lightEmissionChannel,
                "heightChannel": materialData.heightChannel,
                "alphaCutoff": materialData.alphaCutoff,
                "isTransparent": materialData.isTransparent,
                
                "diffuseScale": materialData.diffuseScale.toArray(),
                "metallicScale": materialData.metallicScale.toArray(),
                "roughnessScale": materialData.roughnessScale.toArray(),
                "fresnelScale": materialData.fresnelScale.toArray(),
                "lightEmissionScale": materialData.lightEmissionScale.toArray(),
                "heightScale": materialData.heightScale.toArray(),
                "normalScale": materialData.normalScale.toArray(),

                "diffuseUV": materialData.diffuseUV,
                "metallicUV": materialData.metallicUV,
                "roughnessUV": materialData.roughnessUV,
                "fresnelUV": materialData.fresnelUV,
                "ambientOcclussionUV": materialData.ambientOcclussionUV,
                "lightEmissionUV": materialData.lightEmissionUV,
                "heightUV": materialData.heightUV,
                "normalUV": materialData.normalUV,

                "castShadows": materialData.castShadows,
                "cullFace": materialData.cullFace,
                "unlit": materialData.unlit,

                "visible": plist.visible,
                "visibleToShadows": plist.visibleToShadows,
                "groupName": plist.groupName
            };

            function saveMixedValue(attributeName) {
                let data = materialData[attributeName];
                if (data instanceof bg.base.Texture) {
                    mat[attributeName] = bg.utils.path.fileName(data.fileName);data.fileName;
                    writeTexture(data,fileData);
                }
                else if (
                    data instanceof bg.Vector4 ||
                    data instanceof bg.Vector3 ||
                    data instanceof bg.Vector2
                ) {
                    mat[attributeName] = data.toArray();
                }
                else if (typeof(data) == "number") {
                    mat[attributeName] = data;
                }
            }

            saveMixedValue("diffuse");
            saveMixedValue("metallic");
            saveMixedValue("roughness");
            saveMixedValue("fresnel");
            saveMixedValue("lightEmission");
            saveMixedValue("height");
            saveMixedValue("normal");
            saveMixedValue("ambientOcclussion");
        }

        return mat;
    }
    function getMaterialString(fileData) {
        let mat = [];
        fileData.node.drawable.forEach((plist,material) => {
            let matItem = serializeMaterial(plist,material,fileData);
            mat.push(matItem);
        });
        return JSON.stringify(mat);
    }

    function getJointString(fileData) {
        let joints = {};
        let inJoint = fileData.node.component("bg.scene.InputChainJoint");
        let outJoint = fileData.node.component("bg.scene.OutputChainJoint");
        if (inJoint) {
            joints.input = {
                "type":"LinkJoint",
                "offset":[
                    inJoint.joint.offset.x,
                    inJoint.joint.offset.y,
                    inJoint.joint.offset.z
                ],
                "pitch": inJoint.joint.pitch,
                "roll": inJoint.joint.roll,
                "yaw": inJoint.joint.yaw
            };
        }
        if (outJoint) {
            joints.output = [{
                "type":"LinkJoint",
                "offset":[
                    outJoint.joint.offset.x,
                    outJoint.joint.offset.y,
                    outJoint.joint.offset.z
                ],
                "pitch": outJoint.joint.pitch,
                "roll": outJoint.joint.roll,
                "yaw": outJoint.joint.yaw
            }];
        }
        return JSON.stringify(joints);
    }

    function ensurePolyListName(fileData) {
        let plistNames = [];
        let plIndex = 0;
        fileData.node.drawable.forEach((plist,matName) => {
            let plName = plist.name;
            if (!plName || plistNames.indexOf(plName)!=-1) {
                do {
                    plName = "polyList_" + plIndex;
                    ++plIndex;
                }
                while (plistNames.indexOf(plName)!=-1);
                plist.name = plName;
            }
            plistNames.push(plName);
        });
    }

    class FileData {
        constructor(path,node) {
            this._path = path;
            this._node = node;
            this._copyFiles = [];
            this._stream = fs.createWriteStream(path);
        }

        get path() { return this._path; }
        get node() { return this._node; }
        get copyFiles() { return this._copyFiles; }

        get stream() { return this._stream; }

        writeUInt(number) {
            let buffer = Buffer.alloc(4);
            buffer.writeUInt32BE(number,0);
            this.stream.write(buffer);
        }
        
        writeBlock(blockName) {
            this.stream.write(Buffer.from(blockName,"utf-8"));
        }

        writeString(stringData) {
            this.writeUInt(stringData.length);
            this.stream.write(Buffer.from(stringData,"utf-8"));
        }

        writeBuffer(name,arrayBuffer) {
            this.writeBlock(name);
            this.writeUInt(arrayBuffer.length);
            let buffer = Buffer.alloc(4 * arrayBuffer.length);
            if (name=="indx") {
                arrayBuffer.forEach((d,i) => buffer.writeUInt32BE(d,i * 4));
            }
            else {
                arrayBuffer.forEach((d,i) => buffer.writeFloatBE(d,i * 4));
            }
            this.stream.write(buffer);
        }

        writeTextures() {
            let promises = [];
            this.copyFiles.forEach((copyData) => {
                promises.push(new Promise((resolve,reject) => {
                    let rd = fs.createReadStream(copyData.src);
                    rd.on('error',rejectCleanup);
                    let wr = fs.createWriteStream(copyData.dst);
                    wr.on('error',rejectCleanup);
                    function rejectCleanup(err) {
                        rd.destroy();
                        wr.end();
                        reject(err);
                    }
                    wr.on('finish',resolve);
                    rd.pipe(wr);
                }))
            });
            return Promise.all(promises);
        }
    }

    function writeHeader(fileData) {
        let buffer = Buffer.alloc(4);
        [
            0,  // big endian
            1,  // major version
            2,  // minor version
            0   // review
        ].forEach((d,i) => buffer.writeInt8(d,i));
        fileData.stream.write(buffer);
        
        // Header 
        fileData.writeBlock("hedr");

        // Ensure that all poly list have name and material name
        ensurePolyListName(fileData);

        // Number of polyLists
        let drw = fileData.node.drawable;
        let plistItems = 0;
        drw.forEach(() => plistItems++);
        fileData.writeUInt(plistItems);

        // Material header
        fileData.writeBlock("mtrl");
        fileData.writeString(getMaterialString(fileData));

        // Joints header
        fileData.writeBlock("join");
        fileData.writeString(getJointString(fileData));
    }

    function writePolyList(fileData,plist,material,trx) {
        //let buffer = Buffer.alloc(4);
        //fileData.stream.write(Buffer.from("plst","utf-8")); // poly list
        fileData.writeBlock("plst");

        // Poly list name
        fileData.writeBlock("pnam");
        fileData.writeString(plist.name);

        // Material name, the same as plist name in version 1.2.0
        fileData.writeBlock("mnam");
        fileData.writeString(plist.name);

        fileData.writeBuffer("varr",plist.vertex);
        fileData.writeBuffer("narr",plist.normal);
        fileData.writeBuffer("t0ar",plist.texCoord0);
        fileData.writeBuffer("t1ar",plist.texCoord1);
        fileData.writeBuffer("indx",plist.index);
    }

    function writeComponents(fileData) {
        let path = bg.utils.path.removeFileName(fileData.path);
        fileData.writeBlock("cmps");
        let components = [];
        let promises = [];
        fileData.node._componentsArray.forEach((cmp) => {
            // TODO: Refactorize non serializable components
            if (cmp instanceof bg.scene.Drawable ||
                cmp instanceof bg.manipulation.Gizmo || 
                cmp instanceof bg.manipulation.Selectable) {
                return;
            }
            let compData = {};
            cmp.serialize(compData,promises,path);
            components.push(compData);
        });
        fileData.writeString(JSON.stringify(components));
        return Promise.all(promises);
    }

    function writeNode(fileData) {
        writeHeader(fileData);
        fileData.node.drawable.forEach((plist,mat,trx) => {
            writePolyList(fileData,plist,mat,trx);
        });
        fileData.writeBlock("endf");
       
        return new Promise((resolve) => {
            writeComponents(fileData).then(() => {
                fileData.stream.end();
                resolve();
            })

            .catch((err) => {
                reject(err);
            });
        })
    }

    class Bg2WriterPlugin extends bg.base.WriterPlugin {
        acceptType(url,data) {
            let ext = url.split(".").pop();
            return /bg2/i.test(ext) || /vwglb/i.test(ext);
        }

        write(url,data) {
            return new Promise((resolve,reject) => {
                if (!data || !data instanceof bg.scene.Node || !data.drawable) {
                    reject(new Error("Invalid data format. Expecting scene node."));
                }
                let fileData = new FileData(url,data);

                try {
                    writeNode(fileData)
                        .then(() => {
                            fileData.writeTextures()
                                .then(() => resolve())
                                .catch((err) => reject(err));
                        })
                    }
                catch (err) {
                    reject(err);
                }
            })
        }
    }

    bg.base.Bg2WriterPlugin = Bg2WriterPlugin;
})();