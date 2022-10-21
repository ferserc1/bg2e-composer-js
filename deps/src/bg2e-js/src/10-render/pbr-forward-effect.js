(function() {
    
    let shaders = {};

    function lib() {
        return bg.base.ShaderLibrary.Get();
    }

    let s_vertexSource = null;
    // One shader source for each number of lights
    let s_fragmentSources = [];
    let s_supportedTextureUnits = 0;

    function vertexShaderSource() {
        if (!s_vertexSource) {
            s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);

            s_vertexSource.addParameter([
                lib().inputs.buffers.vertex,
                lib().inputs.buffers.normal,
				lib().inputs.buffers.tangent,
				lib().inputs.buffers.tex0,
				lib().inputs.buffers.tex1
            ]);

            s_vertexSource.addParameter(lib().inputs.matrix.all);

            s_vertexSource.addParameter([
                { name:"inLightProjectionMatrix", dataType:"mat4", role:"value" },
                { name:"inLightViewMatrix", dataType:"mat4", role:"value" }
            ])

            s_vertexSource.addParameter([
                { name:"fsTex0Coord", dataType:"vec2", role:"out" },
                { name:"fsTex1Coord", dataType:"vec2", role:"out" },
                { name:"fsNormal", dataType:"vec3", role:"out" },
                { name:"fsTangent", dataType:"vec3", role:"out" },
                { name:"fsBitangent", dataType:"vec3", role:"out" },
                { name:"fsPosition", dataType:"vec3", role:"out" },
                { name:"fsVertexPosFromLight", dataType:"vec4", role:"out" },
                { name:"fsTangentViewPos", dataType:"vec3", role:"out" },
                { name:"fsTangentFragPos", dataType:"vec3", role:"out" }
            ]);

            if (bg.Engine.Get().id=="webgl1") {
                s_vertexSource.setMainBody(`
                    mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0,
                        0.0, 0.5, 0.0, 0.0,
                        0.0, 0.0, 0.5, 0.0,
                        0.5, 0.5, 0.5, 1.0);

                    vec4 viewPos = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);
                    gl_Position = inProjectionMatrix * viewPos;

                    fsNormal = normalize((inNormalMatrix * vec4(inNormal,1.0)).xyz);
                    fsTangent = normalize((inNormalMatrix * vec4(inTangent,1.0)).xyz);
                    fsBitangent = cross(fsNormal,fsTangent);

                    fsVertexPosFromLight = ScaleMatrix * inLightProjectionMatrix * inLightViewMatrix * inModelMatrix * vec4(inVertex,1.0);

                    fsTex0Coord = inTex0;
                    fsTex1Coord = inTex1;
                    fsPosition = viewPos.rgb;

                    mat3 TBN = mat3(
                        fsTangent.x, fsBitangent.x, fsNormal.x,
                        fsTangent.y, fsBitangent.y, fsNormal.y,
                        fsTangent.z, fsBitangent.z, fsNormal.z
                    );
                    fsTangentViewPos = TBN * vec3(0.0); // Using view space, the view position is at 0,0,0
                    fsTangentFragPos = TBN * fsPosition;
                `)
            }
        }
        return s_vertexSource;
    }

    function fragmentShaderSource(numLights) {
        if (!s_fragmentSources[numLights - 1] && numLights>0) {
            s_fragmentSources[numLights - 1] = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
            let fragSrc = s_fragmentSources[numLights - 1];

            fragSrc.addParameter(lib().inputs.pbr.material.all);
            fragSrc.addParameter(lib().inputs.pbr.lightingForward.all);
            fragSrc.addParameter(lib().inputs.pbr.shadows.all);
            fragSrc.addParameter(lib().inputs.pbr.colorCorrection.all);
            
            fragSrc.addParameter([
                { name:"fsTex0Coord", dataType:"vec2", role:"in" },
                { name:"fsTex1Coord", dataType:"vec2", role:"in" },
                { name:"fsNormal", dataType:"vec3", role:"in" },
                { name:"fsTangent", dataType:"vec3", role:"in" },
                { name:"fsBitangent", dataType:"vec3", role:"in" },
                { name:"fsPosition", dataType:"vec3", role:"in" },
                { name:"fsVertexPosFromLight", dataType:"vec4", role:"in" },

                { name:"fsTangentViewPos", dataType:"vec3", role:"in" },
                { name:"fsTangentFragPos", dataType:"vec3", role:"in" },
                
                { name:"inIrradianceMapIntensity", dataType:"float", role:"value" },
                { name:"inIrradianceMap", dataType:"samplerCube", role:"value" },
                { name:"inSpecularMap0", dataType:"samplerCube", role:"value" },
                { name:"inSpecularMap1", dataType:"samplerCube", role:"value" },
                { name:"inSpecularMap2", dataType:"samplerCube", role:"value" },
                { name:"inBRDF", dataType:"sampler2D", role:"value" },
                { name:"inViewMatrix", dataType:"mat4", role:"value" },

                { name:"inShadowLightDirection", dataType:"vec3", role:"value" },
                { name:"inShadowLightIndex", dataType:"int", role:"value" }
            ]);

            fragSrc.addFunction(lib().functions.pbr.material.all);
            fragSrc.addFunction(lib().functions.pbr.utils.unpack);
            fragSrc.addFunction(lib().functions.pbr.utils.pack);
            fragSrc.addFunction(lib().functions.pbr.utils.random);
            fragSrc.addFunction(lib().functions.pbr.utils.gammaCorrection);
            fragSrc.addFunction(lib().functions.pbr.utils.inverseGammaCorrection);
            fragSrc.addFunction(lib().functions.pbr.lighting.all);
            fragSrc.addFunction(lib().functions.colorCorrection.all);

            if (bg.Engine.Get().id=="webgl1") {


                // PBR test: utility functions
                fragSrc.addFunction({
                    returnType: "vec3", name:"fresnelSchlick", params: {
                        cosTheta:"float", F0:"vec3"
                    }, body: `
                    return max(F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0), 0.0);
                    `
                });

                fragSrc.addFunction({
                    returnType: "vec3", name:"fresnelSchlickRoughness", params: {
                        cosTheta:"float", F0:"vec3", roughness:"float"
                    }, body: `
                    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
                    `
                });

                fragSrc.addFunction({
                    returnType:"float", name:"distributionGGX", params:{
                        N:"vec3",
                        H:"vec3",
                        roughness:"float"
                    }, body:`
                    float a = roughness * roughness;
                    float a2 = a * a;
                    float NdotH = max(dot(N,H), 0.0);
                    float NdotH2 = NdotH * NdotH;

                    float num = a2;
                    float denom = (NdotH2 * (a2 - 1.0) +  1.0);
                    denom = ${ Math.PI } * denom * denom;

                    return num / denom;
                    `
                });

                fragSrc.addFunction({
                    returnType:"float", name:"geometrySchlickGGX", params: {
                        NdotV:"float",
                        roughness:"float"
                    }, body: `
                    float r = (roughness + 1.0);
                    float k = (r*r) / 8.0;
                    return NdotV / NdotV * (1.0 - k) + k;
                    `
                });

                fragSrc.addFunction({
                    returnType:"float", name:"geometrySmith", params: {
                        N:"vec3",
                        V:"vec3",
                        L:"vec3",
                        roughness:"float"
                    }, body:`
                    float NdotV = dot(N, V);
                    float NdotL = dot(N, L);
                    float ggx2 = geometrySchlickGGX(NdotV, roughness);
                    float ggx1 = geometrySchlickGGX(NdotL, roughness);

                    return ggx1 * ggx2;
                    `
                });


                let maxReflectionLod = 4;
                let irradianceBody = `
                vec3 N = normalize(normal);
                vec3 V = normalize(camPos - worldPos);
                roughness = max(roughness,0.0001);    // Prevent some artifacts

                vec3 F0 = vec3(0.04); 
                F0 = mix(F0, albedo, metallic);

                // reflectance equation
                vec3 Lo = vec3(0.0);
                for(int i = 0; i < ${ numLights}; ++i) 
                {
                    // calculate per-light radiance
                    vec3 L = vec3(0.0);
                    vec3 H = vec3(0.0);

                    float intensity = 1.0;
                    if (inLightType[i]==${ bg.base.LightType.POINT}) {
                        L = normalize(inLightPosition[i] - worldPos);
                        H = normalize(V + L);
                    }
                    else if (inLightType[i]==${ bg.base.LightType.SPOT}) {
                        float theta = dot(normalize(inLightPosition[i] - worldPos),normalize(-inLightDirection[i]));
                        if (theta > inLightSpotCutoff[i]) {
                            L = normalize(-inLightDirection[i]);
                            H = normalize(V + L);
                            float epsilon = inLightSpotCutoff[i] - inLightOuterSpotCutoff[i];
                            intensity = 1.0 - clamp((theta - inLightOuterSpotCutoff[i]) / epsilon, 0.0, 1.0);
                        }
                        else {
                            //Lo += inLightAmbient[i].rgb * albedo;
                            if (i==inShadowLightIndex) {
                                shadowColor = vec3(1.0);
                            }
                            else {
                                shadowColor *= vec3(1.0/${ numLights }.0 );
                            } 
                            
                            continue;
                        }
                    }
                    else if (inLightType[i]==${ bg.base.LightType.DIRECTIONAL}) {
                        L = normalize(-inLightDirection[i]);
                        H = normalize(V + L);
                    }
                    
                    float distance    = length(inLightPosition[i] - worldPos);
                    float attenuation = 1.0 / distance * distance;
                    vec3 radiance     = inLightDiffuse[i].rgb * attenuation * inLightIntensity[i];
                    
                    // cook-torrance brdf
                    float NDF = distributionGGX(N, H, roughness);        
                    float G   = geometrySmith(N, V, L, roughness);

                    vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
                    
                    vec3 kS = F;
                    vec3 kD = vec3(1.0) - kS;
                    kD *= 1.0 - metallic;	  
                    
                    vec3 numerator    = NDF * G * F;
                    float denominator = 4.0 * max(dot(N, V), 0.4) * max(dot(N, L), 0.4);
                    vec3 specular     = numerator / max(denominator, 0.0001) * pow(shadowColor,vec3(30.0)) * inLightIntensity[i];

                    // add to outgoing radiance Lo
                    float NdotL = max(dot(N, L), 0.0);
                    vec3 color = (kD * albedo / ${ Math.PI } + specular) * radiance * NdotL * intensity;
                    // vec3 ambient = inLightAmbient[i].rgb * albedo;
                    // vec3 shadowAmbient = clamp(shadowColor,ambient,vec3(1.0));
                    // color = min(color,shadowAmbient);
                    Lo += clamp(color,0.0,1.0);
                } 
                vec3 kS = fresnelSchlickRoughness(max(dot(N,V), 0.001), F0, roughness);

                vec3 kD = 1.0 - kS;
                kD *= 1.0 - metallic;

                vec3 R = reflect(worldPos - camPos, N);

                vec3 specMap0 = textureCube(inSpecularMap0,R).rgb;
                vec3 specMap1 = textureCube(inSpecularMap1,R).rgb;
                vec3 specMap2 = textureCube(${ s_supportedTextureUnits>8 ? "inSpecularMap2" : "inSpecularMap1" },R).rgb;

                vec3 prefilteredColor = vec3(0.0);
                if (roughness<${ s_supportedTextureUnits>8 ? 0.333 : 0.5 }) {
                    prefilteredColor = mix(specMap0,specMap1,roughness/${ s_supportedTextureUnits>8 ? 0.333 : 0.5 });
                }
                else {
                    prefilteredColor = mix(specMap1,specMap2,(roughness - ${ s_supportedTextureUnits>8 ? 0.333 : 0.5 }) / ${ s_supportedTextureUnits>8 ? 0.666 : 0.5 });
                }
            
                vec2 envBRDF = texture2D(inBRDF, vec2(min(max(dot(N,V), 0.0), 0.99), min(roughness,0.99))).rg;
                vec3 specular = prefilteredColor * (F0 * envBRDF.x + envBRDF.y) * shadowColor * fresnelColor;

                vec3 irradiance = textureCube(inIrradianceMap,N).rgb * inIrradianceMapIntensity;
	            vec3 diffuse = (irradiance * 1.0/shadowColor) * (albedo * shadowColor) * shadowColor;
	            vec3 irradianceAmbient = (kD * diffuse + specular); // TODO: * ao;
            
                return vec4(irradianceAmbient + Lo, 1.0);
                `;
                fragSrc.addFunction({
                    returnType:"vec4", name:"irradiance", params: {
                        normal:"vec3",
                        fresnelColor:"vec3",
                        camPos:"vec3",
                        albedo:"vec3",
                        worldPos:"vec3",
                        metallic:"float",
                        roughness:"float",
                        shadowColor:"vec3",
                        texCoord:"vec2"
                    }, body: irradianceBody
                });

                fragSrc.setMainBody(`
                    // Shader for ${ numLights } lights 

                    vec2 diffuseUV = inDiffuseUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 metallicUV = inMetallicUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 roughnessUV = inRoughnessUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 fresnelUV = inFresnelUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 heightUV = inHeightUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 aoUV = inAmbientOcclussionUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 lightEmissionUV = inLightEmissionUV==0 ? fsTex0Coord : fsTex1Coord;
                    vec2 normalUV = inNormalUV==0 ? fsTex0Coord : fsTex1Coord;
                    
                    vec3 viewDir = -normalize(fsTangentFragPos - fsTangentViewPos);
                    float height = samplerColor(inHeighMetallicRoughnessAO,heightUV,inHeightScale).x;
                    vec2 texCoords = parallaxMapping(-height,diffuseUV, viewDir, inHeightIntensity, inHeightScale);

                    metallicUV = parallaxMapping(-height,metallicUV,viewDir,inHeightIntensity,inHeightScale);
                    roughnessUV = parallaxMapping(-height,roughnessUV,viewDir,inHeightIntensity,inHeightScale);
                    normalUV = parallaxMapping(-height,normalUV,viewDir,inHeightIntensity,inHeightScale);

                    vec4 hmrao = samplerColor(inHeighMetallicRoughnessAO,texCoords,inDiffuseScale);
                    float metallic = samplerColor(inHeighMetallicRoughnessAO,metallicUV,inMetallicScale).y;
                    float roughness = samplerColor(inHeighMetallicRoughnessAO,roughnessUV,inRoughnessScale).z;
                    float ao = texture2D(inHeighMetallicRoughnessAO,aoUV).w;

                    vec4 diffuseRaw = samplerColor(inDiffuse,texCoords,inDiffuseScale);
                    vec4 diffuse = inverseGammaCorrection(diffuseRaw,inGammaCorrection);
                    if (diffuse.a>inAlphaCutoff) {
                        if (inUnlit==true) {
                            gl_FragColor = diffuseRaw;
                        }
                        else {
                            vec3 normalMap = samplerNormal(inNormalMap,normalUV,inNormalScale);
                            vec3 frontFacingNormal = fsNormal;
                            // There is a bug on Mac Intel GPUs that produces an invalid value of gl_FrontFacing
                            //if (!gl_FrontFacing) {
                                //frontFacingNormal *= -1.0;
                            //}
        
                            vec3 combinedNormal = combineNormalWithMap(frontFacingNormal,fsTangent,fsBitangent,normalMap);   
        
                            vec4 shadowColor = vec4(1.0);
                            if (inReceiveShadows) {
                                shadowColor = getShadowColor(fsVertexPosFromLight,inShadowMap,inShadowMapSize,inShadowType,inShadowStrength * (1.0 - metallic * 1.5),inShadowBias,inShadowColor);
                            }
        
                            vec4 lighting = irradiance(combinedNormal,inFresnel.rgb,vec3(0.0),diffuse.rgb,fsPosition,metallic,roughness,shadowColor.rgb,texCoords);
        
                            vec4 result = vec4(lighting.rgb * ao, 1.0);
        
                            result = gammaCorrection(result,inGammaCorrection);
                            gl_FragColor = vec4((brightnessMatrix(inBrightness - 1.0) *
                                    contrastMatrix(inContrast) *
                                    saturationMatrix(inSaturation) *
                                    result).rgb, diffuse.a);
                        }
                    }
                    else {
                        discard;
                    }
                `);
            }
        }
        return s_fragmentSources[numLights - 1];
    }

    let s_brdfPrecomputedTextureLoad = false;
    let s_brdfPrecomputedTexture = null;


    class PBRForwardEffect extends bg.base.Effect {
        get vertexSourceCode() {
            return s_vertexSource;
        }

        get fragmentSourceCodes() {
            return s_fragmentSources;
        }

        constructor(context) {
            super(context);
            this._material = null;
            s_supportedTextureUnits = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
            if (s_supportedTextureUnits<8) {
                throw new Error("Could not use PBR materials: not enought texture units available");
            }

            this._light = null;
            this._lightTransform = bg.Matrix4.Identity();

            this._lightArray = new bg.base.LightArray();

            this._shadowMap = null;

            // Generate one shader for each number of lights. Each shader have 
            // a fixed number of lights sources, to avoid use loops and conditional
            // instructions inside the shader
            for (let i = 1; i<=bg.base.MAX_FORWARD_LIGHTS; ++i) {
                this.setupShaderSource([
                    vertexShaderSource(),
                    fragmentShaderSource(i)
                ]);
            }

            if (!s_brdfPrecomputedTextureLoad) {
                s_brdfPrecomputedTextureLoad = true;
                //s_brdfPrecomputedTexture = bg.base.TextureCache.WhiteTexture(context);
                s_brdfPrecomputedTexture = bg.base.TextureCache.PrecomputedBRDFLookupTexture(context);
                // bg.base.Loader.Load(this.context,"../data/ibl_brdf_lut.png")
                //     .then((texture) => {
                //         s_brdfPrecomputedTexture = texture;
                //     })

                //     .catch((err) => {
                //         console.error(err.message);
                //     })
            }
        
            this._colorCorrection = this._colorCorrection || {
                gamma: 2.0,
                saturation: 1,
                brightness: 1,
                contrast: 1
            }
        }

        get material() { return this._material; }
        set material(m) { this._material = m; }

        get colorCorrection() { return this._colorCorrection; }
        set colorCorrection(cc) { this._colorCorrection = cc; }

        // Individual light mode
		get light() { return this._light; }
		set light(l) { this._light = l; this._lightArray.reset(); }
		get lightTransform() { return this._lightTransform; }
		set lightTransform(trx) { this._lightTransform = trx; this._lightArray.reset();}

		// Multiple light mode: use light arrays
		get lightArray() { return this._lightArray; }

        set shadowMap(sm) { this._shadowMap = sm; }
        get shadowMap() { return this._shadowMap; }

        setActive() {
            let numLights = 0
            if (this._light) {
                this.lightArray.reset();
                this.lightArray.push(this.light,this.lightTransform);
                
            }
            numLights = Math.min(this.lightArray.numLights,bg.base.MAX_FORWARD_LIGHTS);
            
            // Set the appropiate shader for the current number of enabled lights
            if (numLights>0) {
                this.setCurrentShader(numLights - 1);
            }
            super.setActive();
        }

        beginDraw() {

            if (this.lightArray.numLights && this.lightArray.numLights<bg.base.MAX_FORWARD_LIGHTS) {
                
                let matrixState = bg.base.MatrixState.Current();
                let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);

                this.lightArray.updatePositionAndDirection(viewMatrix);

                // Forward render only supports one shadow map
				let lightTransform = this.shadowMap ? this.shadowMap.viewMatrix : this.lightArray.shadowLightTransform;
				this.shader.setMatrix4("inLightProjectionMatrix", this.shadowMap ? this.shadowMap.projection : this.lightArray.shadowLight.projection);
                let shadowColor = this.shadowMap ? this.shadowMap.shadowColor : bg.Color.Transparent();
                let blackTex = bg.base.TextureCache.BlackTexture(this.context);
                this.shader.setMatrix4("inLightViewMatrix",lightTransform);
                this.shader.setValueInt("inShadowType",this._shadowMap ? this._shadowMap.shadowType : 0);
                this.shader.setTexture("inShadowMap",this._shadowMap ? this._shadowMap.texture : blackTex,bg.base.TextureUnit.TEXTURE_0);
				this.shader.setVector2("inShadowMapSize",this._shadowMap ? this._shadowMap.size : new bg.Vector2(32,32));
				this.shader.setValueFloat("inShadowStrength",this.lightArray.shadowLight.shadowStrength);
				this.shader.setVector4("inShadowColor",shadowColor);
				this.shader.setValueFloat("inShadowBias",this.lightArray.shadowLight.shadowBias);
                this.shader.setValueInt("inCastShadows",this.lightArray.shadowLight.castShadows);
                this.shader.setVector3("inShadowLightDirection",this.lightArray.shadowLightDirection);
                this.shader.setValueInt("inShadowLightIndex",this.lightArray.shadowLightIndex);


                this.shader.setValueIntPtr('inLightType',this.lightArray.type);
                this.shader.setVector4Ptr('inLightDiffuse',this.lightArray.diffuse);
                this.shader.setVector4Ptr('inLightSpecular',this.lightArray.specular);
                this.shader.setVector3Ptr('inLightPosition',this.lightArray.position);
                this.shader.setVector3Ptr('inLightDirection',this.lightArray.direction);
                this.shader.setValueFloatPtr('inLightIntensity',this.lightArray.intensity);
                this.shader.setValueFloatPtr('inLightSpotCutoff',this.lightArray.cosSpotCutoff);
                this.shader.setValueFloatPtr('inLightOuterSpotCutoff',this.lightArray.cosSpotExponent);

                this.shader.setValueFloat('inGammaCorrection',this.colorCorrection.gamma);    
                this.shader.setValueFloat('inSaturation', this.colorCorrection.saturation);
                this.shader.setValueFloat('inBrightness',this.colorCorrection.brightness);
                this.shader.setValueFloat('inContrast',this.colorCorrection.contrast);
            }
        }

        setupVars() {
            let material = this.material;
            if (!(material instanceof bg.base.PBRMaterial) && !material.pbr) {
                material.pbr = material.pbr || bg.base.PBRMaterial.ImportFromLegacyMaterial(this.context,material);
                material = material.pbr;
            }
            else  if (material.pbr) {
                material.pbr.updateFromLegacyMaterial(this.context,material);
                material = material.pbr;
            }

            if (material instanceof bg.base.PBRMaterial) {
                let matrixState = bg.base.MatrixState.Current();
                let viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
                this.shader.setMatrix4('inModelMatrix',matrixState.modelMatrixStack.matrixConst);
                this.shader.setMatrix4('inViewMatrix',viewMatrix);
                this.shader.setMatrix4('inProjectionMatrix',matrixState.projectionMatrixStack.matrixConst);
                this.shader.setMatrix4('inNormalMatrix',matrixState.normalMatrix);
                this.shader.setMatrix4('inViewMatrixInv',matrixState.viewMatrixInvert);

                let shaderParams = material.getShaderParameters(this.context);
            
                
                // Scales
                this.shader.setVector2("inDiffuseScale",shaderParams.diffuseScale);
                this.shader.setVector2("inMetallicScale",shaderParams.metallicScale);
                this.shader.setVector2("inRoughnessScale",shaderParams.roughnessScale);
                this.shader.setVector2("inFresnelScale",shaderParams.fresnelScale);
                this.shader.setVector2("inLightEmissionScale",shaderParams.lightEmissionScale);
                this.shader.setVector2("inHeightScale",shaderParams.heightScale);
                this.shader.setVector2("inNormalScale",shaderParams.normalScale);

                // UV sets
                this.shader.setValueInt("inDiffuseUV",shaderParams.diffuseUV);
                this.shader.setValueInt("inMetallicUV",shaderParams.metallicUV);
                this.shader.setValueInt("inRoughnessUV",shaderParams.roughnessUV);
                this.shader.setValueInt("inFresnelUV",shaderParams.fresnelUV);
                this.shader.setValueInt("inLightEmissionUV",shaderParams.lightEmissionUV);
                this.shader.setValueInt("inAmbientOcclussionUV",shaderParams.ambientOcclussionUV);
                this.shader.setValueInt("inNormalUV",shaderParams.normalUV);
                this.shader.setValueInt("inHeightUV",shaderParams.heightUV);

                this.shader.setValueInt("inReceiveShadows",true);
                this.shader.setValueInt("inUnlit",material.unlit);
                this.shader.setValueFloat("inHeightIntensity",material.heightIntensity);
                this.shader.setValueFloat("inAlphaCutoff",material.alphaCutoff);

                // Texture maps
                let textureUnit = bg.base.TextureUnit.TEXTURE_1;    // TEXTURE_0 is used in beginDraw()
                //let textureUnit = bg.base.TextureUnit.TEXTURE_0;    // TEXTURE_0 is used in beginDraw()
                this.shader.setTexture("inDiffuse",shaderParams.diffuse.map,textureUnit++);
                this.shader.setTexture("inHeighMetallicRoughnessAO",shaderParams.heightMetallicRoughnessAO.map,textureUnit++);
                this.shader.setTexture("inNormalMap",shaderParams.normal.map,textureUnit++);
                let fresnel = material.fresnel instanceof bg.Color ? material.fresnel : bg.Color.White();
                this.shader.setVector4("inFresnel",fresnel);

                let defaultMap = bg.base.TextureCache.BlackCubemap(this.context);
                let irradianceMap = defaultMap;
                let specMap0 = defaultMap;
                let specMap1 = defaultMap;
                let specMap2 = defaultMap;
                let env = bg.scene.Environment.Get();
                let irradianceIntensity = 1;
                if (env && env.environment) {
                    irradianceMap = env.environment.irradianceMapTexture || irradianceMap;
                    specMap0 = env.environment.specularMapTextureL0 || specMap0;
                    specMap1 = env.environment.specularMapTextureL1 || specMap1;
                    specMap2 = env.environment.specularMapTextureL2 || specMap2;
                    irradianceIntensity = env.environment.irradianceIntensity;
                }

                this.shader.setValueFloat("inIrradianceMapIntensity",irradianceIntensity);
                this.shader.setTexture("inIrradianceMap",irradianceMap,textureUnit++);
                this.shader.setTexture("inSpecularMap0",specMap0,textureUnit++);
                if (s_supportedTextureUnits>8) {
                    this.shader.setTexture("inSpecularMap1",specMap1,textureUnit++);
                    this.shader.setTexture("inSpecularMap2",specMap2,textureUnit++);
                }
                else {
                    this.shader.setTexture("inSpecularMap1",specMap1,textureUnit++);
                }

                this.shader.setTexture("inBRDF",s_brdfPrecomputedTexture,textureUnit++);
            }
            else {
                console.warn("Using invalid material or no PBRMaterial on PBR renderer.");
            }
        }
    }

    bg.base.PBRForwardEffect = PBRForwardEffect;
})();