app.addDefinitions(() => {
    app.ui = app.ui || {};
    
    function commitMaterials(target,multi=true) {
        return new Promise((resolve,reject) => {
            if (!this.currentMaterial) {
                resolve(false);
            }
            else if (target.length) {
                if (!multi) {
                    target = [target[0]];
                }
                let cmd = new app.materialCommands.ApplyMaterial(this.currentMaterial,target);
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        // Update the material backup
                        this._materialBackup.assign(this.currentMaterial);
                        resolve()
                    });
            }
            else {
                resolve();
            }
        })
    }

    let s_materialHandlerSingleton = null;
    class MaterialHandler {
        static Get() {
            if (!s_materialHandlerSingleton) {
                s_materialHandlerSingleton = new MaterialHandler();
            }
            return s_materialHandlerSingleton;
        }

        constructor() {
            this._currentMaterial = null;
            
            // This attribute stores the selected material, to restore it just before
            // execute the ApplyMaterial command.
            this._materialBackup = null;
        }

        getMaterialsFromSelection() {
            let result = []
            app.render.Scene.Get().selectionManager.selection.forEach((item) => {
                if (item.material) {
                    result.push(item.material);
                }
            });
            return result;
        }

        get currentMaterial() { return this._currentMaterial; }
        set currentMaterial(m) { this._currentMaterial = m; }

        updateCurrentFromSelection() {
            let mat = this.getMaterialsFromSelection();
            mat = mat.length>0 && mat[0];
            if (mat) {
                this._materialBackup = new bg.base.Material();
                this._materialBackup.assign(mat);
                this._currentMaterial = new bg.base.Material();
                this._currentMaterial.assign(mat);
            }
            else {
                this._currentMaterial = null;
            }
            return this.currentMaterial;
        }

        restoreCurrent() {
            let mat = this.getMaterialsFromSelection();
            if (this._materialBackup && mat.length) {
                mat[0].assign(this._materialBackup);
            }
        }

        // Apply the currentMaterial to the first selected material, using a command
        // if commit==true
        applyToSelected(commit = false) {
            if (commit) {
                return commitMaterials.apply(this,[this.getMaterialsFromSelection(),false]);
            }
            else {
                let mat = this.getMaterialsFromSelection();
                if (mat.length && this.currentMaterial) {
                    mat[0].assign(this.currentMaterial);
                }
                return Promise.resolve();
            }
        }

        // Apply the currentMaterial to all the selection, using a command
        applyToAll() {
            if (!this.currentMaterial) {
                throw new Error("Unexpected applyToAll received: currentMaterial is null");
            }
            return commitMaterials.apply(this,[this.getMaterialsFromSelection(),true]);
        }
    }

    app.ui.MaterialHandler = MaterialHandler;  
})