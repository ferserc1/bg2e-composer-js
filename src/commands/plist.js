app.addSource(() => {
    app.plistCommands = {};

    class SetName extends app.Command {
        constructor(plist,newName) {
            super();
            this._plist = plist;
            this._restoreName = this._plist.name;
            this._newName = newName;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._plist.name = this._newName;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._plist.name = this._restoreName;
                resolve();
            });
        }
    }

    app.plistCommands.SetName = SetName;

    class SetGroupName extends app.Command {
        constructor(plistArray,newName) {
            super();
            if (!Array.isArray(plistArray)) {
                this._plistArray = [plistArray];
            }
            else {
                this._plistArray = plistArray;
            }

            this._restoreNames = [];
            this._plistArray.forEach((pl) => {
                this._restoreNames.push(pl.name);
            });
            this._newName = newName;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl) => {
                    pl.groupName = this._newName;
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl,index) => {
                    pl.groupName = this._restoreNames[index];
                });
                resolve();
            })
        }
    }

    app.plistCommands.SetGroupName = SetGroupName;

    class SetVisibility extends app.Command {
        constructor(plistArray,visible) {
            super();
            if (!Array.isArray(plistArray)) {
                this._plistArray = [plistArray];
            }
            else {
                this._plistArray = plistArray;
            }

            this._restoreVisibility = [];
            this._plistArray.forEach((pl) => {
                this._restoreVisibility.push(pl.visible);
            });
            this._newVisibility = visible;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl) => {
                    pl.visible = this._newVisibility;
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl,index) => {
                    pl.visible = this._restoreVisibility[index];
                });
                resolve();
            })
        }
    }

    app.plistCommands.SetVisibility = SetVisibility;

});