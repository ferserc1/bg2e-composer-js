
(function() {
	class Vector {
		static MinComponents(v1,v2) {
			let length = Math.min(v1.length, v2.length);
			let result = null;
			switch (length) {
			case 2:
				result = new bg.Vector2();
				break;
			case 3:
				result = new bg.Vector3();
				break;
			case 4:
				result = new bg.Vector4();
				break;
			}

			for (let i=0; i<length; ++i) {
				result._v[i] = v1._v[i]<v2._v[i] ? v1._v[i] : v2._v[i];
			}
			return result;
		}

		static MaxComponents(v1,v2) {
			let length = Math.min(v1.length, v2.length);
			let result = null;
			switch (length) {
			case 2:
				result = new bg.Vector2();
				break;
			case 3:
				result = new bg.Vector3();
				break;
			case 4:
				result = new bg.Vector4();
				break;
			}

			for (let i=0; i<length; ++i) {
				result._v[i] = v1._v[i]>v2._v[i] ? v1._v[i] : v2._v[i];
			}
			return result;
		}

		constructor(v) {
			this._v = v;
		}
		
		get v() { return this._v; }
		
		get length() { return this._v.length; }
		
		get x() { return this._v[0]; }
		set x(v) { this._v[0] = v; }
		get y() { return this._v[1]; }
		set y(v) { this._v[1] = v; }

		get module() { return this.magnitude(); }

		toArray() {
			let result = [];
			for (let i=0; i<this.v.length; ++i) {
				result.push(this.v[i]);
			}
			return result;
		}
	}
	
	bg.VectorBase = Vector;
	bg.Vector = Vector;
	
	class Vector2 extends Vector {
		static Add(v1,v2) {
			return new Vector2(v1.x + v2.x, v1.y + v2.y);
		}

		static Sub(v1,v2) {
			return new Vector2(v1.x - v2.x, v1.y - v2.y);
		}

		static Distance(a,b) {
			return (new bg.Vector2(a._v[0] - b._v[0], a._v[1] - b._v[1])).magnitude();
		}

		static Dot(v1,v2) {
			return v1._v[0] * v2._v[0] + v1._v[1] * v2._v[1];
		}

		static Cross(v1,v2) {
			let x = v1._v[1] * v2._v[2] - v1._v[2] * v2._v[1];
			let y = v1._v[2] * v2._v[0] - v1._v[0] * v2._v[2];
			let z = v1._v[0] * v2._v[1] - v1._v[1] * v2._v[0];
			return new bg.Vector3(x, y, z);
		}

		constructor(x = 0,y) {
			super(new bg.Math.ArrayHighP(2));
			if (x instanceof Vector2) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
			}
			else if (Array.isArray(x) && x.length>=2) {
				this._v[0] = x[0];
				this._v[1] = x[1];
			}
			else {
				if (y===undefined) y=x;
				this._v[0] = x;
				this._v[1] = y;
			}
		}

		distance(other) {
			let v3 = new bg.Vector2(this._v[0] - other._v[0],
									  this._v[1] - other._v[1]);
			return v3.magnitude();
		}

		normalize() {
			let m = this.magnitude();
			this._v[0] = this._v[0]/m; this._v[1]=this._v[1]/m;
			return this;
		}

		add(v2) {
			this._v[0] += v2._v[0];
			this._v[1] += v2._v[1];
			return this;
		}

		sub(v2) {
			this._v[0] -= v2._v[0];
			this._v[1] -= v2._v[1];
			return this;
		}

		dot(v2) {
			return this._v[0] * v2._v[0] + this._v[1] * v2._v[1];
		}

		scale(scale) {
			this._v[0] *= scale; this._v[1] *= scale;
			return this;
		}

		magnitude() {
			return Math.sqrt(
				this._v[0] * this._v[0] +
				this._v[1] * this._v[1]
			)
		}

		elemAtIndex(i) { return this._v[i]; }
		equals(v) { return this._v[0]==v._v[0] && this._v[1]==v._v[1]; }
		notEquals(v) { return this._v[0]!=v._v[0] || this._v[1]!=v._v[1]; }
		assign(v) { this._v[0]=v._v[0]; this._v[1]=v._v[1]; }

		set(x, y) {
			if (y===undefined) y = x;
			this._v[0] = x; this._v[1] = y;
		}

		get width() { return this._v[0]; }
		get height() { return this._v[1]; }
		set width(v) { this._v[0] = v; }
		set height(v) { this._v[1] = v; }

		get aspectRatio() { return this._v[0]/this._v[1]; }

		isNan() { return isNaN(this._v[0]) || isNaN(this._v[1]); }

		toString() {
			return "[" + this._v + "]";
		}
	}
	
	bg.Vector2 = Vector2;
	
	class Vector3 extends Vector {
		static Add(v1,v2) {
			return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
		}

		static Sub(v1,v2) {
			return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
		}

		static Distance(a,b) {
			return (new bg.Vector3(a._v[0] - b._v[0], a._v[1] - b._v[1], a._v[2] - b._v[2])).magnitude();
		}

		static Dot(v1,v2) {
			return v1._v[0] * v2._v[0] + v1._v[1] * v2._v[1] + v1._v[2] * v2._v[2];
		}

		static Cross(v1,v2) {
			let x = v1._v[1] * v2._v[2] - v1._v[2] * v2._v[1];
			let y = v1._v[2] * v2._v[0] - v1._v[0] * v2._v[2];
			let z = v1._v[0] * v2._v[1] - v1._v[1] * v2._v[0];
			return new bg.Vector3(x, y, z);
		}


		constructor(x = 0, y = 0, z = 0) {
			super(new bg.Math.ArrayHighP(3));
			if (x instanceof Vector2) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
				this._v[2] = y;
			}
			else if (x instanceof Vector3) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
				this._v[2] = x._v[2];
			}
			else if (Array.isArray(x) && x.length>=3) {
				this._v[0] = x[0];
				this._v[1] = x[1];
				this._v[2] = x[2];
			}
			else {
				if (y===undefined) y=x;
				if (z===undefined) z=y;
				this._v[0] = x;
				this._v[1] = y;
				this._v[2] = z;
			}
		}
		
		get z() { return this._v[2]; }
		set z(v) { this._v[2] = v; }

		magnitude() {
			return Math.sqrt(
				this._v[0] * this._v[0] +
				this._v[1] * this._v[1] +
				this._v[2] * this._v[2]
			);
		}
		
		normalize() {
			let m = this.magnitude();
			this._v[0] = this._v[0]/m; this._v[1]=this._v[1]/m; this._v[2]=this._v[2]/m;
			return this;
		}

		distance(other) {
			let v3 = new bg.Vector3(this._v[0] - other._v[0],
									  this._v[1] - other._v[1],
									  this._v[2] - other._v[2]);
			return v3.magnitude();
		}

		add(v2) {
			this._v[0] += v2._v[0];
			this._v[1] += v2._v[1];
			this._v[2] += v2._v[2];
			return this;
		}

		sub(v2) {
			this._v[0] -= v2._v[0];
			this._v[1] -= v2._v[1];
			this._v[2] -= v2._v[2];
			return this;
		}

		dot(v2) {
			return this._v[0] * v2._v[0] + this._v[1] * v2._v[1] + this._v[2] * v2._v[2];
		}

		scale(scale) {
			this._v[0] *= scale; this._v[1] *= scale; this._v[2] *= scale;
			return this;
		}

		cross(/* Vector3 */ v2) {
			let x = this._v[1] * v2._v[2] - this._v[2] * v2._v[1];
			let y = this._v[2] * v2._v[0] - this._v[0] * v2._v[2];
			let z = this._v[0] * v2._v[1] - this._v[1] * v2._v[0];
			this._v[0]=x; this._v[1]=y; this._v[2]=z;
			return this;
		}

		elemAtIndex(i) { return this._v[i]; }
		equals(v) { return this._v[0]==v._v[0] && this._v[1]==v._v[1] && this._v[2]==v._v[2]; }
		notEquals(v) { return this._v[0]!=v._v[0] || this._v[1]!=v._v[1] || this._v[2]!=v._v[2]; }
		assign(v) { this._v[0]=v._v[0]; this._v[1]=v._v[1]; if (v._v.length>=3) this._v[2]=v._v[2]; }

		set(x, y, z) {
			this._v[0] = x;
			this._v[1] = (y===undefined) ? x:y;
			this._v[2] = (y===undefined) ? x:(z===undefined ? y:z);
		}

		get width() { return this._v[0]; }
		get height() { return this._v[1]; }
		get depth() { return this._v[2]; }
		
		set width(v) { this._v[0] = v; }
		set height(v) { this._v[1] = v; }
		set depth(v) { this._v[2] = v; }

		get xy() { return new bg.Vector2(this._v[0],this._v[1]); }
		get yz() { return new bg.Vector2(this._v[1],this._v[2]); }
		get xz() { return new bg.Vector2(this._v[0],this._v[2]); }

		isNan() { return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]); }

		toString() {
			return "[" + this._v + "]";
		}
	}
	
	bg.Vector3 = Vector3;
	
	class Vector4 extends Vector {
		static Add(v1,v2) {
			return new Vector4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
		}

		static Sub(v1,v2) {
			return new Vector4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w - v2.w);
		}

		static Yellow() { return new bg.Vector4(1.0,1.0,0.0,1.0); }
		static Orange() { return new bg.Vector4(1.0,0.5,0.0,1.0); }
		static Red() { return new bg.Vector4(1.0,0.0,0.0,1.0); }
		static Violet() { return new bg.Vector4(0.5,0.0,1.0,1.0); }
		static Blue() { return new bg.Vector4(0.0,0.0,1.0,1.0); }
		static Green() { return new bg.Vector4(0.0,1.0,0.0,1.0); }
		static White() { return new bg.Vector4(1.0,1.0,1.0,1.0); }
		static LightGray() { return new bg.Vector4(0.8,0.8,0.8,1.0); }
		static Gray() { return new bg.Vector4(0.5,0.5,0.5,1.0); }
		static DarkGray() { return new bg.Vector4(0.2,0.2,0.2,1.0); }
		static Black() { return new bg.Vector4(0.0,0.0,0.0,1.0); }
		static Brown() { return new bg.Vector4(0.4,0.2,0.0,1.0); }
		static Transparent() { return new bg.Vector4(0,0,0,0); }
		
		constructor(x = 0, y = 0, z = 0, w = 0) {
			super(new bg.Math.ArrayHighP(4));
			if (x instanceof Vector2) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
				this._v[2] = y
				this._v[3] = z;
			}
			else if (x instanceof Vector3) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
				this._v[2] = x._v[2];
				this._v[3] = y;
			}
			else if (x instanceof Vector4) {
				this._v[0] = x._v[0];
				this._v[1] = x._v[1];
				this._v[2] = x._v[2];
				this._v[3] = x._v[3];
			}
			else if (Array.isArray(x) && x.length>=4) {
				this._v[0] = x[0];
				this._v[1] = x[1];
				this._v[2] = x[2];
				this._v[3] = x[3];
			}
			else {
				if (y===undefined) y=x;
				if (z===undefined) z=y;
				if (w===undefined) w=z;
				this._v[0] = x;
				this._v[1] = y;
				this._v[2] = z;
				this._v[3] = w;
			}
		}
		
		get z() { return this._v[2]; }
		set z(v) { this._v[2] = v; }
		get w() { return this._v[3]; }
		set w(v) { this._v[3] = v; }
		
		magnitude() {
			return Math.sqrt(
				this._v[0] * this._v[0] +
				this._v[1] * this._v[1] +
				this._v[2] * this._v[2] +
				this._v[3] * this._v[3]
			);
		}

		normalize() {
			let m = this.magnitude();
			this._v[0] = this._v[0]/m;
			this._v[1]=this._v[1]/m;
			this._v[2]=this._v[2]/m;
			this._v[3]=this._v[3]/m;
			return this;
		}

		distance(other) {
			let v3 = new bg.Vector4(this._v[0] - other._v[0],
									  this._v[1] - other._v[1],
									  this._v[2] - other._v[2],
									  this._v[3] - other._v[3]);
			return v3.magnitude();
		}

		add(v2) {
			this._v[0] += v2._v[0];
			this._v[1] += v2._v[1];
			this._v[2] += v2._v[2];
			this._v[3] += v2._v[3];
			return this;
		}

		sub(v2) {
			this._v[0] -= v2._v[0];
			this._v[1] -= v2._v[1];
			this._v[2] -= v2._v[2];
			this._v[3] -= v2._v[3];
			return this;
		}

		dot(v2) {
			return this._v[0] * v2._v[0] + this._v[1] * v2._v[1] + this._v[2] * v2._v[2] + this._v[3] * v2._v[3];
		}

		scale(scale) {
			this._v[0] *= scale; this._v[1] *= scale; this._v[2] *= scale; this._v[3] *= scale;
			return this;
		}

		elemAtIndex(i) { return this._v[i]; }
		equals(v) { return this._v[0]==v._v[0] && this._v[1]==v._v[1] && this._v[2]==v._v[2] && this._v[3]==v._v[3]; }
		notEquals(v) { return this._v[0]!=v._v[0] || this._v[1]!=v._v[1] || this._v[2]!=v._v[2] || this._v[3]!=v._v[3]; }
		assign(v) { this._v[0]=v._v[0]; this._v[1]=v._v[1]; if (v._v.length>=3) this._v[2]=v._v[2]; if (v._v.length==4) this._v[3]=v._v[3]; }

		set(x, y, z, w) {
			this._v[0] = x;
			this._v[1] = (y===undefined) ? x:y;
			this._v[2] = (y===undefined) ? x:(z===undefined ? y:z);
			this._v[3] = (y===undefined) ? x:(z===undefined ? y:(w===undefined ? z:w));
		}

		get r() { return this._v[0]; }
		get g() { return this._v[1]; }
		get b() { return this._v[2]; }
		get a() { return this._v[3]; }
		
		set r(v) { this._v[0] = v; }
		set g(v) { this._v[1] = v; }
		set b(v) { this._v[2] = v; }
		set a(v) { this._v[3] = v; }

		get xy() { return new bg.Vector2(this._v[0],this._v[1]); }
		get yz() { return new bg.Vector2(this._v[1],this._v[2]); }
		get xz() { return new bg.Vector2(this._v[0],this._v[2]); }
		get xyz() { return new bg.Vector3(this._v[0],this._v[1],this._v[2]); }

		get width() { return this._v[2]; }
		get height() { return this._v[3]; }
		
		set width(v) { this._v[2] = v; }
		set height(v) { this._v[3] = v; }
		
		get aspectRatio() { return this._v[3]!=0 ? this._v[2]/this._v[3]:1.0; }

		isNan() { return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]) || isNaN(this._v[3]); }

		toString() {
			return "[" + this._v + "]";
		}
	}
	
	bg.Vector4 = Vector4;
	
	bg.Size2D = Vector2;
	bg.Size3D = Vector3;
	bg.Position2D = Vector2;
	bg.Viewport = Vector4;
	bg.Color = Vector4;
	
	class Bounds extends Vector {
		constructor(a=0,b=0,c=0,d=0,e=0,f=0) {
			super(new bg.Math.Array(6));
			this._v[0] = a;
			this._v[1] = b;
			this._v[2] = c;
			this._v[3] = d;
			this._v[4] = e;
			this._v[5] = f;
		}
		
		elemAtIndex(i) { return this._v[i]; }
		equals(v) { return this._v[0]==v._v[0] && this._v[1]==v._v[1] && this._v[2]==v._v[2] && this._v[3]==v._v[3] && this._v[4]==v._v[4] && this._v[5]==v._v[5]; }
		notEquals(v) { return this._v[0]!=v._v[0] || this._v[1]!=v._v[1] || this._v[2]!=v._v[2] || this._v[3]!=v._v[3] || this._v[4]!=v._v[4] || this._v[5]!=v._v[5]; }
		assign(v) { this._v[0]=v._v[0]; this._v[1]=v._v[1]; this._v[2]=v._v[2]; this._v[3]=v._v[3]; this._v[4]=v._v[4]; this._v[5]=v._v[5]; }

		set(left, right, bottom, top, back, front) {
			this._v[0] = left;
			this._v[1] = (right===undefined) ? left:right;
			this._v[2] = (right===undefined) ? left:bottom;
			this._v[3] = (right===undefined) ? left:top;
			this._v[4] = (right===undefined) ? left:back;
			this._v[5] = (right===undefined) ? left:front;
		}

		get left() { return this._v[0]; }
		get right() { return this._v[1]; }
		get bottom() { return this._v[2]; }
		get top() { return this._v[3]; }
		get back() { return this._v[4]; }
		get front() { return this._v[5]; }
		
		set left(v) { this._v[0] = v; }
		set right(v) { this._v[1] = v; }
		set bottom(v) { this._v[2] = v; }
		set top(v) { this._v[3] = v; }
		set back(v) { this._v[4] = v; }
		set front(v) { this._v[5] = v; }

		get width() { return Math.abs(this._v[1] - this._v[0]); }
		get height() { return Math.abs(this._v[3] - this._v[2]); }
		get depth() { return Math.abs(this._v[5] - this._v[4]); }

		isNan() { return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]) || isNaN(this._v[3]) || isNaN(this._v[4]) || isNaN(this._v[5]); }

		toString() {
			return "[" + this._v + "]";
		}

		isInBounds(/* vwgl.Vector3*/ v) {
			return v.x>=this._v[0] && v.x<=this._v[1] &&
					v.y>=this._v[2] && v.y<=this._v[3] &&
					v.z>=this._v[4] && v.z<=this._v[5];
		}
	}
	
	bg.Bounds = Bounds;

	class Quaternion extends Vector4 {
		static MakeWithMatrix(m) {
			return new Quaternion(m);
		}
		
		constructor(a,b,c,d) {
			super();
			if (a===undefined) this.zero();
			else if (b===undefined) {
				if (a._v && a._v.lenght>=4) this.clone(a);
				else if(a._m && a._m.length==9) this.initWithMatrix3(a);
				else if(a._m && a._m.length==16) this.initWithMatrix4(a);
				else this.zero();
			}
			else if (a!==undefined && b!==undefined && c!==undefined && d!==undefined) {
				this.initWithValues(a,b,c,d);
			}
			else {
				this.zero();
			}
		}
		
		initWithValues(alpha,x,y,z) {
			this._v[0] = x * bg.Math.sin(alpha/2);
			this._v[1] = y * bg.Math.sin(alpha/2);
			this._v[2] = z * bg.Math.sin(alpha/2);
			this._v[3] = bg.Math.cos(alpha/2);
			return this;
		}
		
		clone(q) {
			this._v[0] = q._v[0];
			this._v[1] = q._v[1];
			this._v[2] = q._v[2];
			this._v[3] = q._v[3];
		}
		
		initWithMatrix3(m) {
			let w = bg.Math.sqrt(1.0 + m._m[0] + m._m[4] + m._m[8]) / 2.0;
			let w4 = 4.0 * w;
			
			this._v[0] = (m._m[7] - m._m[5]) / w;
			this._v[1] = (m._m[2] - m._m[6]) / w4;
			this._v[2] = (m._m[3] - m._m[1]) / w4;
			this._v[3] = w;
		}
		
		initWithMatrix4(m) {
			let w = bg.Math.sqrt(1.0 + m._m[0] + m._m[5] + m._m[10]) / 2.0;
			let w4 = 4.0 * w;
			
			this._v[0] = (m._m[9] - m._m[6]) / w;
			this._v[1] = (m._m[2] - m._m[8]) / w4;
			this._v[2] = (m._m[4] - m._m[1]) / w4;
			this._v[3] = w;	
		}
		
		getMatrix4() {
			let m = bg.Matrix4.Identity();
			let _v = this._v;
			m.setRow(0, new bg.Vector4(1.0 - 2.0*_v[1]*_v[1] - 2.0*_v[2]*_v[2], 2.0*_v[0]*_v[1] - 2.0*_v[2]*_v[3], 2.0*_v[0]*_v[2] + 2.0*_v[1]*_v[3], 0.0));
			m.setRow(1, new bg.Vector4(2.0*_v[0]*_v[1] + 2.0*_v[2]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[2]*_v[2], 2.0*_v[1]*_v[2] - 2.0*_v[0]*_v[3], 0.0));
			m.setRow(2, new bg.Vector4(2.0*_v[0]*_v[2] - 2.0*_v[1]*_v[3], 2.0*_v[1]*_v[2] + 2.0*_v[0]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[1]*_v[1], 0.0));
			return m;
		}
		
		getMatrix3() {
			let m = bg.Matrix3.Identity();
			let _v = this._v;
			
			m.setRow(0, new bg.Vector3(1.0 - 2.0*_v[1]*_v[1] - 2.0*_v[2]*_v[2], 2.0*_v[0]*_v[1] - 2.0*_v[2]*_v[3], 2.0*_v[0]*_v[2] + 2.0*_v[1]*_v[3]));
			m.setRow(1, new bg.Vector3(2.0*_v[0]*_v[1] + 2.0*_v[2]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[2]*_v[2], 2.0*_v[1]*_v[2] - 2.0*_v[0]*_v[3]));
			m.setRow(2, new bg.Vector3(2.0*_v[0]*_v[2] - 2.0*_v[1]*_v[3], 2.0*_v[1]*_v[2] + 2.0*_v[0]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[1]*_v[1]));
			return m;
		}
	}
	
	bg.Quaternion = Quaternion;

})();
