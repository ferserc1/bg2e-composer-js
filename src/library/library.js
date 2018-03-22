
app.addSource(() => {
    let g_currentLibrary = null;

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

    class Library {
        static Current() {
            if (!g_currentLibrary) {
                g_currentLibrary = new Library();
            }
            return g_currentLibrary;
        }

        constructor() {
            this._filePath = "";
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
    }

    app.Library = Library;
});