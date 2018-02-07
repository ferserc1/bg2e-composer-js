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

    function swapUVs(plist,channelA,channelB) {
        let fromUVs = plist['texCoord' + channelA];
        let toUVs = plist['texCoord' + channelB];
        if (fromUVs && fromUVs.length && toUVs && toUVs.length) {
            plist['texCoord' + channelA] = toUVs;
            plist['texCoord' + channelB] = fromUVs;
            plist.build();
            return true;
        }
        else {
            console.warn(`Error switching uv maps in polyList ${ plist.name }: no such source or destination UV (from UV map ${ channelA } to UV map ${ channelB })`);
            return false;
        }
    }

    class SwapUVs extends app.Command {
        constructor(plistArray,channelA,channelB) {
            super();
            if (!Array.isArray(plistArray)) {
                this._plistArray = [plistArray];
            }
            else {
                this._plistArray = plistArray;
            }
            this._channelA = channelA;
            this._channelB = channelB;
        }

        execute() {
            return new Promise((resolve) => {
                this._plistArray.forEach((pl) => {
                    swapUVs(pl,this._channelA,this._channelB);
                });
                resolve();
            });
        }

        undo() {
            this.execute();
        }
    }

    app.plistCommands.SwapUVs = SwapUVs;

    class FlipFaces extends app.Command {
        constructor(plistArray) {
            super();
            if (!Array.isArray(plistArray)) {
                this._plistArray = [plistArray];
            }
            else {
                this._plistArray = plistArray;
            }
        }

        execute() {
            return new Promise((resolve) => {
                resolve();
            });
        }

        undo() {
            this.execute();
        }
    }

    app.plistCommands.FlipFaces = FlipFaces;

    class FlipNormals extends app.Command {
        constructor(plistArray) {
            super();
            if (!Array.isArray(plistArray)) {
                this._plistArray = [plistArray];
            }
            else {
                this._plistArray = plistArray;
            }
        }

        execute() {
            return new Promise((resolve) => {
                resolve();
            });
        }

        undo() {
            this.execute();
        }
    }

    app.plistCommands.FlipNormals = FlipNormals;
});