(function() {

    let g_environment = null;

    class Environment extends bg.scene.Component {
        static Get() {
            return g_environment;
        }
        
        constructor(env = null) {
            super();
            this._environment = env;
        }

        /*
         *  Cubemap settings:
         *      cubemapSize - default: 512
         *      irradianceMapSize - default: 32
         *      specularMapSize - default: 32
         *      specularMapL2Size - default: specularMapSize
         */
        initCubemap(texture,cubemapSettings) {
            if (this._environment) {
                this._environment.destroy();
            }
            this._environment = new bg.base.Environment(texture.context);
            this._environment.create(cubemapSettings);
            this._environment.equirectangularTexture = texture;
        }

        init() {
            if (g_environment==null) {
                g_environment = this;
            }
        }

        removedFromNode() {
            if (g_environment==this) {
                g_environment = null;
            }
        }

        get environment() { return this._environment; }
        set environment(e) {
            if (this._environment) {
                this._environment.destroy();
            }
            this._environment = e;
        }

        get equirectangularTexture() { return this._environment && this._environment.equirectangularTexture; }
        set equirectangularTexture(t) {
            if (this._environment) {
                this._environment.equirectangularTexture = t;
            }
            else {
                this.initCubemap(t);
            }
        }

        clone() {
            let other = new Environment();
            other._environment = this._environment && this._environment.clone();
            return other;
        }

        deserialize(context,sceneData,url) {
            return new Promise((resolve,reject) => {
                if (this._environment) {
                    this._environment.destroy();
                }
                this._environment = new bg.base.Environment(context);
                this._environment.deserialize(sceneData,url)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }

        serialize(componentData,promises,url) {
            super.serialize(componentData,promises,url);
            if (!bg.isElectronApp) return;
            if (this._environment) {
                this._environment.serialize(componentData, promises, url);
            }
        }
    }

    bg.scene.registerComponent(bg.scene, Environment, "bg.scene.Environment");

})();
