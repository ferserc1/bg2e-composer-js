app.addSource(() => {
    let fs = require('fs');
    let path = require('path');

    function writeTexture(texture,fileData) {
        if (texture) {
            let dstPath = fileData.path.split("/");
            dstPath.pop();
            let srcFileName = texture.fileName.split("/").pop();
            dstPath.push(srcFileName);
            dstPath = dstPath.join("/");
            let paths = {
                src: texture.fileName,
                dst: dstPath
            };
            if (paths.src!=paths.dst) {
                fileData.copyFiles.push(paths);
            }
            return srcFileName;
        }
        else {
            return "";
        }
    }
    function getMaterialString(fileData) {
        let mat = [];
        fileData.node.drawable.forEach((plist,material) => {
            mat.push({
                "name": plist.name,
                "class": "GenericMaterial",

                "diffuseR": material.diffuse.r,
                "diffuseG": material.diffuse.g,
                "diffuseB": material.diffuse.b,
                "diffuseA": material.diffuse.a,

                "specularR": material.specular.r,
                "specularG": material.specular.g,
                "specularB": material.specular.b,
                "specularA": material.specular.a,

                "shininess": material.shininess,
                "refractionAmount": material.refractionAmount,
                "reflectionAmount": material.reflectionAmount,
                "lightEmission": material.lightEmission,

                "textureOffsetX": material.textureOffset.x,
                "textureOffsetY": material.textureOffset.y,
                "textureScaleX": material.textureScale.x,
                "textureScaleY": material.textureScale.y,

                "lightmapOffsetX": material.lightmapOffset.x,
                "lightmapOffsetY": material.lightmapOffset.y,
                "lightmapScaleX": material.lightmapScale.x,
                "lightmapScaleY": material.lightmapScale.y,

                "normalMapOffsetX": material.normalMapOffset.x,
                "normalMapOffsetY": material.normalMapOffset.y,
                "normalMapScaleX": material.normalMapScale.x,
                "normalMapScaleY": material.normalMapScale.y,

                "castShadows": material.castShadows,
                "receiveShadows": material.receiveShadows,

                "alphaCutoff": material.alphaCutoff,

                "shininessMaskChannel": material.shininessMaskChannel,
                "invertShininessMask": material.shininessMaskInvert,
                "lightEmissionMaskChannel": material.lightEmissionMaskChannel,
                "invertLightEmissionMask": material.lightEmissionMaskInvert,

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

                "reflectionMaskChannel": material.reflectionMaskChannel,
                "invertReflectionMask": material.reflectionMaskInvert,

                "cullFace": material.cullFace,

                "texture": writeTexture(material.texture,fileData),
                "lightmap": writeTexture(material.lightmap,fileData),
                "normalMap": writeTexture(material.normalMap,fileData),
                "shininessMask": writeTexture(material.shininessMask,fileData),
                "lightEmissionMask": writeTexture(material.lightEmissionMask,fileData),
                "displacementMap": "",
                "reflectionMask": writeTexture(material.reflectionMask,fileData),
                "visible": plist.visible,
                "groupName": material.groupName
            });
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
            let buffer = new Buffer(4);
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
            let buffer = new Buffer(4 * arrayBuffer.length);
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
                promises.push(new Promise((resolve) => {
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
        let buffer = new Buffer(4);
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
        //let buffer = new Buffer(4);
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

    function writeNode(fileData) {
       writeHeader(fileData);
       fileData.node.drawable.forEach((plist,mat,trx) => {
           writePolyList(fileData,plist,mat,trx);
       });
       fileData.writeBlock("endf");
       fileData.stream.end();
    }

    class Bg2WritePlugin extends bg.WriteFilePlugin {
        supportFileType(ext) {
            return /bg2/i.test(ext) || /vwglb/i.test(ext);
        }

        writeFile(filePath,data) {
            return new Promise((resolve,reject) => {
                if (!data || !data instanceof bg.scene.Node || !data.drawable) {
                    reject(new Error("Invalid data format. Expecting scene node."));
                }
                let fileData = new FileData(filePath,data);

                try {
                    writeNode(fileData);
                    fileData.writeTextures();
                    resolve(new Error("Not implemented"));
                }
                catch (err) {
                    reject(err);
                }
            })
        }
    }

    bg.Bg2WritePlugin = Bg2WritePlugin;
})