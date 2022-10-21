(function() {

    function destroyResource(paramName) {
        if (this[paramName]) {
            this[paramName].destroy();
            this[paramName] = null;
        }
    }

    class Environment extends bg.app.ContextObject {
        constructor(context) {
            super(context);

            this._irradianceIntensity = 1;

            // Cubemap generators:
            this._cubemapRenderer = null;       // Convert the equirectangular 360º image into a cubemap texture
            this._irradianceRenderer = null;    // Generate the irradiance map
            this._specularRenderer = null;      // Generate the specular reflections
    

            // Renderer: generate the cubemap textures
            this._cubemapCapture = null;        // Main cubemap and specular reflection L0 (from 0% to 33% roughness)
            this._irradianceCapture = null;     // Irradiance map
            this._specularCaptureL1 = null;     // Specular reflections L1 (from 33% to 66% roughness)
            this._specularCaptureL2 = null;     // Specular reflections L2 (from 66% yo 100% roughness)

            this._blackTexture = bg.base.TextureCache.BlackTexture(context);
            this._texture = this._blackTexture;

            this._showSkybox = true;
        }

        set equirectangularTexture(t) {
            this._texture = t;
            if (this._cubemapRenderer) {
                this._cubemapRenderer.texture = t;
            }
        }

        set irradianceIntensity(i) { this._irradianceIntensity = i; }

        get equirectangularTexture() { return this._texture; }

        get cubemapTexture() { return this._cubemapCapture ? this._cubemapCapture.texture : this._blackTexture; }
        get irradianceMapTexture() { return this._irradianceCapture ? this._irradianceCapture.texture : this._blackTexture; }
        get specularMapTextureL0() { return this._cubemapCapture ? this._cubemapCapture.texture : this._blackTexture; }
        get specularMapTextureL1() { return this._specularCaptureL1 ? this._specularCaptureL1.texture : this._blackTexture; }
        get specularMapTextureL2() { return this._specularCaptureL2 ? this._specularCaptureL2.texture : this._blackTexture; }
        get irradianceIntensity() { return this._irradianceIntensity; }

        // This property is processed by the PBR renderers, in the display() method. 
        get showSkybox() { return this._showSkybox; }
        set showSkybox(s) { this._showSkybox = s; }
        
        get cubemapSize() { return this._creationParams.cubemapSize; }
        get irradianceMapSize() { return this._creationParams.irradianceMapSize; }
        get specularMapSize() { return this._creationParams.specularMapSize; }
        get specularMapL2Size() { return this._creationParams.specularMapL2Size; }

        resize(params) {
            if (!params) {
                params = {};
            }
            params.cubemapSize = params.cubemapSize || 512;
            params.irradianceMapSize = params.irradianceMapSize || 32;
            params.specularMapSize = params.specularMapSize || 32;
            params.specularMapL2Size = params.specularMapL2Size || params.specularMapSize || 32;
            

            if (bg.utils.userAgent.system.iOS || bg.utils.userAgent.system.Android) {
                // On new Apple devices (chip A11 and higher) the irradiance map shader causes a crash if the texture size is higher than 16px
                // I have found the same crash on some Android devices
                params.irradianceMapSize = 16;
            }
            this._creationParams = JSON.parse(JSON.stringify(params));
        
            destroyResource.apply(this,["_cubemapCapture"]);
            destroyResource.apply(this,["_irradianceCapture"]);
            destroyResource.apply(this,["_specularCaptureL1"]);
            destroyResource.apply(this,["_specularCaptureL2"]);

            this._cubemapCapture = new bg.base.CubemapCapture(this.context);
            this._cubemapCapture.create(params.cubemapSize);

            this._irradianceCapture = new bg.base.CubemapCapture(this.context);
            this._irradianceCapture.create(params.irradianceMapSize);

            this._specularCaptureL1 = new bg.base.CubemapCapture(this.context);
            this._specularCaptureL1.create(params.specularMapSize);

            this._specularCaptureL2 = new bg.base.CubemapCapture(this.context);
            this._specularCaptureL2.create(params.specularMapL2Size);

            this._frame = 0;
        }

        create(params) {
            if (!params) {
                params = {};
            }
            params.cubemapSize = params.cubemapSize || 512;
            params.irradianceMapSize = params.irradianceMapSize || 32;
            params.specularMapSize = params.specularMapSize || 32;
            params.specularMapL2Size = params.specularMapL2Size || params.specularMapSize || 32;
            

            if (bg.utils.userAgent.system.iOS || bg.utils.userAgent.system.Android) {
                // On new Apple devices (chip A11 and higher) the irradiance map shader causes a crash if the texture size is higher than 16px
                // I have found the same crash on some Android devices
                params.irradianceMapSize = 16;
            }
            this._creationParams = JSON.parse(JSON.stringify(params));
            this.destroy();
            this._cubemapRenderer = new bg.render.EquirectangularCubeRenderer(this.context,90);
            this._cubemapRenderer.create();
            this._cubemapRenderer.texture = this.texture;

            this._irradianceRenderer = new bg.render.CubeMapRenderer(this.context,90);
            this._irradianceRenderer.create(bg.render.CubeMapShader.IRRADIANCE_MAP);

            this._specularRenderer = new bg.render.CubeMapRenderer(this.context,90);
            this._specularRenderer.create(bg.render.CubeMapShader.SPECULAR_MAP);
            
            this._cubemapCapture = new bg.base.CubemapCapture(this.context);
            this._cubemapCapture.create(params.cubemapSize);

            this._irradianceCapture = new bg.base.CubemapCapture(this.context);
            this._irradianceCapture.create(params.irradianceMapSize);

            this._specularCaptureL1 = new bg.base.CubemapCapture(this.context);
            this._specularCaptureL1.create(params.specularMapSize);

            this._specularCaptureL2 = new bg.base.CubemapCapture(this.context);
            this._specularCaptureL2.create(params.specularMapL2Size);

            this._frame = 0;

            this._maxTextureUnits = this.context.getParameter(this.context.MAX_TEXTURE_IMAGE_UNITS);
        }

        update(camera) {
            let view = new bg.Matrix4(camera.viewMatrix);
            view.setPosition(0,0,0);
            //this._cubemapRendere.pipeline.viewport = this._camera.viewport;

            // Update main cubemap
            this._cubemapCapture.updateTexture((projectionMatrix,viewMatrix,usePipeline) => {
                this._cubemapRenderer.viewMatrix = viewMatrix;
                this._cubemapRenderer.projectionMatrix = projectionMatrix;
                this._cubemapRenderer.render(!usePipeline);
            }, view);


            // Update cubemap renderers textures
            this._irradianceRenderer.texture = this._cubemapCapture.texture;
            this._specularRenderer.texture = this._cubemapCapture.texture;

            // Update irradiance and specular maps
            if (this._frame == 0) {
                this._irradianceCapture.updateTexture((projectionMatrix,viewMatrix) => {
                    this._irradianceRenderer.viewMatrix = viewMatrix;
                    this._irradianceRenderer.projectionMatrix = projectionMatrix;
                    this._irradianceRenderer.render(true);
                }, bg.Matrix4.Identity(), view);
                this._frame = 1;
            }
            else if (this._frame == 1) {
                this._specularCaptureL1.updateTexture((projectionMatrix,viewMatrix) => {
                    this._specularRenderer.viewMatrix = viewMatrix;
                    this._specularRenderer.projectionMatrix = projectionMatrix;
                    this._specularRenderer.roughness = this._maxTextureUnits>8 ? 0.2 : 0.3;
                    this._specularRenderer.render(true);
                }, bg.Matrix4.Identity(), view);
                this._frame = this._maxTextureUnits>8 ? 2 : 0;
            }
            else if (this._frame == 2) {
                this._specularCaptureL2.updateTexture((projectionMatrix,viewMatrix) => {
                    this._specularRenderer.viewMatrix = viewMatrix;
                    this._specularRenderer.projectionMatrix = projectionMatrix;
                    this._specularRenderer.roughness = 0.8;
                    this._specularRenderer.render(true);
                }, bg.Matrix4.Identity(), view);
                this._frame = 0;
            }
        }

        renderSkybox(camera) {
            let view = new bg.Matrix4(camera.viewMatrix);
            view.setPosition(0,0,0);


            let projectionMatrix = camera.projection;
            let m22 = -projectionMatrix.m22;
            let m32 = -projectionMatrix.m32;
            let far = (2.0*m32)/(2.0*m22-2.0);
            
            let offset = 1;
            let scale = bg.Math.sin(bg.Math.PI_4) * far - offset;
            scale /= 60;
            view.scale(scale,scale,scale);


            
            this._cubemapRenderer.pipeline.viewport = camera.viewport;
            this._cubemapRenderer.viewMatrix = view;
            this._cubemapRenderer.projectionMatrix = camera.projection;
            this._cubemapRenderer.render(false);
        }
    
        destroy() {
            destroyResource.apply(this,["_cubemapRenderer"]);
            destroyResource.apply(this,["_irradianceRenderer"]);
            destroyResource.apply(this,["_specularRenderer"]);
            destroyResource.apply(this,["_cubemapCapture"]);
            destroyResource.apply(this,["_irradianceCapture"]);
            destroyResource.apply(this,["_specularCaptureL1"]);
            destroyResource.apply(this,["_specularCaptureL2"]);
        }

        clone() {
            console.warn("bg.base.Environment.clone(): not implemented");
            let clone = new bg.base.Environment(this.context);
            if (this._creationParams) {
                clone.create(this._creationParams);
                clone.equirectangularTexture = this.equirectangularTexture;
                clone.irradianceIntensity = this.irradianceIntensity;
                clone.showSkybox = this.showSkybox;
            }
            return clone;
        }

        serialize(data,promises,url) {
            if (!bg.isElectronApp) {
                throw new Error("Could not serialize Environment outside of an electron app.");
            }
            const path = require('path');
            
            data.equirectangularTexture = "";
            data.irradianceIntensity = this.irradianceIntensity;
            data.showSkybox = this.showSkybox;
            if (this.equirectangularTexture instanceof bg.base.Texture) {
                let fileName = path.basename(this.equirectangularTexture.fileName);
                data.equirectangularTexture = fileName;
                let destination = path.join(url.path,fileName);
                promises.push(bg.base.Writer.CopyFile(this.equirectangularTexture.fileName,destination));
            }
            data.cubemapSize = this._creationParams.cubemapSize;
            data.irradianceMapSize = this._creationParams.irradianceMapSize;
            data.specularMapSize = this._creationParams.specularMapSize;
            data.specularMapL2Size = this._creationParams.specularMapL2Size;
        }

        deserialize(data,url) {
            return new Promise((resolve,reject) => {
                let creationParams = {};
                creationParams.cubemapSize = data.cubemapSize || 1024;
                creationParams.irradianceMapSize = data.irradianceMapSize || 32;
                creationParams.specularMapSize = data.specularMapSize || 32;
                creationParams.specularMapL2Size = data.specularMapL2Size || creationParams.specularMapSize;
                this.irradianceIntensity = data.irradianceIntensity;
                this.showSkybox = data.showSkybox !== undefined ? data.showSkybox : true;
                this.create(creationParams);
                if (data.equirectangularTexture) {
                    let texturePath = bg.utils.path.join(url,data.equirectangularTexture);
                    bg.base.Loader.Load(this.context,bg.base.Loader.StandarizePath(texturePath))
                        .then((texture) => {
                            this.equirectangularTexture = texture;
                            resolve();
                        })
                        .catch((err) => {
                            console.warn("Error loading environment image: " + err.message);
                            resolve();
                        });
                }
                else {
                    resolve();
                }
            })
        }
    }

    bg.base.Environment = Environment;
})();