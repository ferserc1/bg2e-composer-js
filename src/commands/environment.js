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

    class SetSkybox extends app.Command {
        constructor(env,skybox) {
            super();
            this._env = env;
            this._skybox = skybox;
            this._prevSkybox = this._env.environment.showSkybox;
        }

        execute() {
            this._env.environment.showSkybox = this._skybox;
            return Promise.resolve();
        }

        undo() {
            this._env.environment.showSkybox = this._prevSkybox;
            return Promise.resolve();
        }
    }

    app.environmentCommands.SetSkybox = SetSkybox;

    class SetData extends app.Command {
        constructor(env,texture,irradiance,skybox) {
            super();
            this._prevIrradiance = env.environment.irradianceIntensity;
            this._prevTexture = env.equirectangularTexture;
            this._prevSkybox = env.environment.showSkybox;
            this._env = env;
            this._texture = texture;
            this._irradiance = irradiance;
            this._skybox = skybox;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._texture) {
                    let context = app.ComposerWindowController.Get().gl;
                    bg.base.Loader.Load(context,this._texture)
                        .then((texture) => {
                            this._env.equirectangularTexture = texture;
                            this._env.environment.irradianceIntensity = this._irradiance;
                            this._env.environment.showSkybox = this._skybox;
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    this._env.equirectangularTexture = null;
                    this._env.environment.irradianceIntensity = this._irradiance;
                    this._env.environment.showSkybox = this._skybox;
                    resolve();
                }
            });
        }

        undo() {
            this._env.equirectangularTexture = this._prevTexture;
            this._env.environment.irradianceIntensity = this._prevIrradiance;
            this._env.environment.showSkybox = this._prevSkybox;
            return Promise.resolve();
        }
    }

    app.environmentCommands.SetData = SetData;
})