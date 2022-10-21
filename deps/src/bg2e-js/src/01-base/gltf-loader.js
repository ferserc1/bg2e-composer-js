(function() {

    let ComponentTypes = {
        BYTE: 5120,
        UNSIGNED_BYTE: 5121,
        SHORT: 5122,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126,
        INT: 0,

        GetLength: function(accessor) {
            switch (accessor.type) {
                case "SCALAR":
                    return 1;
                case "VEC2":
                    return 2;
                case "VEC3":
                    return 3;
                case "VEC4":
                    return 4;
                case "MAT3":
                    return 9;
                case "MAT4":
                    return 16;
                default:
                    return 0;
            }
        }
    };

    function createArray(accessor,buffer,view) {
        let ArrayType = null;
        switch (accessor.componentType) {
        case ComponentTypes.BYTE:
            ArrayType = Int8Array;
            break;
        case ComponentTypes.UNSIGNED_BYTE:
            ArrayType = Uint8Array;
            break;
        case ComponentTypes.SHORT:
            ArrayType = Int18Array;
            break;
        case ComponentTypes.UNSIGNED_SHORT:
            ArrayType = Uint16Array;
            break;
        case ComponentTypes.UNSIGNED_INT:
            ArrayType = UInt32Array;
            break;
        case ComponentTypes.FLOAT:
            ArrayType = Float32Array;
            break;
        default:
            ArrayType = Int32Array;
            break;
        }
        let length = accessor.count * ComponentTypes.GetLength(accessor);
        return new ArrayType(buffer, view.byteOffset, length);
    }

    function loadBufferViews(jsonData,buffers) {
        let views = jsonData.bufferViews;
        let accessors = jsonData.accessors;

        if (!accessors || !views) {
            return Promise.reject(new Error("Malformed or incompatible glTF file."));
        }

        return new Promise((resolve,reject) => {
            let bufferViews = [];
            if (accessors.every((accessor) => {
                let view = accessor.bufferView<views.length ? views[accessor.bufferView] : null;
                let buffer = view && view.buffer<buffers.length ? buffers[view.buffer] : null;
                if (view && buffer) {
                    let b = createArray(accessor, buffer, view);

                    bufferViews.push({
                        buffer: b,
                        accessor: accessor,
                        view: view
                    });

                    return true;
                }
                else {
                    reject(new Error("Malformed glTF file."));
                    return false;
                }
            })) {
                resolve(bufferViews);
            }

        });
    }

    function isBase64(data) {
        return typeof(data) == "string" && /base64/.test(data.substring(0,100));
    }

    function getValidUri(basePath,uri) {
        if (!isBase64(uri)) {
            uri = bg.utils.path.join(basePath,uri);
        }
        return uri;
    }

    function loadTextures(context,jsonData,url) {
        let basePath = bg.utils.path.removeFileName(url);
        return new Promise((resolve,reject) => {
            if (!jsonData.images) {
                resolve([]);
            }
            else {
                let promises = [];

                jsonData.images.forEach((image) => {
                    promises.push(new Promise((innerResolve,innerReject) => {
                        if (isBase64(image.uri)) {
                            let tex = bg.base.Texture.FromBase64Image(context,image.uri);
                            tex.promise.then((texture) => {
                                innerResolve(texture);
                            });
                        }
                        else {
                            let validUri = getValidUri(basePath,image.uri);
                            bg.base.Loader.Load(context,validUri)
                                .then((texture) => {
                                    innerResolve(texture);
                                })

                                .catch((err) => innerReject(err));
                        }
                    }));
                });

                Promise.all(promises)
                    .then((images) => {
                        resolve(images);
                    })
                    .catch((err) => {
                        reject(err);
                    })
            }
        });
    }

    function loadMaterial(materialData,textures) {
        return new Promise((resolve,reject) => {
            let mat = new bg.base.PBRMaterial();
            // TODO: load materials

            resolve(mat);
        });
    }

    function loadMaterials(context,jsonData,textures) {
        return new Promise((resolve,reject) => {
            if (!jsonData.materials) {
                resolve([]);
            }
            else {
                let promises = [];
                jsonData.materials.forEach((matData) => {
                    promises.push(loadMaterial(matData,textures));
                });
                Promise.all(promises).then((materials) => {
                    resolve(materials);
                });
            }
        });
    }

    function loadBuffers(jsonData,url) {
        let basePath = bg.utils.path.removeFileName(url);
        return new Promise((resolve,reject) => {
            let promises = [];
            if (jsonData.buffers && jsonData.buffers.forEach) {
                jsonData.buffers.forEach((buffer) => {
                    let uri = getValidUri(basePath,buffer.uri);
                    promises.push(new Promise((innerResolve,innerReject) => {
                        fetch(uri)
                            .then((res) => {
                                if (res.status==200) {
                                    innerResolve(res.arrayBuffer());
                                }
                                else if(res.status>=300 && res.status<400) {
                                    innerReject(new Error("The resource has changed location: " + uri));
                                }
                                else if (res.status>=400 && res.status<500) {
                                    innerReject(new Error("The resource does not exist or is inaccessible "));
                                }
                                else {
                                    innerReject(new Error("Server error loading resource " + uri));
                                }
                            })
                            
                            .catch((err) => {
                                innerReject(err);
                            });
                    }));
                });
            }
            
            Promise.all(promises)
                .then((bufferData) => {
                    resolve(bufferData);
                });
        });
    }

    function loadPrimitive(primitive,bufferViews,views) {
        function buffer(index) {
            if (index!==undefined && index!==null) {
                return bufferViews[index];
            }
            else {
                return null;
            }
        }
        primitive.attributes = primitive.attributes || {};
        let result = {};
        result.vertex = buffer(primitive.attributes.POSITION);
        result.normal = buffer(primitive.attributes.NORMAL);
        result.texCoord0 = buffer(primitive.attributes.TEXCOORD_0);
        result.texCoord1 = buffer(primitive.attributes.TEXCOORD_1);
        result.tangent = buffer(primitive.attributes.TANGENT);
        result.index = buffer(primitive.indices);
        result.material = primitive.material;
        return result;
    }
    function loadMesh(mesh, bufferViews, views) {
        let result = {
            name: mesh.name || "",
            primitives: []
        };

        (mesh.primitives || []).forEach((primitive,index) => {
            let p = loadPrimitive(primitive, bufferViews, views);
            p.name = result.name + "_" + index;
            result.primitives.push(p);
        });
        
        return result;
    }

    function loadMeshes(jsonData,bufferViews,buffers) {
        return new Promise((resolve,reject) => {
            let result = [];
            jsonData.meshes && jsonData.meshes.forEach((mesh) => {
                result.push(loadMesh(mesh,bufferViews,buffers));
            });
            resolve(result);
        });
    }

    function loadNode(node,nodeList,meshes) {
        let result = {};
        result.name = node.name;
        if (node.children) {
            result.children = [];
            node.children.forEach((childNodeIndex) => {
                if (childNodeIndex<nodeList.length) {
                    let child = loadNode(nodeList[childNodeIndex],nodeList,meshes);
                    result.children.push(child);
                }
                else {
                    console.warn("Node index out of bounds loading glTF file.")
                }
            });
        }
        if (node.mesh!==undefined && node.mesh!==null) {
            if (node.mesh<meshes.length) {
                result.mesh = meshes[node.mesh];
            }
            else {
                console.warn("Mesh index out of bounds loading glTF file.");
            }
        }

        if (node.matrix) {
            result.transform = new bg.Matrix4(node.matrix);
        }
        else if (node.translation || node.rotation || node.scale) {
            let matrix = bg.Matrix4.Identity();
            if (node.translation) {
                matrix.translate(...node.translation);
            }
            if (node.rotation) {
                let rotation = new bg.Quaternion(...node.rotation);
                matrix.mult(rotation.getMatrix4());
            }
            if (node.scale) {
                matrix.scale(...node.scale);
            }
            result.transform = matrix;
        }
        return result;
    }

    function loadScenes(jsonData,meshes) {
        return new Promise((resolve,reject) => {
            let scenes = jsonData.scenes;
            let nodes = jsonData.nodes;
            if (!nodes || nodes.length==0) {
                nodes = [];
                meshes.forEach((m,i) => {
                    nodes.push({
                        mesh: i,
                        name: mesh.name
                    });
                });
            }
            if (!scenes || scenes.length==0) {
                scenes = [];
                scenes.push({
                    name: "SceneRoot",
                    nodes: []
                });
                nodes.forEach((n,i) => scenes.nodes.push(i));
            }
            else {
                // Merge all scenes into one
                let mergedScene = {
                    name: "SceneRoot",
                    nodes: []
                };
                scenes.forEach((s) => {
                    s.nodes.forEach((n) => {
                        if (mergedScene.nodes.indexOf(n)==-1) {
                            mergedScene.nodes.push(n);
                        }
                    });
                });
                scenes = [mergedScene];
            }

            // Scene contains an unique scene with all the scenes merged, or
            // a list of all the nodes, or a list of all the meshes
            let scene = scenes[0];

            // Unify the scene format so that it is the same as a node
            let rootNode = {
                children: scene.nodes,
                name: scene.name
            }
            resolve(loadNode(rootNode,nodes,meshes));
        });
    }

    function parseData(context,data,url) {
        let parsedDataObject = {};
        return new Promise((resolve,reject) => {
            let jsonData = null;
            try {
                jsonData = JSON.parse(data);
            }
            catch(e) {
                reject(e);
            }
            
            loadTextures(context,jsonData,url)
                .then((textures) => {
                    parsedDataObject.textures = textures;
                    return loadMaterials(context,jsonData,textures);
                })

                .then((materials) => {
                    parsedDataObject.materials = materials;
                    return loadBuffers(jsonData,url);
                })

                .then((buffers) => {
                    parsedDataObject.buffers = buffers;
                    return loadBufferViews(jsonData,buffers);
                })

                .then((bufferViews) => {
                    parsedDataObject.bufferViews = bufferViews;
                    return loadMeshes(jsonData,bufferViews,parsedDataObject.buffers);
                })

                .then((meshes) => {
                    parsedDataObject.meshes = meshes;
                    return loadScenes(jsonData, parsedDataObject.meshes);
                })

                .then((sceneRoot) => {
                    parsedDataObject.sceneRoot = sceneRoot;

                    // TODO: Load materials and textures
                    resolve(parsedDataObject);
                })

                .catch((err) => {
                    reject(err);
                });
        });
    }

    function getNode(context,nodeData,url,promises) {
        let result = new bg.scene.Node(context, nodeData.name || "");

        if (nodeData.children) {
            nodeData.children.forEach((childData) => {
                result.addChild(getNode(context,childData,url,promises));
            });
        }

        if (nodeData.mesh) {
            // name
            // primitives: Array
            //   each array component: { buffer, accessor, view }   -> the buffer can be used directly in polyList
            //      vertex      
            //      normal
            //      texCoord0
            //      texCoord1
            //      tangent
            //      index
            //      name
            // TODO: material
            let drawable = new bg.scene.Drawable(nodeData.mesh.name || "");
            nodeData.mesh.primitives.forEach((primitiveData) => {
                let plist = new bg.base.PolyList(context);
                plist.name = name;
                
                plist.vertex = primitiveData.vertex.buffer;
                plist.normal = primitiveData.normal.buffer;
                plist.texCoord0 = primitiveData.texCoord0.buffer;
                plist.texCoord1 = primitiveData.texCoord1.buffer;
                if (primitiveData.tangent) {
                    plist.tangent = primitiveData.tangent.buffer;
                }
                plist.index = primitiveData.index.buffer;

                plist.build();

                // TODO: materials
                drawable.addPolyList(plist);
            });
            result.addComponent(drawable);
        }

        if (nodeData.transform) {
            let transform = new bg.scene.Transform(nodeData.transform);
            result.addComponent(transform);
        }

        return result;
    }

    function createScene(context, sceneData, url) {
        return new Promise((resolve,reject) => {
            let promises = [];
            let sceneRoot = getNode(context,sceneData,url,promises);

            Promise.all(promises)
                .then(() => resolve(sceneRoot))
                .catch((err) => reject(err));
        });
    }

    class GLTFLoaderPlugin extends bg.base.LoaderPlugin {
        acceptType(url,data) {
            let ext = bg.utils.Resource.GetExtension(url);
            return ext=="gltf";
        }

        load(context,url,data) {
            return new Promise((resolve,reject) => {
                parseData(context,data,url)
                    .then((parsedDataObject) => {
                        return createScene(context,parsedDataObject.sceneRoot,url);
                    })

                    .then((sceneRoot) => {
                        resolve(sceneRoot);
                    })

                    .catch((err) => {
                        reject(err);
                    });
            });
        }
    };

    bg.base.GLTFLoaderPlugin = GLTFLoaderPlugin;
})();