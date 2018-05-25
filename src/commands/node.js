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

    class Group extends app.Command {
        constructor(nodeList) {
            super();
            this._newParent = nodeList.length && nodeList[0].parent;
            this._nodeList = nodeList;
            this._prevParents = [];
            this._nodeList.forEach((node) => {
                this._prevParents.push(node.parent);
            });
            this._newNode = new bg.scene.Node(app.ComposerWindowController.Get().gl,"Group");
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._nodeList.length<2) {
                    reject(new Error("Could not group a single element"));
                }
                else if (this._nodeList.some((node) => node.parent==null)) {
                    reject(new Error("Could not group items: the node " + node.name + " is not in the scene"));
                }
                else {
                    app.render.Scene.Get().selectionManager.prepareNode(this._newNode);
                    this._nodeList.forEach((node) => {
                        this._newNode.addChild(node);
                    })
                    this._newParent.addChild(this._newNode);
                    resolve();
                }
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._nodeList.forEach((node,index) => {
                    this._prevParents[index].addChild(node);
                });
                this._newParent.removeChild(this._newNode);
                resolve();
            })
        }
    }

    app.nodeCommands.Group = Group;

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

                let addComponent = (n) => {
                    n.addComponent(this._component.clone(n.context));
                    app.render.Scene.Get().selectionManager.prepareNode(n);
                }

                if (Array.isArray(this._node)) {
                    this._node.forEach((n) => {
                        addComponent(n);
                    });
                }
                else {
                    addComponent(this._node);
                }
                resolve();
            });
        }
        
        undo() {
            return new Promise((resolve,reject) => {
                let removeComponent = (n) => {
                    let c = n.component(this._component.typeId);
                    n.removeComponent(c);
                }
                if (Array.isArray(this._node)) {
                    this._node.forEach((n) => {
                        removeComponent(n);
                    });
                }
                else {
                    removeComponent(this._node);
                }
                resolve();
            });
        }
    }

    app.nodeCommands.AddComponent = AddComponent;

    class DuplicateNode extends app.Command {
        constructor(nodes) {
            super();
            this._nodes = nodes;
            this._duplicatedNodes = [];
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._nodes.some((node) => node.parent==null)) {
                    reject(new Error("You can't duplicate the root node"));
                    return;
                }

                this._nodes.forEach((node) => {
                    let parent = node.parent;
                    let newNode = node.cloneComponents();
                    this._duplicatedNodes.push(newNode);
                    newNode.removeComponent("bg.manipulation.Gizmo");
                    parent.addChild(newNode);
                    app.render.Scene.Get().selectionManager.prepareNode(newNode);
                });

                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._duplicatedNodes.forEach((node) => {
                    let parent = node.parent;
                    parent.removeChild(node);
                    node.destroy();
                });
                this._duplicatedNodes = [];
                resolve();
            })
        }
    }

    app.nodeCommands.DuplicateNode = DuplicateNode;
});