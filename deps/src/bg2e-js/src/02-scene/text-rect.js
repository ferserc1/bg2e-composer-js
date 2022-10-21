(function() {
    class TextRect extends bg.scene.Component {
        constructor(rectSize = new bg.Vector2(1,1),textureSize = new bg.Vector2(1000,1000)) {
            super();

            this._rectSize = rectSize;
            this._textureSize = textureSize;

            this._textProperties = new bg.base.TextProperties();
            this._doubleSided = true;
            this._unlit = false;
            this._text = "Hello, World!";

            this._sprite = null;
            this._material = null;

            this._sizeMatrix = bg.Matrix4.Scale(this._rectSize.x,this._rectSize.y*-1,1);

            this._canvasTexture = null;
            this._dirty = true;
        }

        clone() {
            let newInstance = new bg.scene.TextRect();
            newInstance._text = this._text;
            newInstance._sprite = this._sprite && this._sprite.clone();
            newInstance._material = this._material && this._material.clone();

            // TODO: Clone other properties
            return newInstance;
        }

        get textProperties() { return this._textProperties; }
        get text() { return this._text; }
        set text(t) { this._dirty = true; this._text = t; }
        get doubleSided() { return this._doubleSided; }
        set doubleSided(ds) { this._dirty = true; this._doubleSided = ds; }
        get unlit() { return this._unlit; }
        set unlit(ul) { this._dirty = true; this._unlit = ul; }
        get rectSize() { return this._rectSize; }
        set rectSize(s) {
            this._sizeMatrix.identity().scale(s.x,s.y,1);
            this._rectSize = s;
        }

        // TODO: update texture size
        get textureSize() { return this._textureSize; }
        set textureSize(t) {
            this._dirty = true;
            this._canvasTexture.resize(t.x,t.y);
            this._textureSize = t;
        }

        get material() { return this._material; }

        init() {
            if (!this._sprite && this.node && this.node.context) {
                this._sprite = bg.scene.PrimitiveFactory.PlanePolyList(this.node.context,1,1,'z');
                this._material = new bg.base.PBRMaterial();
                this._material.alphaCutoff = 0.9;
                this._dirty = true;
            }
            if (!this._canvasTexture && this.node && this.node.context) {
                this._canvasTexture = new bg.tools.CanvasTexture(this.node.context,this._textureSize.x,this._textureSize.y,
                    (ctx,w,h) => {
                        ctx.clearRect(0,0,w,h);
                        if (this._textProperties.background!="transparent") {
                            ctx.fillStyle = this._textProperties.background;
                            ctx.fillRect(0,0,w,h);
                        }
                        ctx.fillStyle = this._textProperties.color;
                        let textSize = this._textProperties.size;
                        let font = this._textProperties.font;
                        let padding = 0;
                        let italic = this._textProperties.italic ? "italic" : "";
                        let bold = this._textProperties.bold ? "bold" : "";
                        ctx.textAlign = this._textProperties.align;
                        ctx.font = `${ italic } ${ bold } ${ textSize }px ${ font }`;    // TODO: Font and size
                        let textWidth = ctx.measureText(this._text);
                        let x = 0;
                        let y = 0;
                        switch (ctx.textAlign) {
                        case "center":
                            x = w / 2;
                            y = textSize + padding;
                            break;
                        case "right":
                            x = w;
                            y = textSize + padding;
                            break;
                        default:
                            x = padding;
                            y = textSize + padding;
                        }
                        let textLines = this._text.split("\n");
                        textLines.forEach((line) => {
                            ctx.fillText(line,x, y);
                            y += textSize;
                        });
                    }
                );
                this._dirty = true;
            }
        }

        frame(delta) {
            if ((this._dirty || this._textProperties.dirty)  && this._material && this._canvasTexture) {
                this._canvasTexture.update();
                if (this._material instanceof bg.base.PBRMaterial) {
                    this._material.diffuse = this._canvasTexture.texture;
                    this._material.unlit = this._unlit;
                    this._material.cullFace = !this._doubleSided;
                }
                else {
                    this._material.texture = this._canvasTexture.texture;
                    this._material.unlit = this._unlit;
                    this._material.cullFace = !this._doubleSided;
                }
                this._dirty = false;
                this.textProperties.dirty = false;
            }
        }

        ////// Direct rendering functions: will be deprecated soon
        display(pipeline,matrixState) {
            if (!pipeline.effect) {
                throw new Error("Could not draw TextRect: invalid effect");
            }
            if (!this.node.enabled) {
                return;
            }
            else if (this._sprite && this._material) {
                if (this._sprite.visible) {
                    let curMaterial = pipeline.effect.material;
                    matrixState.modelMatrixStack.push();
                    matrixState.modelMatrixStack.mult(this._sizeMatrix);

                    if (pipeline.shouldDraw(this._material)) {
                        pipeline.effect.material = this._material;
                        pipeline.draw(this._sprite);
                    }

                    matrixState.modelMatrixStack.pop();
                    pipeline.effect.material = curMaterial;
                }
            }
        }

        ///// Render queue functions
        draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
            if (this._sprite && this._material) {
                modelMatrixStack.push();
                modelMatrixStack.mult(this._sizeMatrix);

                if (this._material.isTransparent) {
					renderQueue.renderTransparent(this._sprite,this._material,modelMatrixStack.matrix,viewMatrixStack.matrix);
				}
				else {
					renderQueue.renderOpaque(this._sprite,this._material,modelMatrixStack.matrix,viewMatrixStack.matrix);
				}

                modelMatrixStack.pop();
            }
        }

        serialize(componentData,promises,url) {
            componentData.textProperties = {};
            this.textProperties.serialize(componentData.textProperties);
            componentData.text = this.text;
            componentData.doubleSided = this.doubleSided;
            componentData.unlit = this.unlit;
            componentData.textureSize = this.textureSize.toArray();
            componentData.rectSize = this.rectSize.toArray();
        }

        deserialize(context,sceneData,url) {
            this.textProperties.deserialize(sceneData.textProperties);
            this.text = sceneData.text;
            this.doubleSided = sceneData.doubleSided;
            this.unlit = sceneData.unlit;
            this.textureSize = new bg.Vector2(sceneData.textureSize);
            this.rectSize = new bg.Vector2(sceneData.rectSize);
        }
    }

    bg.scene.registerComponent(bg.scene,TextRect,"bg.scene.TextRect");
})();