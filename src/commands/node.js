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

    class SetEnabled extends app.Command {
        constructor(node,enabled) {
            super();
            this._node = node;
            this._enabled = enabled;
            this._restoreEnabled = node.enabled;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.enabled = this._enabled;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.enabled = this._restoreEnabled;
                resolve();
            });
        }
    }

    app.nodeCommands.SetEnabled = SetEnabled;

    class SetSteady extends app.Command {
        constructor(node,s) {
            super();
            this._node = node;
            this._steady = s;
            this._restoreSteady = node.steady;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.steady = this._steady;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.steady = this._restoreSteady;
                resolve();
            });
        }
    }

    app.nodeCommands.SetSteady = SetSteady;

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

    class RemoveNode extends app.Command {
        constructor(nodeList) {
            super();
            this._nodeList = [];
            this._restoreParents = [];
            nodeList.forEach((node) => {
                if (node.parent) {
                    this._nodeList.push(node);
                    this._restoreParents.push(node.parent);
                }
            });
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._nodeList.length==0) {
                    reject(new Error("Could not remove nodes: the selected nodes could not be removed"));
                }
                else {
                    this._nodeList.forEach((node) => node.parent.removeChild(node));
                    resolve();
                }
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodeList.forEach((node,index) => {
                    this._restoreParents[index].addChild(node);
                });
                resolve();
            })
        }
    }

    app.nodeCommands.RemoveNode = RemoveNode;

    class CreateNode extends app.Command {
        constructor(node,parent) {
            super();
            this._node = node;
            this._parent = parent;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._parent.addChild(this._node);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._parent.removeChild(this._node);
                resolve();
            });
        }
    }

    app.nodeCommands.CreateNode = CreateNode;

    class RemoveComponent extends app.Command {
        constructor(node,component) {
            super();
            this._node = node;
            this._component = component;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.removeComponent(this._component);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._node.addComponent(this._component);
                resolve();
            });
        }
    }

    app.nodeCommands.RemoveComponent = RemoveComponent;

    class AddComponent extends app.Command {
        constructor(node,component) {
            super();
            this._node = node;
            this._component = component;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._node.addComponent(this._component);
                app.render.Scene.Get().selectionManager.prepareNode(this._node);
                resolve();
            });
        }
        
        undo() {
            return new Promise((resolve,reject) => {
                this._node.removeComponent(this._component);
                resolve();
            });
        }
    }

    app.nodeCommands.AddComponent = AddComponent;
});