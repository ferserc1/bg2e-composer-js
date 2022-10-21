(function() {

    let g_textureTools = {};
    class TextureTools extends bg.app.ContextObject {
        constructor(context) {
            super(context);
        }

        static Get(context) {
            if (!g_textureTools[context]) {
                g_textureTools = new TextureTools(context);
            }
            return g_textureTools;
        }

        getFBO(width,height) {
            let gl = this.context;
            let fboData = {
                gl: gl,
                fbo: gl.createFramebuffer(),
                rbo: gl.createRenderbuffer(),
                texture: new bg.base.Texture(gl),
                width: width,
                height: height,

                bind:function() {
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);       
                },

                unbind:function() {
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                },

                resize:function(w,h) {
                    if (w!=this.width || h!=this.height) {
                        this.bind();
                        this.width = w;
                        this.height = height;
                        let gl = this.gl;
                        gl.bindRenderbuffer(gl.RENDERBUFFER,this.rbo);
                        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.width,this.height);
                        gl.bindRenderbuffer(gl.RENDERBUFFER,null);
                        this.texture.bind();
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                        this.texture.unbind();
                        this.unbind();
                    }
                },

                beginRender:function() {
                    this._currentViewport = this.gl.getParameter(this.gl.VIEWPORT);
                    this.bind();
                    this.gl.framebufferTexture2D(
                        this.gl.FRAMEBUFFER,
                        this.gl.COLOR_ATTACHMENT0,
                        this.gl.TEXTURE_2D,
                        this.texture.texture, 0);
                    this.gl.viewport(0,0,this.width,this.height);
                },

                endRender:function() {
                    this.gl.viewport(
                        this._currentViewport[0],
                        this._currentViewport[1],
                        this._currentViewport[2],
                        this._currentViewport[3]
                    );
                    this.unbind();
                },

                destroy:function(destroyTexture = false) {
                    this.unbind();
                    if (destroyTexture) {
                        this.texture.destroy();
                    }

                    this.gl.deleteRenderbuffer(this.rbo);
                    this.gl.deleteFramebuffer(this.fbo);
                }
            };

            // Create the framebuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, fboData.fbo);
            gl.bindRenderbuffer(gl.RENDERBUFFER, fboData.rbo);  
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, fboData.rbo);

            fboData.texture.target = bg.base.TextureTarget.TEXTURE_2D;
            fboData.texture.create();
            fboData.texture.bind();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            fboData.texture.unbind();
            fboData.texture._size = new bg.Vector2(width,height);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);

            return fboData;
        }
    }
    bg.webgl1.TextureTools = TextureTools;

    let s_mergeMapsPlane = null;
    function getMergeMapPlane(gl) {
        if (!s_mergeMapsPlane) {
            s_mergeMapsPlane = new bg.base.PolyList(gl);

            s_mergeMapsPlane.vertex = [ 1, 1, 0, -1, 1, 0, -1,-1, 0,1,-1, 0 ];
            s_mergeMapsPlane.texCoord0 = [ 1, 1, 0, 1, 0, 0, 1, 0 ];
            s_mergeMapsPlane.index = [ 0, 1, 2,  2, 3, 0 ];

            s_mergeMapsPlane.build();
        }
        return s_mergeMapsPlane;
    }
    
    let s_mergeMapsShader = null;
    function getMergeMapShader(gl) {
        if (!s_mergeMapsShader) {
            let vert = `
            attribute vec3 inPosition;
            attribute vec2 inTexCoord;

            varying vec2 fsTexCoord;

            void main() {
                fsTexCoord = inTexCoord;
                gl_Position = vec4(inPosition,1.0);
            }
            `;

            let frag = `
            precision mediump float;
            varying vec2 fsTexCoord;

            uniform sampler2D inT0;
            uniform int inT0Channel;
            uniform sampler2D inT1;
            uniform int inT1Channel;
            uniform sampler2D inT2;
            uniform int inT2Channel;
            uniform sampler2D inT3;
            uniform int inT3Channel;

            float mapChannel(sampler2D tex, int channel) {
                vec4 color = texture2D(tex,fsTexCoord);
                if (channel==0) {
                    return color.r;
                }
                else if (channel==1) {
                    return color.g;
                }
                else if (channel==2) {
                    return color.b;
                }
                else if (channel==3) {
                    return color.a;
                }
                else {
                    return 0.0;
                }
            }

            void main() {
                vec4 result;
                result.r = mapChannel(inT0,inT0Channel);
                result.g = mapChannel(inT1,inT1Channel);
                result.b = mapChannel(inT2,inT2Channel);
                result.a = mapChannel(inT3,inT3Channel);
                gl_FragColor = result;
            }
            `;

            s_mergeMapsShader = new bg.base.Shader(gl);
            s_mergeMapsShader.addShaderSource(bg.base.ShaderType.VERTEX, vert);
            s_mergeMapsShader.addShaderSource(bg.base.ShaderType.FRAGMENT, frag);
            let status = s_mergeMapsShader.link();
            if (!status) {
                throw new Error("Error generating texture merger shader.");
            }

            s_mergeMapsShader.initVars([
                "inPosition",
                "inTexCoord"
            ],[
                "inT0",
                "inT1",
                "inT2",
                "inT3",
                "inT0Channel",
                "inT1Channel",
                "inT2Channel",
                "inT3Channel"
            ]);
            

        }
        return s_mergeMapsShader;
    }

    class TextureMergerImpl extends bg.tools.TextureMergerImpl {
        constructor() {
            super();
            this._fbo = null;
        }
        // Get the greatest sizes in the textures r, g, b or a maps
        // (the greatest width and the greatest height)
        getMapSize(r,g,b,a) {
            return {
                width: Math.max(r.map.size.width, g.map.size.width, b.map.size.width, a.map.size.width),
                height: Math.max(r.map.size.height, g.map.size.height, b.map.size.height, a.map.size.height)
            };
        }


        mergeMaps(gl,r,g,b,a) {
            let activeShader = bg.base.Shader.GetActiveShader();
            let size = this.getMapSize(r,g,b,a);

            // TODO: there is some bug in the fbo.resize function. This can be optimized
            // resizing the fbo, instead of create it again
            // let fbo = this._fbo;
            // if (!fbo) {
            //     let tools = TextureTools.Get(gl);
            //     this._fbo = tools.getFBO(size.width,size.height);
            //     fbo = this._fbo;
            // }
            // else {
            //     fbo.resize(size.width,size.height);
            // }
            let tools = TextureTools.Get(gl);
            this._fbo = tools.getFBO(size.width,size.height);
            let fbo = this._fbo;

            let shader = getMergeMapShader.apply(this,[gl]);
            let plane = getMergeMapPlane.apply(this,[gl]);
            
            fbo.beginRender();
            gl.clearColor(0,0,0,1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.CULL_FACE);

            shader.setActive();
            shader.setInputBuffer("inPosition",plane.vertexBuffer,3);
            shader.setInputBuffer("inTexCoord",plane.texCoord0Buffer,2);

            shader.setTexture("inT0",r.map,bg.base.TextureUnit.TEXTURE_0);
            shader.setTexture("inT1",g.map,bg.base.TextureUnit.TEXTURE_1);
            shader.setTexture("inT2",b.map,bg.base.TextureUnit.TEXTURE_2);
            shader.setTexture("inT3",a.map,bg.base.TextureUnit.TEXTURE_3);
            shader.setValueInt("inT0Channel",r.channel);
            shader.setValueInt("inT1Channel",g.channel);
            shader.setValueInt("inT2Channel",b.channel);
            shader.setValueInt("inT3Channel",a.channel);
            plane.draw();

            shader.disableInputBuffer("inPosition");
            shader.disableInputBuffer("inTexCoord");
            shader.clearActive();
 
            fbo.endRender();

            if (activeShader) {
                activeShader.setActive();
            }

            return fbo.texture;
        }

        destroy(context) {
            this._fbo.destroy();
        }
    }


    bg.webgl1.TextureMergerImpl = TextureMergerImpl;

})();