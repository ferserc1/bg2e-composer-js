(function() {
	class BoundingBox {
		constructor(drawableOrPlist, transformMatrix) {
			this._min = new bg.Vector3(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);
			this._max = new bg.Vector3(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);
			this._center = null;
			this._size = null;
			this._halfSize = null;

			this._vertexArray = [];
			transformMatrix = transformMatrix || bg.Matrix4.Identity();
			if (drawableOrPlist instanceof bg.scene.Drawable) {
				this.addDrawable(drawableOrPlist,transformMatrix);
			}
			else if (drawableOrPlist instanceof bg.base.PolyList) {
				this.addPolyList(drawableOrPlist,transformMatrix);
			}
		}

		clear() {
			this._min = bg.Vector3(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);
			this._max = bg.Vector3(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);
			this._center = this._size = this._halfSize = null;
		}

		get min() { return this._min; }
		get max() { return this._max; }
		get center() {
			if (!this._center) {
				let s = this.halfSize;
				this._center = bg.Vector3.Add(this.halfSize, this._min);
			}
			return this._center;
		}

		get size() {
			if (!this._size) {
				this._size = bg.Vector3.Sub(this.max, this.min);
			}
			return this._size;
		} 

		get halfSize() {
			if (!this._halfSize) {
				this._halfSize = new bg.Vector3(this.size);
				this._halfSize.scale(0.5);
	 		}
			return this._halfSize;
		}

		addPolyList(polyList, trx) {
			this._center = this._size = this._halfSize = null;
			for (let i = 0; i<polyList.vertex.length; i+=3) {
				let vec = trx.multVector(new bg.Vector3(polyList.vertex[i],
														polyList.vertex[i + 1],
														polyList.vertex[i + 2]));
				if (vec.x<this._min.x) this._min.x = vec.x;
				if (vec.y<this._min.y) this._min.y = vec.y;
				if (vec.z<this._min.z) this._min.z = vec.z;
				if (vec.x>this._max.x) this._max.x = vec.x;
				if (vec.z>this._max.z) this._max.z = vec.z;
				if (vec.y>this._max.y) this._max.y = vec.y;
			}
		}

		addDrawable(drawable, trxBase) {
			drawable.forEach((plist,mat,elemTrx) => {
                if (plist.visible) {
                    let trx = new bg.Matrix4(trxBase);
                    if (elemTrx) trx.mult(elemTrx);
                    this.addPolyList(plist,trx);
                }
			});
		}
	}

	bg.tools.BoundingBox = BoundingBox;
})();