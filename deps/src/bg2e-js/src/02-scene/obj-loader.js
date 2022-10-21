(function() {
    function parseMTL_n(line) {
        let res = /newmtl\s+(.*)/.exec(line);
        if (res) {
            this._jsonData[res[1]] = JSON.parse(JSON.stringify(s_matInit));
            this._currentMat = this._jsonData[res[1]];
        }
    }

    function parseMTL_N(line) {
        let res = /Ns\s+([\d\.]+)/.exec(line);
        if (res) {  // Specular
            this._currentMat.shininess = Number(res[1]);
        }
        //else if ( (res=/Ni\s+([\d\.]+)/.exec(line)) ) {
        //}
    }

    function vectorFromRE(re) {
        return [
            Number(re[1]),
            Number(re[2]),
            Number(re[3]),
            re[4] ? Number(re[4]) : 1.0
        ]
    }

    function parseMTL_K(line) {
        let res = /Kd\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*([\d\.]*)/.exec(line);
        if (res) {
            // Diffuse
            let d = vectorFromRE(res);
            this._currentMat.diffuseR = d[0];
            this._currentMat.diffuseG = d[1];
            this._currentMat.diffuseB = d[2];
            this._currentMat.diffuseA = d[3];
        }
        else if ( (res = /Ks\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*([\d\.]*)/.exec(line)) ) {
            // Specular
            let s = vectorFromRE(res);
            this._currentMat.specularR = s[0];
            this._currentMat.specularG = s[1];
            this._currentMat.specularB = s[2];
            this._currentMat.specularA = s[3];
        }
    }

    function parseMTL_m(line) {
        let res = /map_Kd\s+(.*)/.exec(line);
        if (res) {
            let path = res[1];
            path = path.replace(/\\/g,'/');
            let slashIndex = path.lastIndexOf('/'); 
            if (slashIndex>=0) {
                path = path.substring(slashIndex + 1);
            }
            this._currentMat.texture = path;
        }
    }

    let s_matInit = {
        diffuseR: 1.0,
        diffuseG:1.0,
        diffuseB:1.0,
        diffuseA:1.0,
        
        specularR:1.0,
        specularG:1.0,
        specularB:1.0,
        specularA:1.0,
        
        shininess: 0,
        lightEmission: 0,
        
        refractionAmount: 0,
        reflectionAmount: 0,

        textureOffsetX: 0,
        textureOffsetY: 0,
        textureScaleX: 1,
        textureScaleY: 1,
        
        lightmapOffsetX: 0,
        lightmapOffsetY: 0,
        lightmapScaleX: 1,
        lightmapScaleY: 1,
        
        normalMapOffsetX: 0,
        normalMapOffsetY: 0,
        normalMapScaleX: 1,
        normalMapScaleY: 1,
        
        alphaCutoff: 0.5,
        castShadows: true,
        receiveShadows: true,
        
        shininessMaskChannel: 0,
        shininessMaskInvert: false,
        lightEmissionMaskChannel: 0,
        lightEmissionMaskInvert: false,

        reflectionMaskChannel: 0,
        reflectionMaskInvert: false,
    
        cullFace: true,

        texture: "",
        lightmap: "",
        normalMap: "",
        shininessMask: "",
        lightEmissionMask: "",
        reflectionMask: ""
    };

    class MTLParser {
        constructor(mtlData) {
            this._jsonData = {}
            this._currentMat = JSON.parse(JSON.stringify(s_matInit));
            let lines = mtlData.split('\n');

            lines.forEach((line) => {
                // First optimization: parse the first character and string lenght
                line = line.trim();
                if (line.length>1 && line[0]!='#') {
                    // Second optimization: parse by the first character
                    switch (line[0]) {
                    case 'n':
                        parseMTL_n.apply(this,[line]);
                        break;
                    case 'N':
                        parseMTL_N.apply(this,[line]);
                        break;
                    case 'm':
                        parseMTL_m.apply(this,[line]);
                        break;
                    case 'd':
                        break;
                    case 'T':
                        break;
                    case 'K':
                        parseMTL_K.apply(this,[line]);
                        break;
                    case 'i':
                        break;
                    case 'o':
                        break;
                    }
                }
            });
        }

        get jsonData() { return this._jsonData; }
    }

    function parseM(line) {
        // mtllib
        let res = /mtllib\s+(.*)/.exec(line);
        if (res) {
            this._mtlLib = res[1];
        }
    }

    function parseG(line) {
        // g
        let res = /g\s+(.*)/.exec(line);
        if (res) {
            this._currentPlist.name = res[1];
        }
    }

    function parseU(line) {
        // usemtl
        let res = /usemtl\s+(.*)/.exec(line);
        if (res) {
            this._currentPlist._matName = res[1];
            if (this._currentPlist.name=="") {
                this._currentPlist.name = res[1];
            }
        }
    }

    function parseS(line) {
        // s
        let res = /s\s+(.*)/.exec(line);
        if (res) {
            // TODO: Do something with smoothing groups
        }
    }

    function addPoint(pointData) {
        this._currentPlist.vertex.push(pointData.vertex[0],pointData.vertex[1],pointData.vertex[2]);
        if (pointData.normal) {
            this._currentPlist.normal.push(pointData.normal[0],pointData.normal[1],pointData.normal[2]);
        }
        if (pointData.tex) {
            this._currentPlist.texCoord0.push(pointData.tex[0],pointData.tex[1]);
        }
        this._currentPlist.index.push(this._currentPlist.index.length);
    }

    function isValid(point) {
        return point && point.vertex && point.tex && point.normal;
    }

    function addPolygon(polygonData) {
        let currentVertex = 0;
        let sides = polygonData.length;
        if (sides<3) return;
        while (currentVertex<sides) {
            let i0 = currentVertex;
            let i1 = currentVertex + 1;
            let i2 = currentVertex + 2;
            if (i2==sides) {
                i2 = 0;
            }
            else if (i1==sides) {
                i1 = 0;
                i2 = 2;
            }

            let p0 = polygonData[i0];
            let p1 = polygonData[i1];
            let p2 = polygonData[i2];

            if (isValid(p0) && isValid(p1) && isValid(p2)) {
                addPoint.apply(this,[p0]);
                addPoint.apply(this,[p1]);
                addPoint.apply(this,[p2]);
            }
            else {
                console.warn("Invalid point data found loading OBJ file");
            }
            currentVertex+=3;
        }
    }

    function parseF(line) {
        // f
        this._addPlist = true;
        let res = /f\s+(.*)/.exec(line);
        if (res) {
            let params = res[1];
            let vtnRE = /([\d\-]+)\/([\d\-]*)\/([\d\-]*)/g;
            if (params.indexOf('/')==-1) {
                let vRE = /([\d\-]+)/g;
            }
            let polygon = [];
            while ( (res=vtnRE.exec(params)) ) {
                let iV = Number(res[1]);
                let iN = res[3] ? Number(res[3]):null;
                let iT = res[2] ? Number(res[2]):null;
                iV = iV<0 ? this._vertexArray.length + iV : iV - 1;
                iN = iN<0 ? this._normalArray.length + iN : (iN===null ? null : iN - 1);
                iT = iT<0 ? this._texCoordArray.length + iT : (iT===null ? null : iT - 1)

                let v = this._vertexArray[iV];
                let n = iN!==null ? this._normalArray[iN] : null;
                let t = iT!==null ? this._texCoordArray[iT] : null;
                polygon.push({
                    vertex:v,
                    normal:n,
                    tex:t
                });
            }
            addPolygon.apply(this,[polygon]);
        }
    }

    function parseO(line) {
        // o
        let res = /s\s+(.*)/.exec(line);
        if (res && this._currentPlist.name=="") {
            this._currentPlist.name = res[1];
        }
    }

    function checkAddPlist() {
        if (this._addPlist) {
            if (this._currentPlist) {
                this._currentPlist.build();
                this._plistArray.push(this._currentPlist);
            }
            this._currentPlist = new bg.base.PolyList(this.context);
            this._addPlist = false;
        }
    }

    function parseMTL(mtlData) {
        let parser = new MTLParser(mtlData);
        return parser.jsonData;
    }

    class OBJParser {
        constructor(context,url) {
            this.context = context;
            this.url = url;

            this._plistArray = [];

            this._vertexArray = [];
            this._normalArray = [];
            this._texCoordArray = [];

            this._mtlLib = "";

            this._addPlist = true;
        }

        loadDrawableSync(data,name="Object") {
            let drawable = new bg.scene.Drawable(name);
            let lines = data.split('\n');

            let multiLine = "";
            lines.forEach((line) => {
                line = line.trim();

                // This section controls the break line character \
                // to concatenate this line with the next one
                if (multiLine) {
                    line = multiLine + line;
                }
                if (line[line.length-1]=='\\') {
                    line = line.substring(0,line.length-1);
                    multiLine += line;
                    return;
                }
                else {
                    multiLine = "";
                }

                // First optimization: parse the first character and string lenght
                if (line.length>1 && line[0]!='#') {
                    // Second optimization: parse by the first character
                    switch (line[0]) {
                    case 'v':
                        let res = /v\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line);
                        if (res) {
                            this._vertexArray.push(
                                [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                            );
                        }
                        else if ( (res = /vn\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                            this._normalArray.push(
                                [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                            );
                        }
                        else if ( (res = /vt\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                            this._texCoordArray.push(
                                [ Number(res[1]), Number(res[2]) ]
                            );
                        }
                        else {
                            console.warn("Error parsing line " + line);
                        }
                        break;
                    case 'm':
                        checkAddPlist.apply(this);
                        parseM.apply(this,[line]);
                        break;
                    case 'g':
                        checkAddPlist.apply(this);
                        parseG.apply(this,[line]);
                        break;
                    case 'u':
                        checkAddPlist.apply(this);
                        parseU.apply(this,[line]);
                        break;
                    case 's':
                        //checkAddPlist.apply(this);
                        parseS.apply(this,[line]);
                        break;
                    case 'f':
                        parseF.apply(this,[line]);
                        break;
                    case 'o':
                        checkAddPlist.apply(this);
                        parseO.apply(this,[line]);
                        break;
                    }
                }
            });

            if (this._currentPlist && this._addPlist) {
                this._currentPlist.build();
                this._plistArray.push(this._currentPlist);
            }

            function buildDrawable(plistArray,materials) {
                plistArray.forEach((plist) => {
                    let mat = new bg.base.Material();
                    let matData = materials[plist._matName];
                    if (matData) {
                        let url = this.url.substring(0,this.url.lastIndexOf('/') + 1);
                        bg.base.Material.GetMaterialWithJson(this.context,matData,url)
                            .then((material) => {
                                drawable.addPolyList(plist,material);
                            })
                    }
                    else {
                        drawable.addPolyList(plist,mat);
                    }
                });
            }

            
            buildDrawable.apply(this,[this._plistArray,{}]);
            return drawable;
        }

        loadDrawable(data) {
            return new Promise((resolve,reject) => {
                let name = this.url.replace(/[\\\/]/ig,'-');
                let drawable = new bg.scene.Drawable(name);
                let lines = data.split('\n');

                let multiLine = "";
                lines.forEach((line) => {
                    line = line.trim();

                    // This section controls the break line character \
                    // to concatenate this line with the next one
                    if (multiLine) {
                        line = multiLine + line;
                    }
                    if (line[line.length-1]=='\\') {
                        line = line.substring(0,line.length-1);
                        multiLine += line;
                        return;
                    }
                    else {
                        multiLine = "";
                    }

                    // First optimization: parse the first character and string lenght
                    if (line.length>1 && line[0]!='#') {
                        // Second optimization: parse by the first character
                        switch (line[0]) {
                        case 'v':
                            let res = /v\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line);
                            if (res) {
                                this._vertexArray.push(
                                    [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                                );
                            }
                            else if ( (res = /vn\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                                this._normalArray.push(
                                    [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                                );
                            }
                            else if ( (res = /vt\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                                this._texCoordArray.push(
                                    [ Number(res[1]), Number(res[2]) ]
                                );
                            }
                            else {
                                console.warn("Error parsing line " + line);
                            }
                            break;
                        case 'm':
                            checkAddPlist.apply(this);
                            parseM.apply(this,[line]);
                            break;
                        case 'g':
                            checkAddPlist.apply(this);
                            parseG.apply(this,[line]);
                            break;
                        case 'u':
                            checkAddPlist.apply(this);
                            parseU.apply(this,[line]);
                            break;
                        case 's':
                            //checkAddPlist.apply(this);
                            parseS.apply(this,[line]);
                            break;
                        case 'f':
                            parseF.apply(this,[line]);
                            break;
                        case 'o':
                            checkAddPlist.apply(this);
                            parseO.apply(this,[line]);
                            break;
                        }
                    }
                });

                if (this._currentPlist && this._addPlist) {
                    this._currentPlist.build();
                    this._plistArray.push(this._currentPlist);
                }

                function buildDrawable(plistArray,materials) {
                    plistArray.forEach((plist) => {
                        let mat = new bg.base.Material();
                        let matData = materials[plist._matName];
                        if (matData) {
                            let url = this.url.substring(0,this.url.lastIndexOf('/') + 1);
                            bg.base.Material.GetMaterialWithJson(this.context,matData,url)
                                .then((material) => {
                                    drawable.addPolyList(plist,material);
                                })
                        }
                        else {
                            drawable.addPolyList(plist,mat);
                        }
                    });
                }

                if (this._mtlLib) {
                    let locationUrl = this.url.substring(0,this.url.lastIndexOf("/"));
                    if (locationUrl.length>0 && locationUrl!='/') locationUrl += "/";
                    bg.utils.Resource.Load(locationUrl + this._mtlLib)
                        .then((data) => {
                            buildDrawable.apply(this,[this._plistArray,parseMTL(data)]);
                            resolve(drawable);
                        })
                        .catch(() => {
                            bg.log("Warning: no such material library file for obj model " + this.url);
                            buildDrawable.apply(this,[this._plistArray,{}]);
                            resolve(drawable);
                        });
                }
                else {
                    buildDrawable.apply(this,[this._plistArray,{}]);
                    resolve(drawable);
                }
            });
        }
    }

    bg.scene.OBJParser = OBJParser;

    class OBJLoaderPlugin extends bg.base.LoaderPlugin {
        acceptType(url,data) {
            return bg.utils.Resource.GetExtension(url)=="obj";
        }

        loadDataSync(context,data,name="Obj model") {
            try {
                let parser = new OBJParser(context,data);
                let resultNode = null;
                let drw = parser.loadDrawableSync(data,name);
                if (drw) {
                    resultNode = new bg.scene.Node(context,name);
                    resultNode.addComponent(drw);
                }
                return resultNode;
            }
            catch(e) {
                console.error(e);
            }
        }

        load(context,url,data) {
            return new Promise((resolve,reject) => {
                if (data) {
                    try {
                        let parser = new OBJParser(context,url);
                        let resultNode = null;
                        let basePath = url.split("/");
                        basePath.pop();
                        basePath = basePath.join("/") + '/';
                        let matUrl = url.split(".");
                        matUrl.pop();
                        matUrl.push("bg2mat");
                        matUrl = matUrl.join(".");
                        parser.loadDrawable(data)
                            .then((drawable) => {
                                let node = new bg.scene.Node(context,drawable.name);
                                node.addComponent(drawable);
                                resultNode = node;
                                return bg.utils.Resource.LoadJson(matUrl);
                            })

                            .then((matData) => {
                                let promises = [];
								try {
									let drw = resultNode.component("bg.scene.Drawable");
									drw.forEach((plist,mat)=> {
										let matDef = null;
										matData.some((defItem) => {
											if (defItem.name==plist.name) {
												matDef = defItem;
												return true;
											}
										});

										if (matDef) {
											let p = bg.base.Material.FromMaterialDefinition(context,matDef,basePath);
											promises.push(p)
											p.then((newMat) => {
                                                mat.assign(newMat);
                                            });
										}
									});
								}
								catch(err) {
									
								}
								return Promise.all(promises);
                            })

                            .then(() => {
                                resolve(resultNode);
                            })

                            .catch(() => {
                                // bg2mat file not found
                                resolve(resultNode)
                            })
                    }
                    catch(e) {
                        reject(e);
                    }
                }
                else {
                    reject(new Error("Error loading drawable. Data is null."));
                }
            });
        }
    }

    bg.base.OBJLoaderPlugin = OBJLoaderPlugin;
})();