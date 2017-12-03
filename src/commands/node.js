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
});