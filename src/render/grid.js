app.addDefinitions(() => {
    app.render = app.render || {};

    function getGrid() {
        let vector = [];
        let gridIterations = Math.floor(this._planeSize / this._gridSize);
        let maxX = maxZ = gridIterations * this._gridSize / 2;
        let minX = minZ = -maxX;
        let curX = curZ = minX;

        for (let i = 0; i<=gridIterations; ++i) {
            vector.push(minX); vector.push(0); vector.push(this._gridSize * i + minZ);
            vector.push(maxX); vector.push(0); vector.push(this._gridSize * i + minZ);
            vector.push(this._gridSize * i + minX); vector.push(0); vector.push(minZ);
            vector.push(this._gridSize * i + minX); vector.push(0); vector.push(maxZ);
        }        
        return vector;
    }

    class Grid extends bg.scene.Drawable {
        constructor() {
            super();
            this._gridSize = 2.5;
            this._planeSize = 100;
        }

        set gridSize(size) {
            if (size<0.1) return;
            this._gridSize = size;
            if (this.node) {
                this.rebuildGrid();
            }
        }

        set planeSize(size) {
            if (size<1) return;
            this._planeSize = size;
            if (this.node) {
                this.rebuildGrid();
            }
        }
        
        get gridSize() { return this._gridSize; }
        get planeSize() { return this._planeSize; }

        rebuildGrid() {
            if (this.node) {
                if (this._plist) {
                    this.removePolyList(this._plist);
                    this._plist.destroy();
                    this._plist = null;
                }
                let plist = new bg.base.PolyList(this.node.context);
    
                let vertex = getGrid.apply(this);
                let normal = [];
                let uv0 = [];
                let uv1 = [];
                let color = [];
                let index = [];

                for (let i = 0; i<vertex.length; i+=3) {
                    normal.push(0); normal.push(1); normal.push(0);
                    uv0.push(0); uv0.push(0);
                    uv1.push(0); uv1.push(0);
                    color.push(1); color.push(1); color.push(1); color.push(1);
                    index.push(index.length);
                }
                plist.vertex = vertex;
                plist.normal = normal;
                plist.texCoord0 = uv0;
                plist.texCoord1 = uv1;
                plist.color = color;
                plist.index = index;
                plist.drawMode = bg.base.DrawMode.LINES;
                plist.build();
    
                let mat = new bg.base.Material();
                mat.cullFace = false;
                mat.unlit = true;
                mat.castShadows = false;
                mat.receiveShadows = false;
                mat.diffuse = new bg.Color(0.6,0.6,0.6,1);
                this.addPolyList(plist,mat);
    
                this._plist = plist;
            }
        }

        init() {
            this.rebuildGrid();
        }

        display(pipeline,matrixState) {
            if (this._plist) {
                super.display(pipeline,matrixState);
            }
        }

        // Do not save or restore this component
        get shouldSerialize() { return false; }
    }

    bg.scene.registerComponent(app.render,Grid,"app.ui.Grid");

})