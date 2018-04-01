
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
        let libraryPath = path.parse(this.filePath);
        let location = libraryPath.dir;
        this._repoPath = path.join(location,libraryPath.name);

        if (fs.existsSync(this.repoPath) && !fs.statSync(this.repoPath).isDirectory()) {
            throw new Error(`Error creating library at ${location}. The repository path exists, but is a file instead of a directory. `);
        }

        if (!fs.existsSync(this.repoPath)) {
            mkdirp.sync(this.repoPath);
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
                let data = fs.readFileSync(this.filePath, { encoding:'utf8' });
                initializeLibrary.apply(this);
                data = JSON.parse(data);
                this._data.children = data.root;
                buildParents(this._data);
                return true;
            }
            else {
                return false;
            }
        }

        get filePath() { return this._filePath; }
        get repoPath() { return this._repoPath; }

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
                nodeData.materialModifier = {
                    diffuseR:0.9,
                    diffuseG:0.9,
                    diffuseB:0.9,
                    diffuseA:0.9,
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
                break;
            default:
                throw new Error(`Error creating node: invalid node type ${ type }`);
            }

            this.currentNode.children.push(nodeData);
            buildParents(this._data);
            return nodeData;
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