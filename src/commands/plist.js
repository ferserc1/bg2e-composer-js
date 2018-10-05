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

    class SetShadowVisibility extends app.Command {
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
                this._restoreVisibility.push(pl.visibleToShadows);
            });
            this._newVisibility = visible;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl) => {
                    pl.visibleToShadows = this._newVisibility;
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._plistArray.forEach((pl,index) => {
                    pl.visibleToShadows = this._restoreVisibility[index];
                });
                resolve();
            })
        }
    }

    app.plistCommands.SetShadowVisibility = SetShadowVisibility;

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

    function flipFaces(plist) {
        if (plist.index.length%3!=0) {
            console.warn(`Flip faces in polyList ${ plist.name }: the polylist doesn't appears to be composed by triangles.`);
        }
        else {
            for (let i = 0; i<plist.index.length; i+=3) {
                let a = plist.index[i];
                let c = plist.index[i + 2];
                plist.index[i] = c;
                plist.index[i + 2] = a;
            }
            plist.build();
        }
    }

    function flipNormals(plist) {
        if (plist.normal.length%3!=0) {
            console.warn(`Flip normals in polyList ${ plist.name }: malformed normal array.`);
        }
        else {
            for (let i = 0; i<plist.normal.length; i+=3) {
                plist.normal[i] *= -1;
                plist.normal[i + 1] *= -1;
                plist.normal[i + 2] *= -1;
            }
            plist.build();
        }
    }

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
                this._plistArray.forEach((pl) => flipFaces(pl));
                resolve();
            });
        }

        undo() {
            return this.execute();
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
                this._plistArray.forEach((pl) => flipNormals(pl));
                resolve();
            });
        }

        undo() {
            return this.execute();
        }
    }

    app.plistCommands.FlipNormals = FlipNormals;

    function assertCompatiblePlist(pl1,pl2) {
        return  (pl1.vertex!=null)==(pl2.vertex!=null) &&
                (pl1.normal!=null)==(pl2.normal!=null) &&
                (pl1.texCoord0!=null)==(pl2.texCoord0!=null) &&
                (pl1.texCoord1!=null)==(pl2.texCoord1!=null) &&
                (pl1.texCoord2!=null)==(pl2.texCoord2!=null) &&
                (pl1.color!=null)==(pl2.color!=null);
    }

    class Combine extends app.Command {
        constructor(drawable,plistArray,material) {
            super();
            this._plistArray = plistArray;
            this._drawable = drawable;
            this._material = material;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._plistArray.length<2) {
                    reject(new Error("Could not combine plygon lists: only one polygon list selected"));
                    return;
                }
                if (this._plistArray.some((plist) => !assertCompatiblePlist(plist,this._plistArray[0]))) {
                    reject(new Error("Could not combine polygon lists. All the polygon lists must have the same buffers"));
                    return;
                }

                // Check if some polyList does not belongs to the drawable
                // and save undo data
                this._restorePlist = [];
                if (this._plistArray.some((plist) => {
                    let plIndex = this._drawable.indexOf(plist);
                    if (plIndex!=-1) {
                        this._restorePlist.push({
                            plist:plist,
                            mat:this._drawable.getMaterial(plIndex),
                            trx:this._drawable.getTransform(plIndex)
                        });
                    }
                    return plIndex==-1
                })) {
                    reject(new Error("Could not combine polyLists: some polyLists belongs to different drawables."));
                    return;
                }

                let gl = app.ComposerWindowController.Get().gl;
                let newPlist = new bg.base.PolyList(gl);

                
                this._plistArray.forEach((plist) => {
                    let indexBase = newPlist.vertex.length / 3;
                    newPlist.vertex = newPlist.vertex.concat(plist.vertex);
                    newPlist.normal = newPlist.normal.concat(plist.normal);
                    newPlist.texCoord0 = newPlist.texCoord0.concat(plist.texCoord0);
                    newPlist.texCoord1 = newPlist.texCoord1.concat(plist.texCoord1);
                    newPlist.texCoord2 = newPlist.texCoord2.concat(plist.texCoord2);
                    newPlist.color = newPlist.color.concat(plist.color);

                    for (let i=0; i<plist.index.length; ++i) {
                        newPlist.index.push(plist.index[i] + indexBase);
                    }
                    this._drawable.removePolyList(plist);
                });

                newPlist.build();
                newPlist.name = this._plistArray[0].name;
                newPlist.groupName = this._plistArray[0].groupName;
                this._newPlist = newPlist;
                this._drawable.addPolyList(this._newPlist,this._material);
                app.render.Scene.Get().selectionManager.prepareNode(this._drawable.node);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._drawable.removePolyList(this._newPlist);
                this._newPlist.destroy();
                this._newPlist = null;
                this._restorePlist.forEach((restore) => {
                    this._drawable.addPolyList(restore.plist,restore.mat,restore.trx);
                });
                app.render.Scene.Get().selectionManager.prepareNode(this._drawable.node);
                resolve();
            })
        }
    }

    app.plistCommands.Combine = Combine;


    class DuplicatePlist extends app.Command {
        constructor(plistAndDrawables) {
            super();
            this._plistAndDrawables = plistAndDrawables;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._plistAndDrawables.length==0) {
                    reject(new Error("Could not duplicate poly list: empty data."));
                    return;
                }
                //let ctx = app.ComposerWindowController.Get().context;
                this._undoData = [];
                this._plistAndDrawables.forEach((item) => {
                    let newPlist = item.polyList.clone();
                    let newMat = item.material.clone();
                    let newTrx = new bg.Matrix4(item.transform);

                    this._undoData.push({
                        drw: item.drawable,
                        plist: newPlist
                    });

                    item.drawable.addPolyList(newPlist, newMat, newTrx);
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._undoData.forEach((item) => {
                    item.drw.removePolyList(item.plist);
                });
                resolve();
            });
        }
    }

    app.plistCommands.DuplicatePlist = DuplicatePlist;

    class RemovePlist extends app.Command {
        constructor(plistAndDrawables) {
            super();
        }

        execute() {
            return new Promise((resolve,reject) => {
                reject(new Error("Not implemented"));
            })
        }

        undo() {
            return new Promise((resolve,reject) => {
                reject(new Error("Not implemented"));
            })
        }
    }

    app.plistCommands.RemovePlist = RemovePlist;
});