app.addSource(() => {
    app.materialCommands = {};

    class ApplyMaterial extends app.Command {
        constructor(material,targets) {
            super();
            if (material instanceof bg.base.Material) {
                this._material = new bg.base.Material();
            }
            else if (material instanceof bg.base.PBRMaterial) {
                this._material = new bg.base.PBRMaterial();
            }
            else {
                throw new Error("ApplyMaterial command error: invalid source material.");
            }

            this._material.assign(material);
            this._targets = [];
            if (Array.isArray(targets)) {
                targets.forEach((t) => this._targets.push(t));
            }
            else {
                this._targets.push(targets);
            }

            this._undoTargets = [];
            this._targets.forEach((t) => {
                if (t instanceof bg.base.Material && this._material instanceof bg.base.Material) {
                    let m = new bg.base.Material();
                    m.assign(t);
                    this._undoTargets.push(m);
                }
                else if (t instanceof bg.base.PBRMaterial && this._material instanceof bg.base.PBRMaterial) {
                    let m = new bg.base.PBRMaterial();
                    m.assign(t);
                    this._undoTargets.push(m);
                }                
            });
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._targets.forEach((t) => {
                    t.assign(this._material);
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._targets.forEach((t,i) => {
                    t.assign(this._undoTargets[i]);
                });
                resolve();
            });
        }

    }

    app.materialCommands.ApplyMaterial = ApplyMaterial;

    class ApplyModifier extends app.Command {
        constructor(modifier,resPath,targets) {
            super();
            this._isPBR = modifier["class"] == "PBRMaterial" || modifier.type=="pbr";
            if (this._isPBR) {
                this._modifier = new bg.base.PBRMaterialModifier(modifier);
            }
            else {
                this._modifier = new bg.base.MaterialModifier(modifier);
            }
            this._resPath = resPath;
            this._targets = [];
            if (Array.isArray(targets)) {
                targets.forEach((t) => this._targets.push(t));
            }
            else {
                this._targets.push(targets);
            }

            this._undoTargets = [];
            this._targets.forEach((t) => {
                let m = this._isPBR ? new bg.base.PBRMaterial() : new bg.base.Material();
                m.assign(t);
                this._undoTargets.push(m);
            })
        }

        execute() {
            return new Promise((resolve,reject) => {
                let gl = app.ComposerWindowController.Get().gl;
                this._targets.forEach((t) => {
                    t.applyModifier(gl,this._modifier,this._resPath);
                });
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                this._targets.forEach((t,i) => {
                    t.assign(this._undoTargets[i]);
                });
                resolve();
            });
        }
    }

    app.materialCommands.ApplyModifier = ApplyModifier;

    class ConvertToPBR extends app.Command {
        // Targets are an array of objects containing:
        //  - drawable
        //  - index of plist to replace material
        constructor(targets) {
            super();
            this._targets = targets;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._undoItems = [];
                if (!this._targets.every((item) => {
                    if (!item.drawable instanceof bg.scene.Drawable ||
                        item.index===null || item.index===undefined) {
                        return false;
                    }
                    this._undoItems.push({
                        drawable: item.drawable,
                        index: item.index,
                        material: item.drawable.getMaterial(item.index)
                    });
                    return true;
                })) {
                    reject(new Error("ConvertToPBR: invalid target element found."));
                    this._undoItems = null;
                }
                else {
                    this._targets.forEach((target) => {
                        target.drawable.replaceMaterial(target.index, new bg.base.PBRMaterial());
                        // Adding a selectable component will initialize the selection highlight
                        target.drawable.node.addComponent(new bg.manipulation.Selectable());
                    });
                    resolve();
                }
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                if (!this._undoItems) {
                    reject(new Error("ConvertToPBR.undo(): Unexpected error: invalid undo items."))
                }
                else {
                    this._undoItems.forEach((undoItem) => {
                        undoItem.drawable.replaceMaterial(undoItem.index, undoItem.material);
                        undoItem.drawable.node.addComponent(new bg.manipulation.Selectable());
                    })
                    resolve();
                }
            });
        }
    }

    app.materialCommands.ConvertToPBR = ConvertToPBR;
});