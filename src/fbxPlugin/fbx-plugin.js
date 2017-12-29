app.addDefinitions(() => {
    app.fbxPlugin = app.fbxPlugin || {};

    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");
    
    let commandPath = app.plugins.find("fbx2json");

    if (commandPath && /darwin/i.test(process.platform)) {
        // macOS
        commandPath = path.join(commandPath,"macOS");
        if (fs.existsSync(commandPath)) {
            app.fbxPlugin.available = true;
            app.fbxPlugin.path = path.join(commandPath,"fbx2json");
            app.fbxPlugin.defaultScale = 0.1;
        }
    }
    else if (commandPath && /win/i.test(process.platform)) {
        // Windows
        commandPath = path.join(commandPath,"win64");
        if (fs.existsSync(commandPath)) {
            app.fbxPlugin.available = true;
            app.fbxPlugin.path = path.join(commandPath,"fbx2json.exe");
            app.fbxPlugin.defaultScale = 0.1;
        }
    }

    app.fbxPlugin.loadFbxJson = function(filePath) {
        return new Promise((resolve,reject) => {
            let outTmpPath = path.resolve(path.join(app.paths.temp,"import_fbx.json"));
            exec(`${ app.fbxPlugin.path } "${filePath}" "${outTmpPath}"`, (err,stdout,stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(fs.readFileSync(outTmpPath,"utf-8")));
                    fs.unlinkSync(outTmpPath);
                }
            });
        });
    }

    if (app.fbxPlugin.available) {
        app.addCopyright("Autodesk FBX SDK","https://www.autodesk.com/products/fbx/overview",[
            'This software contains Autodesk® FBX® code developed by Autodesk, Inc. Copyright 2008 Autodesk, Inc. All rights, reserved. Such code is provided "as is" and Autodesk, Inc. disclaims any and all warranties, whether express or implied, including without limitation the implied warranties of merchantability, fitness for a particular purpose or non-infringement of third party rights. In no event shall Autodesk, Inc. be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of such code.'
        ])
    }

    function parseNode(context,fbxNode) {
        // Only import nodes with meshes
        if (!fbxNode.meshData) return null;

        let node = new bg.scene.Node(context,fbxNode.name);
        let matrix = bg.Matrix4.Identity();
        if (fbxNode.transform) {
            matrix = new bg.Matrix4(fbxNode.transform);
        }
        if (fbxNode.meshData) {
            let drw = new bg.scene.Drawable();
            node.addComponent(drw);
     
            fbxNode.meshData.forEach((plistData) => {
                let plist = new bg.base.PolyList(context);
                let scaleRotationMatrix = matrix.rotation;
                for (let i = 0; i<plistData.vertex.length; i+=3) {
                    let newVertex = matrix.multVector(new bg.Vector3(
                        plistData.vertex[0 + i],
                        plistData.vertex[1 + i],
                        plistData.vertex[2 + i]
                    ));
                    let newNormal = scaleRotationMatrix.multVector(new bg.Vector3(
                        plistData.normal[0 + i],
                        plistData.normal[1 + i],
                        plistData.normal[2 + i]
                    ));
                    plistData.vertex[0 + i] = newVertex.x;
                    plistData.vertex[1 + i] = newVertex.y;
                    plistData.vertex[2 + i] = newVertex.z;
                    plistData.normal[0 + i] = newNormal.x;
                    plistData.normal[1 + i] = newNormal.y;
                    plistData.normal[2 + i] = newNormal.z;
                }

                plist.vertex = plistData.vertex || [];
                plist.normal = plistData.normal || [];
                plist.texCoord0 = plistData.texCoord0 || [];
                plist.texCoord1 = plistData.texCoord1 || [];
                plist.texCoord2 = plistData.texCoord2 || [];
                plist.color = plistData.color || [];
                plist.index = plistData.indices || [];
                plist.build();
                drw.addPolyList(plist);
            });
        }
        return node;
    }

    function parseFbxJson(context,data) {
        let node = new bg.scene.Node(context);
        data.forEach((fbxNode) => {
            let childNode = parseNode(context,fbxNode);
            if (childNode) {
                node.addChild(childNode);
            }
        });
        return node;
    }

    class FbxLoaderPlugin extends bg.base.LoaderPlugin {
        acceptType(url,data) {
            let ext = bg.utils.Resource.GetExtension(url);
            return ext=="fbx";
        }

        load(context,url,data) {
            return new Promise((resolve,reject) => {
                if (!app.fbxPlugin.available) {
                    reject(new Error("The FBX import plugin is not available"));
                }
                else {
                    app.fbxPlugin.loadFbxJson(url)
                        .then((fbxJsonData) => {
                            let node = parseFbxJson(context,fbxJsonData);
                            if (node) {
                                resolve(node);
                            }
                            else {
                                reject(new Error("Could not parse FBX JSON data"));
                            }
                        })
                        .catch((err) => {
                            reject(err);
                        })
                }
            })
        }
    }

    app.fbxPlugin.FbxLoaderPlugin = FbxLoaderPlugin;
})