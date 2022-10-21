(function() {

    bg.tools = bg.tools || {};

    function packUVs(rect, t1, t2, uvs, pad) {
		let hpad = pad / 2;
		uvs[t1.uv0.x] = rect.left + pad; uvs[t1.uv0.y] = rect.top + hpad;
		uvs[t1.uv1.x] = rect.right - hpad; uvs[t1.uv1.y] = rect.top + hpad;
		uvs[t1.uv2.x] = rect.right - hpad; uvs[t1.uv2.y] = rect.bottom - pad;

		if (t2) {
			uvs[t2.uv0.x] = rect.right - pad; uvs[t2.uv0.y] = rect.bottom - hpad;
			uvs[t2.uv1.x] = rect.left + hpad; uvs[t2.uv1.y] = rect.bottom - hpad;
			uvs[t2.uv2.x] = rect.left + hpad; uvs[t2.uv2.y] = rect.top + pad;
		}
    }


    function atlasPolyList(vertex,index,padding=0) {
        let triangles = [];
        let uv = [];

        for (let i=0; i<index.length; i+=3) {
            let i0 = index[i];
            let i1 = index[i+1];
            let i2 = index[i+2];
            triangles.push({
                indices: [i0, i1, i2],
                uv0: { x:i0 * 2, y: i0 * 2 + 1 },
                uv1: { x:i1 * 2, y: i1 * 2 + 1 },
                uv2: { x:i2 * 2, y: i2 * 2 + 1 }
            });
        }

        let numQuads = triangles.length / 2 + triangles.length % 2;
        let rows = numQuads, cols = Math.round(Math.sqrt(numQuads));
        while(rows%cols) {
            cols--;
        }

        rows = cols;
        cols = numQuads / cols;

        let currentTriangle = 0;

        let w = 1 / cols;
        let h = 1 / rows;

        for (let i=0; i<rows; ++i) {
            for (let j=0; j<cols; ++j) {
                let rect = { left: w * j, top: h * i, right:w * j + w, bottom:h * i + h};
                let t1 = triangles[currentTriangle];
                let t2 = currentTriangle+1<triangles.length ? triangles[currentTriangle + 1] : null;
                packUVs(rect,t1,t2,uv,padding);
                currentTriangle+=2;
            }
        }

        return uv;
    }

    function generateLightmapQuads(drawable) {
        let triangleCount = 0;
        drawable.forEach((polyList) => {
            let numTriangles = (polyList.index.length / 3);
            // Avoid two poly list to share one quad
            if (numTriangles%2!=0) numTriangles++;
            triangleCount += numTriangles;
        });
        let numQuads = triangleCount / 2;
        let rows = numQuads, cols = Math.round(Math.sqrt(numQuads));
        while (rows%cols) {
            cols--;
        }

        rows = cols;
        cols = numQuads / cols;
        return {
            rows: rows,
            cols: cols,
            triangleCount: triangleCount,
            quadSize: {
                width: 1 / cols,
                height: 1 / rows
            },
            currentRow:0,
            currentCol:0,
            nextRect:function() {
                let rect = {
                    left: this.quadSize.width * this.currentCol,
                    top: this.quadSize.height * this.currentRow,
                    right: this.quadSize.width * this.currentCol + this.quadSize.width,
                    bottom: this.quadSize.height * this.currentRow + this.quadSize.height
                };
                if (this.currentCol<this.cols) {
                    this.currentCol++;
                }
                else {
                    this.currentCol = 0;
                    this.currentRow++;
                }
                if (this.currentRow>=this.rows) {
                    this.currentRow = 0;
                }
                return rect;
            }
        };
    }

    function atlasDrawable(drawable,padding) {
        let quadData = generateLightmapQuads(drawable);
        quadData.currentRow = 0;
        quadData.currentCol = 0;

        drawable.forEach((polyList) => {
            if (polyList.texCoord1.length>0) return;
            let triangles = [];
            let uv = [];
            for (let i=0; i<polyList.index.length; i+=3) {
                let i0 = polyList.index[i];
                let i1 = polyList.index[i + 1];
                let i2 = polyList.index[i + 2];
                triangles.push({
                    indices: [i0, i1, i2],
                    uv0: { x:i0 * 2, y:i0 * 2 + 1 },
                    uv1: { x:i1 * 2, y:i1 * 2 + 1 },
                    uv2: { x:i2 * 2, y:i2 * 2 + 1 }
                });
            }

            for (let i=0; i<triangles.length; i+=2) {
                let t1 = triangles[i];
                let t2 = i+1<triangles.length ? triangles[i+1] : null;
                let rect = quadData.nextRect();
                packUVs(rect,t1,t2,uv,padding);
            }

            polyList.texCoord1 = uv;
            polyList.build();
        });
    }
    
    bg.tools.UVMap = {
        atlas: function(vertexOrDrawable,indexOrPadding = 0,padding = 0) {
            if (vertexOrDrawable instanceof bg.scene.Drawable) {
                return atlasDrawable(vertexOrDrawable,indexOrPadding);
            }
            else {
                return atlasPolyList(vertexOrDrawable,indexOrPadding,padding);
            }
        }


    }
})();
