app.addSource(() => {
    app.nodeCommands = {};

    class SetName extends app.Command {
        constructor(node,name) {
            super();
            this._node = node;
            this._name = name;
            this._restoreName = node.name;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.name = this._name;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.name = this._restoreName;
                resolve();
            });
        }
    }

    app.nodeCommands.SetName = SetName;

    function checkValidParents(newParent,node) {
        // The node shouldn't be an ancestor of the newParent node or the same node
        if (newParent.parent==null) {
            return true;
        }
        else if (newParent.parent==node || newParent==node) {
            return false;
        }
        else {
            return checkValidParents(newParent.parent,node);
        }
    }

    class SetParent extends app.Command {
        constructor(newParent,nodeList) {
            super();
            this._newParent = newParent;
            this._nodeList = nodeList;
            this._restoreParents = [];
            nodeList.forEach((node) => {
                this._restoreParents.push(node.parent);
            });
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._nodeList.every((node) => {
                    return checkValidParents(this._newParent,node);
                })) {
                    reject(new Error("Invalid parent assignment: some specified nodes are ancestor of the new parent node."));
                }
                else {
                    this._nodeList.forEach((node) => {
                        this._newParent.addChild(node);
                    });
                    resolve();
                }
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodeList.forEach((node,index) => {
                    let restoreParent = this._restoreParents[index];
                    restoreParent.addChild(node);
                });
                resolve();
            });
        }
    }

    app.nodeCommands.SetParent = SetParent;
});