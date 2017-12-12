app.addSource(() => {
    app.lightCommands = {};

    class SetLightParameters extends app.Command {
        constructor(light,params) {
            super();
            this._light = light;
            this._params = params;
            this._restoreParams = {};

            for (let key in params) {
                this._restoreParams[key] = this._light[key];
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                for (let key in this._params) {
                    this._light[key] = this._params[key];
                }
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                for (let key in this._restoreParams) {
                    this._light[key] = this._restoreParams[key];
                }
                resolve();
            });
        }
    }

    app.lightCommands.SetLightParameters = SetLightParameters;
})