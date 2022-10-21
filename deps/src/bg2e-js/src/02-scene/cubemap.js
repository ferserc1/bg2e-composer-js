(function() {
    bg.scene.CubemapImage = {
        POSITIVE_X: 0,
        NEGATIVE_X: 1,
        POSITIVE_Y: 2,
        NEGATIVE_Y: 3,
        POSITIVE_Z: 4,
        NEGATIVE_Z: 5,
    };

    let g_currentCubemap = null;
    let g_irradianceCubemap = null;
    let g_specularCubemap = [];
    let g_irradianceIntensity = 1.0;

    function copyCubemapImage(componentData,cubemapImage,dstPath) {
        let path = require("path");
        let src = bg.base.Writer.StandarizePath(this.getImageUrl(cubemapImage));
        let file = src.split('/').pop();
        let dst = bg.base.Writer.StandarizePath(path.join(dstPath,file));
        switch (cubemapImage) {
        case bg.scene.CubemapImage.POSITIVE_X:
            componentData.positiveX = file;
            break;
        case bg.scene.CubemapImage.NEGATIVE_X:
            componentData.negativeX = file;
            break;
        case bg.scene.CubemapImage.POSITIVE_Y:
            componentData.positiveY = file;
            break;
        case bg.scene.CubemapImage.NEGATIVE_Y:
            componentData.negativeY = file;
            break;
        case bg.scene.CubemapImage.POSITIVE_Z:
            componentData.positiveZ = file;
            break;
        case bg.scene.CubemapImage.NEGATIVE_Z:
            componentData.negativeZ = file;
            break;
        }
        return bg.base.Writer.CopyFile(src,dst);
    }

    class Cubemap extends bg.scene.Component {
        static Current(context) {
            if (!g_currentCubemap) {
                g_currentCubemap = bg.base.TextureCache.WhiteCubemap(context);
            }
            return g_currentCubemap;
        }

        static IrradianceMapIntensity() {
            return g_irradianceIntensity;
        }
        static IrradianceMap(context) {
            if (!g_irradianceCubemap) {
                g_irradianceCubemap = bg.base.TextureCache.BlackCubemap(context);
            }
            return g_irradianceCubemap;
        }

        static SpecularMap(context,level = 0){
            if (!g_specularCubemap[level]) {
                g_specularCubemap[level] = bg.base.TextureCache.BlackCubemap(context);
            }
            return g_specularCubemap[level];
        } 

        static SetCurrent(cubemapTexture) {
            g_currentCubemap = cubemapTexture;
        }

        static SetIrradianceMapIntensity(i) {
            g_irradianceIntensity = i;
        }

        static SetIrradiance(irradianceTexture) {
            g_irradianceCubemap = irradianceTexture;
        }

        static SetSpecular(specTexture,level = 0) {
            g_specularCubemap[level] = specTexture;
        }

        constructor() {
            super();
            this._images = [null, null, null, null, null, null];
            this._texture = null;
        }

        setImageUrl(imgCode,texture) {
            this._images[imgCode] = texture;
        }

        getImageUrl(imgCode) {
            return this._images[imgCode];
        }

        get texture() {
            return this._texture;
        }

        // Use this setter to set a custom cubemap, for example, one captured with an FBO
        set texture(t) {
            this._texture = t;
        }

        loadCubemap(context) {
            context = context || this.node && this.node.context;
            return new Promise((resolve,reject) => {
                bg.utils.Resource.LoadMultiple(this._images)
                    .then((result) => {
                        this._texture = new bg.base.Texture(context);
                        this._texture.target = bg.base.TextureTarget.CUBE_MAP;
                        this._texture.create();
                        this._texture.bind();

                        this._texture.setCubemap(
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X)],
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y)],
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z)]
                        );

                        g_currentCubemap = this._texture;
                        bg.emitImageLoadEvent(result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)]);
                        resolve(this);
                    })

                    .catch((err) => {
                        reject(err);
                    });
            });
        }

        clone() {
            let cubemap = new Cubemap();
            for (let code in this._images) {
                cubemap._images[code] = this._images[code];
            };
            cubemap._texture = this._texture;
            return cubemap;
        }

        deserialize(context,sceneData,url) {
            this.setImageUrl(
                bg.scene.CubemapImage.POSITIVE_X,
                bg.utils.Resource.JoinUrl(url,sceneData["positiveX"])
            );
            this.setImageUrl(
                bg.scene.CubemapImage.NEGATIVE_X,
                bg.utils.Resource.JoinUrl(url,sceneData["negativeX"])
            );
            this.setImageUrl(
                bg.scene.CubemapImage.POSITIVE_Y,
                bg.utils.Resource.JoinUrl(url,sceneData["positiveY"])
            );
            this.setImageUrl(
                bg.scene.CubemapImage.NEGATIVE_Y,
                bg.utils.Resource.JoinUrl(url,sceneData["negativeY"])
            );
            this.setImageUrl(
                bg.scene.CubemapImage.POSITIVE_Z,
                bg.utils.Resource.JoinUrl(url,sceneData["positiveZ"])
            );
            this.setImageUrl(
                bg.scene.CubemapImage.NEGATIVE_Z,
                bg.utils.Resource.JoinUrl(url,sceneData["negativeZ"])
            );
            return this.loadCubemap(context);
        }
        
        serialize(componentData,promises,url) {
            super.serialize(componentData,promises,url);
            if (!bg.isElectronApp) return;
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.POSITIVE_X,url.path]));
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.NEGATIVE_X,url.path]));
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.POSITIVE_Y,url.path]));
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.NEGATIVE_Y,url.path]));
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.POSITIVE_Z,url.path]));
            promises.push(copyCubemapImage.apply(this,[componentData,bg.scene.CubemapImage.NEGATIVE_Z,url.path]));
		}
    }

    bg.scene.registerComponent(bg.scene,Cubemap,"bg.scene.Cubemap");
})();