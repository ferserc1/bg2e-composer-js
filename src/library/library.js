
app.addDefinitions(() => {
    app.library = app.library || {};

    const path = require("path");
    const fs = require("fs");
    const mkdirp = require("mkdirp");

    function initializeLibrary() {
        this._data = {
            id:"$root$",
            name:"root",
            type:"group",
            hidden:false,
            children:[]
        };
        this._currentNode = this._data;
        buildParents(this._data);
    }

    // Generate the "parent" attribute in the node
    // children, if the node is a group
    function buildParents(node) {
        if (node.children) {
            node.children.forEach((child) => {
                child.parent = node;
                buildParents(child);
            });
        }
    }

    // Clear the node "parent" attribute in the node children
    // if the node is a group.
    // Call this function before serialize the data using
    // JSON.stringify to prevent circular references
    function clearParents(node) {
        if (node.children) {
            node.children.forEach((child) => {
                delete child.parent;
                clearParents(child);
            });
        }
    }

    function assertCurrentNodeIntegrity(node=null) {
        node = node || this._currentNode;
        if (this._currentNode.type!=app.library.NodeType.GROUP) {
            throw new Error("Invalid current node in library manager: the current node is not a group");
        }
        else if (!this._currentNode.children) {
            this._currentNode.children = [];
        }
    }

    function findName() {
        let ch = this.currentNode.children;
        let name = "New node";
        let index = 0;
        let buildName = () => { return `${ name } ${ index }`; }

        while(ch.some((child) => child.name==buildName())) ++index;
        return buildName();
    }

    function resolveDuplicatedValues() {
        let ch = this.currentNode.children;

        function haveDuplicatedKey(item,key) {
            let otherNode = null;
            ch.some((other) => {
                if (other!=item && other[key]==item[key]) {
                    otherNode = other;
                    return true;
                }
            });
            return otherNode;
        }

        ch.forEach((item) => {
            let other = null;
            while(other = haveDuplicatedKey(item,'id')) {
                other.id = bg.utils.generateUUID();
            }
            while(other = haveDuplicatedKey(item,'name')) {
                other.name = other.name + " copy";
            }
        })
    }

    function initializePath() {
        try {
            let libraryPath = path.parse(this.filePath);
            let location = libraryPath.dir;
            this._repoFolderName = libraryPath.name;
            this._repoPath = path.join(location,libraryPath.name);
    
            if (fs.existsSync(this.repoPath) && !fs.statSync(this.repoPath).isDirectory()) {
                fs.unlinkSync(this.repoPath);
            }
    
            if (!fs.existsSync(this.repoPath)) {
                mkdirp.sync(this.repoPath);
            }
        }
        catch (err) {
            // In Windows 10, with OneDrive enabled, the fs.exystsSync returns false, but the directory exists
            if (err.code!='EEXIST') {
                throw(err);
            }
        }
    }

    function cleanupNode(node) {
        delete node.selected;
        if (node.children) {
            node.children.forEach((child) => cleanupNode(child));
        }
    }

    function addPhongMaterialNode(nodeData) {
        nodeData.materialModifier = {
            class: "Material",

            diffuseR:0.9,
            diffuseG:0.9,
            diffuseB:0.9,
            diffuseA:1.0,
            specularR:1,
            specularG:1,
            specularB:1,
            specularA:1,

            shininess:0,
            shininessMask:"",
            shininessMaskChannel:0,
            invertShininessMask:false,

            alphaCutoff:0.5,

            lightEmission:0,
            lightEmissionMask:"",
            lightEmissionMaskChannel:0,
            invertLightEmissionMask:false,
            
            refractionAmount:0,
            reflectionAmount:0,
            
            texture:"",
            textureOffsetX:0,
            textureOffsetY:0,
            textureScaleX:1,
            textureScaleY:1,

            // The lightmap is defined for each object, so it is not a good idea to
            // modify it in almost any case. For that reason, the material modifiers
            // should not include the lightmap parameters
            // lightmap:"",
            // lightmapOffsetX:0,
            // lightmapOffsetY:0,
            // lightmapScaleX:1,
            // lightmapScaleY:1,

            normalMap:"",
            normalMapOffsetX:0,
            normalMapOffsetY:0,
            normalMapScaleX:1,
            normalMapScaleY:1,
            
            castShadows:true,
            receiveShadows:true,

            reflectionMask:0,
            reflectionMaskChannel:"",
            invertReflectionMask:0,
            reflectionMaskInvert:false,

            roughness:0,
            roughnessMask:"",
            roughnessMaskChannel:0,
            invertRoughnessMask:false,

            unlit:false,
        }
    }

    function addPBRMaterialNode(nodeData) {
        nodeData.materialModifier = {
            class: "PBRMaterial",
            diffuse: [1,1,1,1],
            isTransparent: false,
            alphaCutoff: 0.5,
            diffuseScale: [1,1],
            metallic: 0,
            metallicChannel: 0,
            metallicScale: [1,1],
            roughness: 0.92,
            roughnessChannel: 0,
            roughnessScale: [1,1],
            lightEmission: 0,
            lightEmissionChannel: 0,
            lightEmissionScale: [1,1],
            height: 0,
            heightChannel: 0,
            heightScale: [1,1],
            heightIntensity: 1,
            normal: [0.5,0.5,1,1],
            normalScale: [1,1],
            castShadows: true,
            cullFace: true,
            unlit: false
        }
    }

    function addMaterialNode(nodeData) {
        if (app.ComposerWindowController.Get().renderModel==app.RenderModel.PBR) {
            addPBRMaterialNode.apply(this,[nodeData]);
        }
        else {
            addPhongMaterialNode.apply(this,[nodeData]);
        }
    }

    app.library.NodeType = {
        GROUP: "group",
        MODEL: "model",
        MATERIAL: "material"
    };

    class Library {
        constructor(filePath) {
            if (!filePath) {
                throw new Error("Invalid library path specified creating library");
            }
            this._filePath = filePath;
            
            initializeLibrary.apply(this);
            if (!this.reload()) {
                this.save();
            }

            this._selection = [];
            this._clipboard = [];
            this._selectionObservers = [];
        }

        save() {
            initializePath.apply(this);

            let libraryData = {
                fileType: "vwgl::library",
                version: "1.1",
                root: []
            }

            this.root.children.forEach((item) => {
                libraryData.root.push(item);
            })

            clearParents(this._data);
            fs.writeFileSync(this.filePath, JSON.stringify(libraryData,"","  "), { encoding: 'utf8' });
            buildParents(this._data);
        }

        reload() {
            if (fs.existsSync(this.filePath)) {
                initializePath.apply(this);
                let data = fs.readFileSync(this.filePath, { encoding:'utf8' });
                initializeLibrary.apply(this);
                data = JSON.parse(data);
                this._data.children = data.root;
                cleanupNode(this._data);
                buildParents(this._data);
                return true;
            }
            else {
                return false;
            }
        }

        get filePath() { return this._filePath; }
        get repoPath() { return this._repoPath; }
        get repoFolderName() { return this._repoFolderName; }
        getResourceAbsolutePath(resourcePath) {
            return resourcePath ? path.join(this.repoPath,resourcePath) : "";
        }

        // Get the relative path of a resource included in the repository. If the
        // resource is outside the repository path, it is copied first, and in this
        // case, it is placed inside copySubpath subfolder
        getResourceLocalPath(absolutePath,copySubpath="") {
            let reString = this.repoPath.replace(/[\/\\]/g,'[\\\\\\/]');
            reString += '[\\\\\\/]{0,1}(.*)';
            let re = new RegExp('^' + reString,'i');
            if (!re.test(absolutePath)) {
                // Copy resource to library repository path
                let parsedPath = path.parse(absolutePath);
                let dstPath = path.join(this.repoPath,copySubpath);
                let dstFile = path.join(dstPath,parsedPath.base);

                if (fs.existsSync(dstPath) && !fs.statSync(dstPath).isDirectory()) {
                    fs.unlinkSync(dstPath);
                }
                if (!fs.existsSync(dstPath)) {
                    mkdirp(dstPath);
                }
                bg.base.Writer.CopyFile(absolutePath,dstFile);
                absolutePath = dstFile;
            }
            let execResult = re.exec(absolutePath);
            if (execResult) {
                return execResult[1];
            }
            else {
                return "";
            }
        }

        get root() { return this._data; }

        get currentNode() { return this._currentNode; }
        set currentNode(node) {
            assertCurrentNodeIntegrity.apply(this);
            assertCurrentNodeIntegrity.apply(this,[node]);
            if (this.contains(node) && node.type=="group") {
                this._currentNode = node;
            }
        }

        get navigator() {
            let result = [];

            function addNavigatorItem(item) {
                if (item.parent) {
                    addNavigatorItem(item.parent);
                }
                result.push(item);
            }

            addNavigatorItem(this.currentNode);

            return result;
        }

        get selection() { return this._selection; }

        // Returns a copy of the selection array. Use this function if you want to iterate
        // and, at the same time, modify the selection array
        get selectionCopy() {
            let result = [];
            this.selection.forEach((item) => result.push(item));
            return result;
        }

        selectNode(node) {
            if (this._selection.indexOf(node)==-1) {
                this._selection.push(node);
            }
            node.selected = true;
            this.notifySelectionChanged();
        }

        deselectNode(node) {
            let index = this._selection.indexOf(node);
            if (index!=-1) {
                this._selection.splice(index,1);
            }
            node.selected = false;
            this.notifySelectionChanged();
        }

        toggleSelect(node) {
            node.selected ? this.deselectNode(node) : this.selectNode(node);
            this.notifySelectionChanged();
        }

        deselectAll() {
            this._selection.forEach((node) => {
                node.selected = false;
            });
            this._selection = [];
            this.notifySelectionChanged();
        }

        selectionChanged(observerId,cb) {
            this._selectionObservers[observerId] = cb;
        }

        notifySelectionChanged() {
            for (let key in this._selectionObservers) {
                this._selectionObservers[key](this._selection);
            }
        }

        copySelection() {
            assertCurrentNodeIntegrity.apply(this);
            if (this.selection.length) {
                clearParents(this._data);
                this._clipboard = [];
                this.selection.forEach((item) => {
                    let itemCopy = JSON.parse(JSON.stringify(item));
                    itemCopy.selected = false;
                    this._clipboard.push(itemCopy);
                })
                buildParents(this._data);
                this.deselectAll();
            }
        }

        cutSelection() {
            assertCurrentNodeIntegrity.apply(this);
            if (this.selection.length) {
                this._clipboard = [];
                let items = [];
                this.selection.forEach((item) => {
                    let parent = item.parent;
                    let index = parent ? parent.children.indexOf(item) : -1;
                    if (index!=-1) {
                        items.push({
                            parent: parent,
                            index: index,
                            item: item
                        });
                    }
                });
                clearParents(this._data);
                items.forEach((itemData) => {
                    itemData.parent.children.splice(itemData.index,1);
                    let itemCopy = JSON.parse(JSON.stringify(itemData.item));
                    itemCopy.selected = false;
                    this._clipboard.push(itemCopy);
                });
                buildParents(this._data);
                this.deselectAll();
            }
        }

        paste() {
            this.deselectAll();
            assertCurrentNodeIntegrity.apply(this);
            if (this._clipboard.length) {
                clearParents(this._data);
                this._clipboard.forEach((item) => {
                    this.currentNode.children.push(JSON.parse(JSON.stringify(item)));
                });
                buildParents(this._data);
            }
        }

        get clipboardContent() {
            return this._clipboard;
        }

        clearClipboard() {
            this._clipboard = [];
        }

        addModel(node,modelFile) {
            return new Promise((resolve,reject) => {
                if (!node) {
                    reject(new Error("Invalid node."));
                }
                else if (node.type!="model") {
                    reject(new Error("The model must be of type 'model'"));
                }

                let gl = app.ComposerWindowController.Get().gl;
                bg.base.Loader.Load(gl,modelFile)
                    .then((sceneNode) => {
                        let modelParsedPath = path.parse(modelFile);
                        let modelDataPath = path.join(this.repoPath,modelParsedPath.name);

                        let resources = [modelFile];
                        let promises = [];
                        sceneNode.drawable.getExternalResources(resources);

                        if (!fs.existsSync(modelDataPath)) {
                            mkdirp.sync(modelDataPath);
                        }
                        resources.forEach((res) => {
                            let dstPathParsed = path.parse(res);
                            let dstFile = path.join(modelDataPath,dstPathParsed.base);
                            promises.push(bg.base.Writer.CopyFile(res,dstFile));
                        });

                        sceneNode.drawable.destroy();

                        node.file = `${ modelParsedPath.name }/${ modelParsedPath.base }`;
                        node.folderName = modelParsedPath.name;

                        let inChain = node.component("bg.scene.InputChainJoint");
                        let outChain = node.component("bg.scene.OutputChainJoint");
                        node.metadata = node.metadata || {};
                        if (inChain && outChain) {
                            node.metadata.dock = "left,right";
                        }
                        else if (inChain) {
                            node.metadata.dock = "left";
                        }
                        else if (outChain) {
                            node.metadata.dock = "right";
                        }
                        else {
                            node.metadata.dock = "none";
                        }
                        
                        Promise.all(promises).then(() => {
                            resolve();
                        }).catch((err) => reject(err));
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        }

        addNode(type=app.library.NodeType.GROUP) {
            assertCurrentNodeIntegrity.apply(this);
            this.deselectAll();

            let nodeData = {
                type:type,
                id:bg.utils.generateUUID(),
                name:findName.apply(this),
                icon:"",
                metadata:{}
            };

            switch (type) {
            case app.library.NodeType.GROUP:
                nodeData.children = [];
                break;
            case app.library.NodeType.MODEL:
                nodeData.file = "",
                nodeData.folderName = "";
                break;
            case app.library.NodeType.MATERIAL:
                addMaterialNode.apply(this,[nodeData]);
                break;
            default:
                throw new Error(`Error creating node: invalid node type ${ type }`);
            }

            this.currentNode.children.push(nodeData);
            buildParents(this._data);
            return nodeData;
        }

        addMaterialFromSelection() {
            assertCurrentNodeIntegrity.apply(this);
            this.deselectAll();
            return new Promise((resolve,reject) => {
                let sel = app.render.Scene.Get().selectionManager.selection;
                let materials = [];
                let i = 0;
                sel.forEach((item) => {
                    if (item.material) {
                        let name = (item.plist && item.plist.name) || "material-" + ++i;
                        materials.push({
                            name:name,
                            material:item.material
                        });
                    }
                })
     
                if (materials.length>0) {
                    function fixPath(modifierData,field) {
                        if (modifierData[field] && typeof(modifierData[field])=="string" && modifierData[field]!="") {
                            modifierData[field] = path.parse(modifierData[field]).base;
                        }
                    }
                    function fixPaths(modifierData,fields) {
                        fields.forEach((field) => fixPath(modifierData,field));
                    }
                    let resources = [];
                    let promises = [];
                    let mask = ~bg.base.MaterialFlag.LIGHT_MAP; // All settings except lightmap
                    materials.forEach((matData) => {
                        let textureFields = [];
                        matData.material.getExternalResources(resources);
                        if (matData.material instanceof bg.base.Material) {
                            mask = ~bg.base.MaterialFlag.LIGHT_MAP; // All settings except lightmap
                            textureFields = [
                                "shininessMask",
                                "lightEmissionMask",
                                "texture",
                                "normalMap",
                                "reflectionMask",
                                "roughnessMask"
                            ];
                        }
                        else if (matData.material instanceof bg.base.PBRMaterial) {
                            mask = ~0;
                            textureFields = [
                                "diffuse",
                                "normal",
                                "metallic",
                                "roughness",
                                "height",
                                "fresnel",
                                "lightEmission"
                            ];
                        }
                        let mod = matData.material.getModifierWithMask(mask);
                        let matNode = this.addNode(app.library.NodeType.MATERIAL);
                        matNode.name = matData.name;
                        matNode.materialModifier = mod.serialize();
                        fixPaths(matNode.materialModifier,textureFields);
                    });

                    resources.forEach((resource) => {
                        let target = path.join(this.repoPath,path.parse(resource).base);
                        promises.push(bg.base.Writer.CopyFile(resource,target));
                    });

                    Promise.all(promises)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                }
                else {
                    reject(new Error("No selected materials in the scene"));
                }
            })
        }

        addModelFromSceneNodes(nodes) {
            return new Promise((resolve,reject) => {
                let promises = [];
                assertCurrentNodeIntegrity.apply(this);
                this.deselectAll();
    
                const path = require("path");
                const mkdirp = require("mkdirp");
                let getName = (node) => { return (node.drawable.name || node.name || "").replace(/\s+/,"_") };
                let gl = app.ComposerWindowController.Get().gl;
    
                nodes.forEach((node,i1) => {
                    if (getName(node)=="") {
                        node.drawable.name = bg.utils.generateUUID();
                    }
                    else {
                        nodes.forEach((node2,i2) => {
                            if (getName(node)==getName(node2) && i1!=i2) {
                                node2.drawable.name = bg.utils.generateUUID();
                            }
                        });
                    }
                });
    
                let folderPath = this.repoPath;
                if (folderPath) {
                    nodes.forEach((node) => {
                        let folderName = getName(node);
                        let filePath = path.join(folderPath,folderName);
                        mkdirp(filePath);
                        filePath = app.standarizePath(path.join(filePath,`${folderName}.bg2`));
                        let cmd = new app.fileCommands.ExportObject(gl,filePath,node);
                        promises.push(app.CommandManager.Get().doCommand(cmd));
                    });

                    Promise.all(promises)
                        .then(() => {
                            nodes.forEach((sceneNode) => {
                                let drawable = sceneNode.drawable;
                                let libNode = {
                                    type: 'model',
                                    id: drawable.name,
                                    name: drawable.name,
                                    file: drawable.name + "/" + drawable.name + ".bg2",
                                    folderName: drawable.name,
                                    metadata: {}
                                }
                                let inChain = sceneNode.component("bg.scene.InputChainJoint");
                                let outChain = sceneNode.component("bg.scene.OutputChainJoint");
                                if (inChain && outChain) {
                                    libNode.metadata.dock = "left,right";
                                }
                                else if (inChain) {
                                    libNode.metadata.dock = "left";
                                }
                                else if (outChain) {
                                    libNode.metadata.dock = "right";
                                }
                                else {
                                    libNode.metadata.dock = "none";
                                }
                                this.currentNode.children.push(libNode);
                            })
                            resolve(nodes);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                }
            })
        }

        removeNode(node,forceDelete=false) {
            assertCurrentNodeIntegrity.apply(this);
            this.deselectAll();
            let index = this.currentNode.children.indexOf(node);
            if (index!=-1 && (node.type!=app.library.NodeType.GROUP || node.children.length==0 || forceDelete)) {
                this.currentNode.children.splice(index,1);
                return true;
            }
            else if (index!=-1) {
                console.warn("Could not delete a group node if it is not empty");
                return false;
            }
            else {
                console.warn(`No such node: { id:"${ node.id }", name:"${ node.name }" }`);
                return true;
            }
        }

        // Move "node" to the position previous to "nextNode"
        moveNode(node,nextNode) {
            if (this.contains(node) && this.contains(nextNode)) {
                let toIndex = nextNode.parent.children.indexOf(nextNode);
                let fromIndex = node.parent.children.indexOf(node);
                node.parent.children.splice(fromIndex,1);
                nextNode.parent.children.splice(toIndex,0,node);
                buildParents(this._data);
            }
        }

        convertToPBR(node) {
            function convertModifierData(phong) {
                let result = {
                    class: "PBRMaterial"
                };
        
                let scalar = (v,d) => v!==undefined ? v : d;
        
                if (phong.texture != "") {
                    result.diffuse = phong.texture;
                }
                else {
                    result.diffuse = [
                        scalar(phong.diffuseR, 1),
                        scalar(phong.diffuseG, 1),
                        scalar(phong.diffuseB, 1),
                        scalar(phong.diffuseA, 1)
                    ];
                }
                if (phong.normalMap) {
                    result.normal = phong.normalMap;
                }
                else {
                    result.normal = [0.5,0.5,1,1];
                }
                result.diffuseScale = [
                    scalar(phong.textureScaleX, 1),
                    scalar(phong.textureScaleY, 1),
                ];
                result.normalScale = [
                    scalar(phong.normalMapScaleX, 1),
                    scalar(phong.normalMapScaleY, 1),
                ];
                if (phong.shininess == 0) {
                    result.roughness = 1;
                }
                else if (phong.shininess>=1 && phong.shininess<50) {
                    result.roughness = 0.9;
                }
                else {
                    result.roughness = 0.8;
                }
                result.metallic = scalar(phong.reflectionAmount,0);
        
                return result;
            }

            if (node.type=="material" &&
                node.materialModifier &&
                node.materialModifier.type!="pbr" &&
                node.materialModifier["class"]!="PBRMaterial")
            {
                node.materialModifier = convertModifierData(node.materialModifier);
                return true;
            }
            return false;
        }

        // TODO: manipulation functions: add, delete and sort nodes
        // TODO: Remember to clear the selection when the library structure change

        contains(node,parent=null) {
            let result = false;
            if (node==this._data) {
                result = true;
            }
            else if (!parent) {
                result = this.contains(node,this.root);
            }
            else if (parent.children && parent.children.indexOf(node)!=-1) {
                result = true;
            }
            else if (parent.children) {
                parent.children.some((child) => {
                    result = this.contains(node,child);
                    return result;
                });
            }
            return result;
        }

        clear() {
            initializeLibrary.apply(this);
        }

        deserialize(libraryData) {
            if (typeof(libraryData)=="string") {
                libraryData = JSON.parse(libraryData);
            }
            if (libraryData.type!="vwgl::library" || Array.isArray(libraryData.root)) {
                throw new Error("Malformed library");
            }
            this._data.children = libraryData.root;
            this._currentNode = this._data;
            buildParents(this._data);
        }

        serialize(tabulate = false) {
            clearParents(this._data);
            let result = tabulate ? JSON.stringify(this._data,"","\t") : JSON.stringify(this._data);
            buildParents(this._data);
            return result;
        }

        clearParents() {
            clearParents(this._data);
        }

        buildParents() {
            buildParents(this._data);
        }
    }

    app.library.Library = Library;
});