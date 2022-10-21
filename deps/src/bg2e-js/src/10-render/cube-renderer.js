(function() {

    function buildDefaultShader() {
        let shader = null;

        let vert = `
        attribute vec3 inPosition;

        varying vec3 fsPosition;

        uniform mat4 inProjection;
        uniform mat4 inView;

        void main() {
            fsPosition = inPosition;
            gl_Position = inProjection * inView * vec4(inPosition,1.0);
        }
        `;

        let frag = `
        precision highp float;
        varying vec3 fsPosition;

        void main() {
            gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        }
        `;

        shader = new bg.base.Shader(this.context);
        shader.addShaderSource(bg.base.ShaderType.VERTEX, vert);
        shader.addShaderSource(bg.base.ShaderType.FRAGMENT, frag);

        status = shader.link();
        if (!shader.status) {
            throw new Error("Error generating default equirectangular cube shader");
        }

        shader.initVars(["inPosition"],["inProjection","inView"]);

        this.setShader(shader,(shader,projection,view) => { 
            shader.setMatrix4("inProjection",projection);
            shader.setMatrix4("inView",view);
        })
    }

    function buildCube(size) {
        let plist = new bg.base.PolyList(this.context);

        let hsize = size / 2;
        plist.vertex = [
            -hsize,-hsize,-hsize,   // 0: left    bottom   back
            -hsize,-hsize, hsize,   // 1: left    bottom   front
            -hsize, hsize,-hsize,   // 2: left    top      back
            -hsize, hsize, hsize,   // 3: left    top      front
             hsize,-hsize,-hsize,   // 4: right   bottom   back
             hsize,-hsize, hsize,   // 5: right   bottom   front
             hsize, hsize,-hsize,   // 6: right   top      back
             hsize, hsize, hsize,   // 7: right   top      front
        ];
        plist.index = [
            1, 5, 7,   7, 3, 1, // front
            0, 2, 6,   6, 4, 0, // back
            0, 1, 3,   3, 2, 0, // left
            5, 4, 6,   6, 7, 5, // right
            3, 7, 6,   6, 2, 3, // top
            5, 1, 0,   0, 4, 5  // bototm
        ];
        plist.build();
        return plist;
    }

    let s_cube = null;
    class CubeRenderer extends bg.app.ContextObject {

        constructor(context,size = 1) {
            super(context);

            this._size = size;
            this._shader = null;
            this._cube = null;

            this._pipeline = new bg.base.Pipeline(this.context);
        }

        setShader(shader,setInputVarsCallback) {
            this._shader = shader;
            this._setInputVarsCallback = setInputVarsCallback;
        }

        get shader() {
            if (!this._shader) {
                buildDefaultShader.apply(this);
            }
            return this._shader;
        }

        get cube() {
            if (!this._cube) {
                this._cube = buildCube.apply(this,[this._size]);
            }
            return this._cube;
        }

        get projectionMatrix() {
            if (!this._projection) {
                this._projection = bg.Matrix4.Perspective(60.0,1.0,0.1,100.0);
            }
            return this._projection;
        }

        set projectionMatrix(p) {
            this._projection = p;
        }

        get viewMatrix() {
            if (!this._viewMatrix) {
                this._viewMatrix = bg.Matrix4.Identity();
            }
            return this._viewMatrix;
        }

        set viewMatrix(m) {
            this._viewMatrix = m;
        }

        get pipeline() {
            return this._pipeline;
        }

        create() {

        }

        destroy() {
            this.shader.destroy();
            this.cube.destroy();
            this._shader = null;
            this._cube = null;
        }

        render(customPipeline = false) {
            let prevPipeline = bg.base.Pipeline.Current();
            if (!customPipeline) {
                bg.base.Pipeline.SetCurrent(this._pipeline);
                this._pipeline.clearBuffers();
            }

            this.shader.setActive();
            this.shader.setInputBuffer("position",this.cube.vertexBuffer,3);
            this._setInputVarsCallback(this.shader,this.projectionMatrix,this.viewMatrix);

            this.cube.draw();

            this.shader.disableInputBuffer("position");
            this.shader.clearActive();

            if (!customPipeline) {
                bg.base.Pipeline.SetCurrent(prevPipeline);
            }
        }
    }

    bg.render.CubeRenderer = CubeRenderer;

    class EquirectangularCubeRenderer extends CubeRenderer {
        get texture() { return this._texture; }
        set texture(t) { this._texture = t; }

        constructor(context,size=1) {
            super(context,size);
            this._texture = null;
        }

        create() {
            this.pipeline.buffersToClear = 0;
            this.pipeline.cullFace = false;

            let context = this.context;
            let shader = new bg.base.Shader(context);
            let vert = `
            attribute vec3 inPosition;

            varying vec3 fsPosition;

            uniform mat4 inProjection;
            uniform mat4 inView;

            void main() {
                fsPosition = inPosition;
                gl_Position = inProjection * inView * vec4(inPosition,1.0);
            }
            `;
            let frag = `
            precision highp float;
            varying vec3 fsPosition;
            
            uniform sampler2D inEquirectangularMap;

            const vec2 invAtan = vec2(0.1591,0.3183);
            vec2 sampleSphericalMap(vec3 v) {
                vec2 uv = vec2(atan(v.z,v.x),asin(v.y));
                uv *= invAtan;
                uv += 0.5;
                return uv;
            }

            void main() {
                vec2 uv = sampleSphericalMap(normalize(fsPosition));
                vec3 color = texture2D(inEquirectangularMap,uv).rgb;
                gl_FragColor = vec4(color,1.0);
            }
            `;
            shader.addShaderSource(bg.base.ShaderType.VERTEX, vert);
            shader.addShaderSource(bg.base.ShaderType.FRAGMENT, frag);
            if (!shader.link()) {
                throw new Error("Error generating equirectangular cube renderer: shader compile error");
            }
            shader.initVars(['inPosition'],['inProjection','inView','inEquirectangularMap']);
            this.setShader(shader,(sh,proj,view) => {
                sh.setMatrix4("inProjection",proj);
                sh.setMatrix4("inView",view);
                if (this.texture) {
                    sh.setTexture("inEquirectangularMap",this.texture,bg.base.TextureUnit.TEXTURE_0);
                }
            });
        }
    }
    
    bg.render.EquirectangularCubeRenderer = EquirectangularCubeRenderer;

    function createIrradianceMapShader() {
        let context = this.context;
        let shader = new bg.base.Shader(context);
        let vert = `
        attribute vec3 inPosition;

        varying vec3 fsPosition;

        uniform mat4 inProjection;
        uniform mat4 inView;

        void main() {
            fsPosition = inPosition;
            gl_Position = inProjection * inView * vec4(inPosition,1.0);
        }
        `;
        let sampleDelta = 0.07;
        let frag = `
        precision highp float;
        varying vec3 fsPosition;
        
        uniform samplerCube inCubeMap;

        void main() {
            vec3 normal = normalize(fsPosition);
            vec3 irradiance = vec3(0.0);

            vec3 up    = vec3(0.0, 1.0, 0.0);
            vec3 right = cross(up, normal);
            up         = cross(normal, right);
            
            float nrSamples = 0.0; 
            for(float phi = 0.0; phi < ${ 2.0 * Math.PI}; phi += ${ sampleDelta })
            {
                for(float theta = 0.0; theta < ${ 0.5 * Math.PI }; theta += ${ sampleDelta })
                {
                    // spherical to cartesian (in tangent space)
                    vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
                    // tangent space to world
                    vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * normal; 
            
                    irradiance += textureCube(inCubeMap, sampleVec).rgb * cos(theta) * sin(theta);
                    nrSamples++;
                }
            }
            irradiance = ${ Math.PI } * irradiance * (1.0 / float(nrSamples));

            gl_FragColor = vec4(irradiance,1.0);
        }
        `;
        shader.addShaderSource(bg.base.ShaderType.VERTEX, vert);
        shader.addShaderSource(bg.base.ShaderType.FRAGMENT, frag);
        if (!shader.link()) {
            throw new Error("Error generating irradiance map cube renderer: shader compile error");
        }
        shader.initVars(['inPosition'],['inProjection','inView','inCubeMap']);
        this.setShader(shader,(sh,proj,view) => {
            sh.setMatrix4("inProjection",proj);
            sh.setMatrix4("inView",view);
            if (this.texture) {
                sh.setTexture("inCubeMap",this.texture,bg.base.TextureUnit.TEXTURE_0);
            }
        });
    }

    function createSpecularMapShader() {
        let context = this.context;
        let shader = new bg.base.Shader(context);
        let vert = `
        attribute vec3 inPosition;

        varying vec3 fsPosition;

        uniform mat4 inProjection;
        uniform mat4 inView;

        void main() {
            fsPosition = inPosition;
            gl_Position = inProjection * inView * vec4(inPosition,1.0);
        }
        `;
        let sampleDelta = 0.09;
        let sampleCount = 128;
        let frag = `
        precision highp float;
        varying vec3 fsPosition;
        
        uniform samplerCube inCubeMap;
        uniform float inRoughness;

        float vanDerCorpus(int n, int base) {
            float invBase = 1.0 / float(base);
            float denom   = 1.0;
            float result  = 0.0;

            for(int i = 0; i < 16; ++i)
            {
                if(n > 0)
                {
                    denom   = mod(float(n), 2.0);
                    result += denom * invBase;
                    invBase = invBase / 2.0;
                    n       = int(float(n) / 2.0);
                }
            }

            return result;
        }

        vec2 hammersleyNoBitOps(int i, int N) {
            return vec2(float(i)/float(N), vanDerCorpus(i, 2));
        }

        vec3 importanceSampleGGX(vec2 Xi, vec3 N, float roughness) {
            float a = roughness*roughness;
            
            float phi = 2.0 * ${ Math.PI } * Xi.x;
            float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
            float sinTheta = sqrt(1.0 - cosTheta*cosTheta);
            
            // from spherical coordinates to cartesian coordinates
            vec3 H;
            H.x = sin(phi) * sinTheta;
            H.y = cos(phi) * sinTheta;
            H.z = cosTheta;
            
            // from tangent-space vector to world-space sample vector
            vec3 up        = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
            vec3 tangent   = normalize(cross(up, N));
            vec3 bitangent = cross(N, tangent);
            
            vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
            return normalize(sampleVec);
        }  

        void main() {
            vec3 N = normalize(fsPosition);    
            vec3 R = N;
            vec3 V = R;

            float totalWeight = 0.0;   
            vec3 prefilteredColor = vec3(0.0);     
            for(int i = 0; i < ${ sampleCount }; ++i)
            {
                vec2 Xi = hammersleyNoBitOps(i, ${ sampleCount });
                vec3 H  = importanceSampleGGX(Xi, N, inRoughness);
                vec3 L  = normalize(2.0 * dot(V, H) * H - V);

                float NdotL = max(dot(N, L), 0.0);
                if(NdotL > 0.0)
                {
                    prefilteredColor += textureCube(inCubeMap, L).rgb * NdotL;
                    totalWeight      += NdotL;
                }
            }
            prefilteredColor = prefilteredColor / totalWeight;

            gl_FragColor = vec4(prefilteredColor, 1.0);
        }
        `;
        shader.addShaderSource(bg.base.ShaderType.VERTEX, vert);
        shader.addShaderSource(bg.base.ShaderType.FRAGMENT, frag);
        if (!shader.link()) {
            throw new Error("Error generating specular map cube renderer: shader compile error");
        }
        shader.initVars(['inPosition'],['inProjection','inView','inCubeMap','inRoughness']);
        this.setShader(shader,(sh,proj,view) => {
            sh.setMatrix4("inProjection",proj);
            sh.setMatrix4("inView",view);
            sh.setValueFloat("inRoughness",this.roughness);
            if (this.texture) {
                sh.setTexture("inCubeMap",this.texture,bg.base.TextureUnit.TEXTURE_0);
            }
        });
    }

    bg.render.CubeMapShader = {
        IRRADIANCE_MAP: 0,
        SPECULAR_MAP: 1
    };

    class CubeMapRenderer extends CubeRenderer {
        get texture() { return this._texture; }
        set texture(t) { this._texture = t; }

        set roughness(r) { this._roughness = r; }
        get roughness() { return this._roughness || 0; } 

        constructor(context,size=1) {
            super(context,size);
            this._texture = null;
        }

        create(shaderType = bg.render.CubeMapShader.IRRADIANCE_MAP) {
            this.pipeline.buffersToClear = 0;
            this.pipeline.cullFace = false;

            switch (shaderType) {
            case bg.render.CubeMapShader.IRRADIANCE_MAP:
                createIrradianceMapShader.apply(this);
                break;
            case bg.render.CubeMapShader.SPECULAR_MAP:
                createSpecularMapShader.apply(this);
                break;
            }
        }
    }

    bg.render.CubeMapRenderer = CubeMapRenderer;
})();