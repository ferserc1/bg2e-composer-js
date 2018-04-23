app.addSource(() => {
    app.materialCommands = {};

    class ApplyMaterial extends app.Command {
        constructor(material,targets) {
            super();
            this._material = new bg.base.Material();
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
                let m = new bg.base.Material();
                m.assign(t);
                this._undoTargets.push(m);
            })
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
            this._modifier = new bg.base.MaterialModifier(modifier);
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
                let m = new bg.base.Material();
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
});