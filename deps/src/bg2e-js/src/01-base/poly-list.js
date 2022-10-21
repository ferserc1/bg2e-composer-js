(function() {
	
	bg.base.BufferType = {
		VERTEX:		1 << 0,
		NORMAL:		1 << 1,
		TEX_COORD_0:		1 << 2,
		TEX_COORD_1:		1 << 3,
		TEX_COORD_2:		1 << 4,
		COLOR:		1 << 5,
		TANGENT:	1 << 6,
		INDEX:		1 << 7
	};
	
	class PolyListImpl {
		constructor(context) {
			this.initFlags(context);
		}
		
		initFlags(context) {}
		create(context) {}
		build(context,plist,vert,norm,t0,t1,t2,col,tan,index) { return false; }
		draw(context,plist,drawMode,numberOfIndex) {}
		destroy(context,plist) {}

		// NOTE: the new buffer data must have the same size as the old one
		update(context,plist,bufferType,newData) {}
	}

	function createTangents(plist) {
		if (!plist.texCoord0 || !plist.vertex) return;
		plist._tangent = [];
		
		let result = [];
		let generatedIndexes = {};
		let invalidUV = false;
		if (plist.index.length%3==0) {
			for (let i=0; i<plist.index.length; i+=3) {
				let v0i = plist.index[i] * 3;
				let v1i = plist.index[i + 1] * 3;
				let v2i = plist.index[i + 2] * 3;
				
				let t0i = plist.index[i] * 2;
				let t1i = plist.index[i + 1] * 2;
				let t2i = plist.index[i + 2] * 2;
				
				let v0 = new bg.Vector3(plist.vertex[v0i], plist.vertex[v0i + 1], plist.vertex[v0i + 2]);
				let v1 = new bg.Vector3(plist.vertex[v1i], plist.vertex[v1i + 1], plist.vertex[v1i + 2]);
				let v2 = new bg.Vector3(plist.vertex[v2i], plist.vertex[v2i + 1], plist.vertex[v2i + 2]);
				
				let t0 = new bg.Vector2(plist.texCoord0[t0i], plist.texCoord0[t0i + 1]);
				let t1 = new bg.Vector2(plist.texCoord0[t1i], plist.texCoord0[t1i + 1]);
				let t2 = new bg.Vector2(plist.texCoord0[t2i], plist.texCoord0[t2i + 1]);
				
				let edge1 = (new bg.Vector3(v1)).sub(v0);
				let edge2 = (new bg.Vector3(v2)).sub(v0);
				
				let deltaU1 = t1.x - t0.x;
				let deltaV1 = t1.y - t0.y;
				let deltaU2 = t2.x - t0.x;
				let deltaV2 = t2.y - t0.y;
				
				let den = (deltaU1 * deltaV2 - deltaU2 * deltaV1);
				let tangent = null;
				if (den==0) {
					let n = new bg.Vector3(plist.normal[v0i], plist.normal[v0i + 1], plist.normal[v0i + 2]);

					invalidUV = true;
					tangent = new bg.Vector3(n.y, n.z, n.x);
				}
				else {
					let f = 1 / den;
				
					tangent = new bg.Vector3(f * (deltaV2 * edge1.x - deltaV1 * edge2.x),
												   f * (deltaV2 * edge1.y - deltaV1 * edge2.y),
												   f * (deltaV2 * edge1.z - deltaV1 * edge2.z));
					tangent.normalize();
				}
				
				if (generatedIndexes[v0i]===undefined) {
					result.push(tangent.x);
					result.push(tangent.y);
					result.push(tangent.z);
					generatedIndexes[v0i] = tangent;
				}
				
				if (generatedIndexes[v1i]===undefined) {
					result.push(tangent.x);
					result.push(tangent.y);
					result.push(tangent.z);
					generatedIndexes[v1i] = tangent;
				}
				
				if (generatedIndexes[v2i]===undefined) {
					result.push(tangent.x);
					result.push(tangent.y);
					result.push(tangent.z);
					generatedIndexes[v2i] = tangent;
				}
			}
		}
		else {	// other draw modes: lines, line_strip
			for (let i=0; i<plist.vertex.length; i+=3) {
				plist._tangent.push(0,0,1);
			}
		}
		if (invalidUV) {
			console.warn("Invalid UV texture coords found. Some objects may present artifacts in the lighting, and not display textures properly.")
		}
		return result;
	}
	
	bg.base.PolyListImpl = PolyListImpl;
	
	bg.base.DrawMode = {
		TRIANGLES: null,
		TRIANGLE_FAN: null,
		TRIANGLE_STRIP: null,
		LINES: null,
		LINE_STRIP: null
	};
	
	class PolyList extends bg.app.ContextObject {
		constructor(context) {
			super(context);
			
			this._plist = null;
			
			this._drawMode = bg.base.DrawMode.TRIANGLES;
			
			this._name = "";
			this._groupName = "";
			this._visible = true;
			this._visibleToShadows = true;
			
			this._vertex = [];
			this._normal = [];
			this._texCoord0 = [];
			this._texCoord1 = [];
			this._texCoord2 = [];
			this._color = [];
			this._tangent = [];
			this._index = [];
		}
		
		clone() {
			let pl2 = new PolyList(this.context);
			
			let copy = function(src,dst) {
				src.forEach(function(item) {
					dst.push(item);
				});
			};
			
			pl2.name = this.name + " clone";
			pl2.groupName = this.groupName;
			pl2.visible = this.visible;
			pl2.visibleToShadows = this.visibleToShadows;
			pl2.drawMode = this.drawMode;
			
			copy(this.vertex,pl2.vertex);
			copy(this.normal,pl2.normal);
			copy(this.texCoord0,pl2.texCoord0);
			copy(this.texCoord1,pl2.texCoord1);
			copy(this.texCoord2,pl2.texCoord02);
			copy(this.color,pl2.color);
			copy(this.index,pl2.index);
			pl2.build();
			
			return pl2;
		}
		
		get name() { return this._name; }
		set name(n) { this._name = n; }
		
		get groupName() { return this._groupName; }
		set groupName(n) { this._groupName = n; }
		
		get visible() { return this._visible; }
		set visible(v) { this._visible = v; }

		get visibleToShadows() { return this._visibleToShadows; }
		set visibleToShadows(v) { this._visibleToShadows = v; }
		
		get drawMode() { return this._drawMode; }
		set drawMode(m) { this._drawMode = m; }
		
		set vertex(v) { this._vertex = v; }
		set normal(n) { this._normal = n; }
		set texCoord0(t) { this._texCoord0 = t; }
		set texCoord1(t) { this._texCoord1 = t; }
		set texCoord2(t) { this._texCoord2 = t; }
		set color(c) { this._color = c; }
		set tangent(t) { this._tangent = t; }
		set index(i) { this._index = i; }
		
		get vertex() { return this._vertex; }
		get normal() { return this._normal; }
		get texCoord0() { return this._texCoord0; }
		get texCoord1() { return this._texCoord1; }
		get texCoord2() { return this._texCoord2; }
		get color() { return this._color; }
		get tangent() { return this._tangent; }
		get index() { return this._index; }
		
		get vertexBuffer() { return this._plist.vertexBuffer; }
		get normalBuffer() { return this._plist.normalBuffer; }
		get texCoord0Buffer() { return this._plist.tex0Buffer; }
		get texCoord1Buffer() { return this._plist.tex1Buffer; }
		get texCoord2Buffer() { return this._plist.tex2Buffer; }
		get colorBuffer() { return this._plist.colorBuffer; }
		get tangentBuffer() { return this._plist.tangentBuffer; }
		get indexBuffer() { return this._plist.indexBuffer; }

		// Note that the new buffer must have the same size as the old one, this
		// function is intended to be used only to replace the buffer values
		updateBuffer(bufferType,newData) {
			let status = false;
			switch (bufferType) {
			case bg.base.BufferType.VERTEX:
				status = this.vertex.length==newData.length;
				break;
			case bg.base.BufferType.NORMAL:
				status = this.normal.length==newData.length;
				break;
			case bg.base.BufferType.TEX_COORD_0:
				status = this.texCoord0.length==newData.length;
				break;
			case bg.base.BufferType.TEX_COORD_1:
				status = this.texCoord1.length==newData.length;
				break;
			case bg.base.BufferType.TEX_COORD_2:
				status = this.texCoord2.length==newData.length;
				break;
			case bg.base.BufferType.COLOR:
				status = this.color.length==newData.length;
				break;
			case bg.base.BufferType.TANGENT:
				status = this.tangent.length==newData.length;
				break;
			case bg.base.BufferType.INDEX:
				status = this.index.length==newData.length;
				break;
			}
			if (!status) {
				throw new Error("Error updating buffer: The new buffer have different size as the old one.");
			}
			else {
				bg.Engine.Get().polyList.update(this.context,this._plist,bufferType,newData);
			}
		}
		
		build(buildTangents = true) {
			if (this.color.length==0) {
				// Ensure that the poly list have a color buffer
				for (let i = 0; i<this.vertex.length; i+=3) {
					this.color.push(1);
					this.color.push(1);
					this.color.push(1);
					this.color.push(1);
				}
			}

			let plistImpl = bg.Engine.Get().polyList;
			if (this._plist) {
				plistImpl.destroy(this.context, this._plist);
				this._tangent = [];
			}
			if (buildTangents || !this._tangent || this._tangent.length==0) {
				this._tangent = createTangents(this);
			}
			this._plist = plistImpl.create(this.context);
			return plistImpl.build(this.context, this._plist,
							this._vertex,
							this._normal,
							this._texCoord0,
							this._texCoord1,
							this._texCoord2,
							this._color,
							this._tangent,
							this._index);
		}
		
		draw() {
			bg.Engine.Get().polyList
				.draw(this.context,this._plist,this.drawMode,this.index.length);
		}
		
		destroy() {
			if (this._plist) {
				bg.Engine.Get().polyList
					.destroy(this.context, this._plist);
			}
			
			this._plist = null;
			
			this._name = "";
			this._vertex = [];
			this._normal = [];
			this._texCoord0 = [];
			this._texCoord1 = [];
			this._texCoord2 = [];
			this._color = [];
			this._tangent = [];
			this._index = [];
		}
		
		applyTransform(trx) {
			var transform = new bg.Matrix4(trx);
			var rotation = new bg.Matrix4(trx.getMatrix3());

			if (this.normal.length>0 && this.normal.length!=this.vertex.length)
				throw new Error("Unexpected number of normal coordinates found in polyList");
	
			for (let i=0;i<this.vertex.length-2;i+=3) {
				let vertex = new bg.Vector4(this.vertex[i],this.vertex[i+1], this.vertex[i+2], 1.0);
				vertex = transform.multVector(vertex);
				this.vertex[i] = vertex.x;
				this.vertex[i+1] = vertex.y;
				this.vertex[i+2] = vertex.z;
		
				if (this.normal.length) {
					var normal = new bg.Vector4(this.normal[i],this.normal[i+1], this.normal[i+2], 1.0);
					normal = rotation.multVector(normal);
					this.normal[i] = normal.x;
					this.normal[i+1] = normal.y;
					this.normal[i+2] = normal.z;
				}
			}
			this.build();
		}
		
		
	};
	
	bg.base.PolyList = PolyList;
	
})();