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
});