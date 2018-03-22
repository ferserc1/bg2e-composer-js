
app.addDefinitions(() => {
    app.library = app.library || {};

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

    function initializeLibrary() {
        this._data = {
            id:"$root$",
            name:"$root$",
            type:"group",
            children:[
                {
                    type:"group",
                    id:"untitled_node",
                    name:"Untitled",
                    icon:"",
                    children:[]
                }
            ]
        };
        this._currentNode = this._data;
        buildParents(this._data);
    }

    class Library {
        constructor() {
            this._filePath = "";
            initializeLibrary.apply(this);
        }

        get filePath() { return this._filePath; }

        get root() { return this._data; }

        get currentNode() { return this._currentNode; }
        set currentNode(node) {
            if (this.contains(node)) {
                this._currentNode = node;
            }
        }

        // TODO: manipulation functions: add, delete and sort nodes

        contains(node,parent=null) {
            let result = false;
            if (!parent) {
                result = this.contains(node,this.root);
            }
            else if (parent.children.indexOf(node)!=-1) {
                result = true;
            }
            else {
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
    }

    app.library.Library = Library;
});