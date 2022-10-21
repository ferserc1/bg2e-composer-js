(function() {

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

    let g_backFace       = [  0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,  0.5, 0.5,-0.5 ];
    let g_rightFace      = [  0.5,-0.5, 0.5,  0.5,-0.5,-0.5,  0.5, 0.5,-0.5,  0.5, 0.5, 0.5 ];
    let g_frontFace      = [ -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5 ];
    let g_leftFace       = [ -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5 ];
    let g_topFace        = [ -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5, -0.5, 0.5,-0.5 ];
    let g_bottomFace     = [  0.5,-0.5, 0.5, -0.5,-0.5, 0.5, -0.5,-0.5,-0.5,  0.5,-0.5,-0.5 ];

    let g_backFaceNorm   = [ 0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1 ];
    let g_rightFaceNorm  = [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ];
    let g_frontFaceNorm  = [ 0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1 ];
    let g_leftFaceNorm   = [ 1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0 ];
    let g_topFaceNorm    = [ 0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0 ];
    let g_bottomFaceNorm = [ 0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0 ];

    let uv0 = 0;
    let uv1 = 1;
    let g_backFaceUV     = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];
    let g_rightFaceUV    = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];
    let g_frontFaceUV    = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];
    let g_leftFaceUV     = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];
    let g_topFaceUV      = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];
    let g_bottomFaceUV   = [ uv1,uv0, uv0,uv0, uv0,uv1, uv1,uv1 ];

    let g_index = [ 2,1,0, 0,3,2 ];

    class Skybox extends bg.scene.Component {
        constructor() {
            super();
            this._images = [null, null, null, null, null, null];
            this._textures = [];
            this._plist = [];
            this._material = null;
        }

        clone(context) {
            let result = new Skybox();
            result._images = [
                this._images[0],
                this._images[1],
                this._images[2],
                this._images[3],
                this._images[4],
                this._images[5]
            ];
            context = context || this.node && this.node.context;
            if (context) {
                result.loadSkybox(context);
            }
            return result;
        }

        setImageUrl(imgCode,texture) {
            this._images[imgCode] = texture;
        }

        getImageUrl(imgCode) {
            return this._images[imgCode];
        }

        getTexture(imgCode) {
            return this._textures[imgCode];
        }

        loadSkybox(context = null,onProgress = null) {
            context = context || this.node && this.node.context;

            let backPlist   = new bg.base.PolyList(context);
            let rightPlist  = new bg.base.PolyList(context);
            let frontPlist  = new bg.base.PolyList(context);
            let leftPlist   = new bg.base.PolyList(context);
            let topPlist    = new bg.base.PolyList(context);
            let bottomPlist = new bg.base.PolyList(context);

            backPlist.vertex = g_backFace; backPlist.normal = g_backFaceNorm; backPlist.texCoord0 = g_backFaceUV; backPlist.texCoord1 = g_backFaceUV; backPlist.index = g_index;
            backPlist.build();

            rightPlist.vertex = g_rightFace; rightPlist.normal = g_rightFaceNorm; rightPlist.texCoord0 = g_rightFaceUV; rightPlist.texCoord1 = g_rightFaceUV; rightPlist.index = g_index;
            rightPlist.build();

            frontPlist.vertex = g_frontFace; frontPlist.normal = g_frontFaceNorm; frontPlist.texCoord0 = g_frontFaceUV; frontPlist.texCoord1 = g_frontFaceUV; frontPlist.index = g_index;
            frontPlist.build();

            leftPlist.vertex = g_leftFace; leftPlist.normal = g_leftFaceNorm; leftPlist.texCoord0 = g_leftFaceUV; leftPlist.texCoord1 = g_leftFaceUV; leftPlist.index = g_index;
            leftPlist.build();

            topPlist.vertex = g_topFace; topPlist.normal = g_topFaceNorm; topPlist.texCoord0 = g_topFaceUV; topPlist.texCoord1 = g_topFaceUV; topPlist.index = g_index;
            topPlist.build();

            bottomPlist.vertex = g_bottomFace; bottomPlist.normal = g_bottomFaceNorm; bottomPlist.texCoord0 = g_bottomFaceUV; bottomPlist.texCoord1 = g_bottomFaceUV; bottomPlist.index = g_index;
            bottomPlist.build();

            this._plist = [leftPlist,rightPlist,topPlist,bottomPlist,frontPlist,backPlist];
            this._material = new bg.base.Material();
            this._material.receiveShadows = false;
            this._material.castShadows = false;
            this._material.unlit = true;


            return new Promise((resolve,reject) => {
                bg.base.Loader.Load(context,this._images,onProgress, {
                    wrapX:bg.base.TextureWrap.MIRRORED_REPEAT,
                    wrapY:bg.base.TextureWrap.MIRRORED_REPEAT
                })
                    .then((result) => {
                        this._textures = [
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X)],
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y)],
                            result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z)],
                            result[this.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z)]
                        ];
                        this._textures.forEach((tex) => {
                            tex.wrapX = bg.base.TextureWrap.CLAMP;
                            tex.wrapY = bg.base.TextureWrap.CLAMP;
                        });
                        bg.emitImageLoadEvent(result[this.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)]);
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        }

        display(pipeline,matrixState) {
            // TODO: extract far clip plane from projection matrix and use it to scale the cube before draw it
            if (!pipeline.effect) {
                throw new Error("Could not draw skybox: invalid effect");
            }
            if (!this.node.enabled) {
                return;
            }
            else if (this._textures.length==6) {
                let curMaterial = pipeline.effect.material;
                pipeline.effect.material = this._material;
                matrixState.viewMatrixStack.push();
                matrixState.modelMatrixStack.push();
                matrixState.viewMatrixStack.matrix.setPosition(0,0,0);

                let projectionMatrix = matrixState.projectionMatrixStack.matrix;
                let m22 = -projectionMatrix.m22;
                let m32 = -projectionMatrix.m32;
                let far = (2.0*m32)/(2.0*m22-2.0);
                
                let offset = 1;
                let scale = bg.Math.sin(bg.Math.PI_4) * far - offset;
                matrixState.modelMatrixStack.scale(scale,scale,scale);
                
                if (pipeline.shouldDraw(this._material)) {
                    this._plist.forEach((pl,index) => {
                        this._material.texture = this._textures[index];
                        pipeline.draw(pl);
                    });
                }

                matrixState.modelMatrixStack.pop();
                matrixState.viewMatrixStack.pop();
                pipeline.effect.material = curMaterial;
            }
        }

        draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
            if (this._textures.length==6) {
                viewMatrixStack.push();
                modelMatrixStack.push();

                viewMatrixStack.matrix.setPosition(0,0,0);

                let projectionMatrix = projectionMatrixStack.matrix;
                let m22 = -projectionMatrix.m22;
                let m32 = -projectionMatrix.m32;
                let far = (2.0*m32)/(2.0*m22-2.0);
                
                let offset = 1;
                let scale = bg.Math.sin(bg.Math.PI_4) * far - offset;
                modelMatrixStack.scale(scale,scale,scale);

                this._plist.forEach((pl,index) => {
                    this._material.texture = this._textures[index];
                    renderQueue.renderOpaque(pl,this._material.clone(),modelMatrixStack.matrix,viewMatrixStack.matrix);
                })

                viewMatrixStack.pop();
                modelMatrixStack.pop();
            }
        }

        removedFromNode() {
            this._plist.forEach((pl) => {
                pl.destroy();
            });
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
            return this.loadSkybox(context);
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

    bg.scene.registerComponent(bg.scene,Skybox,"bg.scene.Skybox");
})();