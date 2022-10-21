(function() {

    function lib() {
        return bg.base.ShaderLibrary.Get();
    }

    class BorderDetectionEffect extends bg.base.TextureEffect {
        constructor(context) {
            super(context);

            let vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
            let fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
            vertex.addParameter([
                lib().inputs.buffers.vertex,
                lib().inputs.buffers.tex0,
                { name:"fsTexCoord", dataType:"vec2", role:"out" }
            ]);

            fragment.addParameter([
                lib().inputs.material.texture,
                { name:"inTexSize", dataType:"vec2", role:"value" },
                { name:"inConvMatrix", dataType:"float", role:"value", vec:9 },
                { name:"inBorderColor", dataType:"vec4", role:"value" },
                { name:"inBorderWidth", dataType:"float", role:"value" },
                { name:"fsTexCoord", dataType:"vec2", role:"in" }
            ]);

            if (bg.Engine.Get().id=="webgl1") {
                vertex.setMainBody(`
                gl_Position = vec4(inVertex,1.0);
                fsTexCoord = inTex0;
                `);
                fragment.addFunction(lib().functions.utils.applyConvolution);
                fragment.setMainBody(`
                vec4 selectionColor = applyConvolution(inTexture,fsTexCoord,inTexSize,inConvMatrix,inBorderWidth);
                if (selectionColor.r!=0.0 && selectionColor.g!=0.0 && selectionColor.b!=0.0) {
                    gl_FragColor = inBorderColor;
                }
                else {
                    discard;
                }
                `);
            }

            this.setupShaderSource([
                vertex,
                fragment
            ], false);

            this._highlightColor = bg.Color.White();
            this._borderWidth = 2;
        }

        get highlightColor() { return this._highlightColor; }
        set highlightColor(c) { this._highlightColor = c; }

        get borderWidth() { return this._borderWidth; }
        set borderWidth(w) { this._borderWidth = w; } 

        setupVars() {
            let texture = null;
            if (this._surface instanceof bg.base.Texture) {
                texture = this._surface;
            }
            else if (this._surface instanceof bg.base.RenderSurface) {
                texture = this._surface.getTexture(0);
            }

            if (texture) {
                this.shader.setTexture("inTexture",texture,bg.base.TextureUnit.TEXTURE_0);
                this.shader.setVector2("inTexSize",texture.size);
            }

            let convMatrix = [
                0, 1, 0,
                1,-4, 1,
                0, 1, 0
            ];
            this.shader.setValueFloatPtr("inConvMatrix",convMatrix);
            this.shader.setVector4("inBorderColor", this._highlightColor);
            this.shader.setValueFloat("inBorderWidth", this._borderWidth);
        }
    }

    bg.manipulation.BorderDetectionEffect = BorderDetectionEffect;

    let s_plainColorVertex = null;
    let s_plainColorFragment = null;

    function plainColorVertex() {
        if (!s_plainColorVertex) {
            s_plainColorVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);

            s_plainColorVertex.addParameter(lib().inputs.buffers.vertex);
            s_plainColorVertex.addParameter(lib().inputs.matrix.all);

            if (bg.Engine.Get().id=="webgl1") {
                s_plainColorVertex.setMainBody(`
                    gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
                `);
            }
        }
        return s_plainColorVertex;
    }

    function plainColorFragment() {
        if (!s_plainColorFragment) {
            s_plainColorFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
            s_plainColorFragment.addParameter([
                { name:"inColor", dataType:"vec4", role:"value" },
                { name:"inSelectMode", dataType:"int", role:"value" }
            ]);

            if (bg.Engine.Get().id=="webgl1") {
                s_plainColorFragment.setMainBody(`
                    if (inSelectMode==0) {
                        discard;
                    }
                    else {
                        gl_FragColor = inColor;
                    }
                `);
            }
        }
        return s_plainColorFragment;
    }

    class PlainColorEffect extends bg.base.Effect {
        constructor(context) {
            super(context);

            let sources = [
                plainColorVertex(),
                plainColorFragment()
            ];
            this.setupShaderSource(sources);
        }

        beginDraw() {
            bg.Math.seed = 1;
        }

        setupVars() {
            this._baseColor = new bg.Color(bg.Math.seededRandom(),bg.Math.seededRandom(),bg.Math.seededRandom(),1);
            let matrixState = bg.base.MatrixState.Current();
            let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
            this.shader.setMatrix4('inModelMatrix',matrixState.modelMatrixStack.matrixConst);
            this.shader.setMatrix4('inViewMatrix',viewMatrix);
            this.shader.setMatrix4('inProjectionMatrix',matrixState.projectionMatrixStack.matrixConst);
            this.shader.setVector4('inColor', this._baseColor);
            this.shader.setValueInt("inSelectMode", this.material.selectMode);
        }
    }

    bg.manipulation.PlainColorEffect = PlainColorEffect;

    function buildOffscreenPipeline() {
        let offscreenPipeline = new bg.base.Pipeline(this.context);
    
        let renderSurface = new bg.base.TextureSurface(this.context);
        offscreenPipeline.effect = new bg.manipulation.PlainColorEffect(this.context);
        let colorAttachments = [
            { type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
            { type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
        ];
        renderSurface.create(colorAttachments);
        offscreenPipeline.renderSurface = renderSurface;

        return offscreenPipeline;
    }

    class SelectionHighlight extends bg.app.ContextObject {

        constructor(context) {
            super(context);

            this._offscreenPipeline = buildOffscreenPipeline.apply(this);

            this._pipeline = new bg.base.Pipeline(this.context);
            this._pipeline.textureEffect = new bg.manipulation.BorderDetectionEffect(this.context);
            
            this._matrixState = new bg.base.MatrixState();

            this._drawVisitor = new bg.scene.DrawVisitor(this._offscreenPipeline,this._matrixState);
            this._drawVisitor.forceDraw = false;
        }

        get highlightColor() { return this._pipeline.textureEffect.highlightColor; }
        set highlightColor(c) { this._pipeline.textureEffect.highlightColor = c; }

        get borderWidth() { return this._pipeline.textureEffect.borderWidth; }
        set borderWidth(w) { this._pipeline.textureEffect.borderWidth = w; }

        get drawInvisiblePolyList() { return this._drawVisitor.forceDraw; }
        set drawInvisiblePolyList(d) { this._drawVisitor.forceDraw = d; }

        drawSelection(sceneRoot,camera) {
            let restorePipeline = bg.base.Pipeline.Current();
            let restoreMatrixState = bg.base.MatrixState.Current();
            this._offscreenPipeline.viewport = camera.viewport;
            this._pipeline.viewport = camera.viewport;

            bg.base.Pipeline.SetCurrent(this._offscreenPipeline);
            bg.base.MatrixState.SetCurrent(this._matrixState);
            this._offscreenPipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
            this._matrixState.projectionMatrixStack.set(camera.projection);
            this._matrixState.viewMatrixStack.set(camera.viewMatrix);
            this._matrixState.modelMatrixStack.identity();
            sceneRoot.accept(this._drawVisitor);
            
            let texture = this._offscreenPipeline.renderSurface.getTexture(0);
            bg.base.Pipeline.SetCurrent(this._pipeline);
            this._pipeline.blend = true;
            this._pipeline.blendMode = bg.base.BlendMode.ADD;
            this._pipeline.drawTexture(texture);

            if (restorePipeline) {
                bg.base.Pipeline.SetCurrent(restorePipeline);
            }
            if (restoreMatrixState) {
                bg.base.MatrixState.SetCurrent(restoreMatrixState);
            }
        }
    }

    bg.manipulation.SelectionHighlight = SelectionHighlight;

})();