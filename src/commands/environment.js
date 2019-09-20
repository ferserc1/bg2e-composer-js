app.addSource(() => {
    app.environmentCommands = {};

    class SetEnvironmentTexture extends app.Command {
        constructor(environment,textureUrl) {
            super();
            this._env = environment;
            this._textureUrl = textureUrl;
            this._prevTexture = environment.equirectangularTexture;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._textureUrl) {
                    let context = app.ComposerWindowController.Get().gl;
                    bg.base.Loader.Load(context,this._textureUrl)
                        .then((texture) => {
                            this._env.equirectangularTexture = texture;
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    this._env.equirectangularTexture = null;
                    resolve();
                }
            });
        }

        undo() {
            this._env.equirectangularTexture = this._prevTexture;
            return Promise.resolve();
        }
    }

    app.environmentCommands.SetEnvironmentTexture = SetEnvironmentTexture;

    class SetIrradianceIntensity extends app.Command {
        constructor(env,irradiance) {
            super();
            this._prevIrradiance = env.environment.irradianceIntensity;
            this._env = env;
            this._irradiance = irradiance;
        }

        execute() {
            this._env.environment.irradianceIntensity = this._irradiance;
            return Promise.resolve();
        }

        undo() {
            this._env.environment.irradianceIntensity = this._prevIrradiance;
            return Promise.resolve();
        }
    }

    app.environmentCommands.SetIrradianceIntensity = SetIrradianceIntensity;
})