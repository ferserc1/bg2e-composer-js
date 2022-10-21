(function() {

// only works with rotation matrixes
// TODO: Check is rotation matrix
function rotationMatrixToEulerAngles(M) {
	let sy = Math.sqrt(M.m00 * M.m00 + M.m10 * M.m10);
	let singular = sy < -1e-6
	let x = 0;
	let y = 0;
	let z = 0;
	if (!singular) {
		x = Math.atan2(M.m21, M.m22);
		y = Math.atan2(-M.m20, sy);
		z = Math.atan2(M.m10, M.m00);
	}
	else {
		x = Math.atan2(-M.m12, M.m11);
		y = Math.atan2(-M.m20, sy);
		z = 0;
	}

	if (x<0) {
		x += bg.Math.PI * 2;
	}
	if (y<0) {
		y += bg.Math.PI * 2;
	}
	if (z<0) {
		z += bg.Math.PI * 2;
	}

	return new bg.Vector3(x, y, z);
}

class Matrix3 {
	static Identity() {
		return new bg.Matrix3(1,0,0, 0,1,0, 0,0,1);
	}
	
	constructor(v00=1,v01=0,v02=0,v10=0,v11=1,v12=0,v20=0,v21=0,v22=1) {
		this._m = new bg.Math.Array(9);
		if (Array.isArray(typeof(v00))) {
			this._m[0] = v00[0]; this._m[1] = v00[1]; this._m[2] = v00[0];
			this._m[3] = v00[3]; this._m[4] = v00[4]; this._m[5] = v00[5];
			this._m[6] = v00[6]; this._m[7] = v00[7]; this._m[8] = v00[8];
		}
		else if (typeof(v00)=="number") {
			this._m[0] = v00; this._m[1] = v01; this._m[2] = v02;
			this._m[3] = v10; this._m[4] = v11; this._m[5] = v12;
			this._m[6] = v20; this._m[7] = v21; this._m[8] = v22;
		}
		else {
			this.assign(v00);
		}
	}
	
	get m() { return this._m; }

	toArray() {
		return [
			this._m[0], this._m[1], this._m[2],
			this._m[3], this._m[4], this._m[5],
			this._m[6], this._m[7], this._m[8]
		]
	}
	
	get m00() { return this._m[0]; }
	get m01() { return this._m[1]; }
	get m02() { return this._m[2]; }
	get m10() { return this._m[3]; }
	get m11() { return this._m[4]; }
	get m12() { return this._m[5]; }
	get m20() { return this._m[6]; }
	get m21() { return this._m[7]; }
	get m22() { return this._m[8]; }
	
	set m00(v) { this._m[0] = v; }
	set m01(v) { this._m[1] = v; }
	set m02(v) { this._m[2] = v; }
	set m10(v) { this._m[3] = v; }
	set m11(v) { this._m[4] = v; }
	set m12(v) { this._m[5] = v; }
	set m20(v) { this._m[6] = v; }
	set m21(v) { this._m[7] = v; }
	set m22(v) { this._m[8] = v; }
	
	zero() {
		this._m[0] = this._m[1] = this._m[2] =
		this._m[3] = this._m[4] = this._m[5] =
		this._m[6] = this._m[7] = this._m[8] = 0;
		return this;
	}

	identity() {
		this._m[0] = 1; this._m[1] = 0; this._m[2] = 0;
		this._m[3] = 0; this._m[4] = 1; this._m[5] = 0;
		this._m[6] = 0; this._m[7] = 0; this._m[8] = 1;
		return this;
	}
	
	isZero() {
		return	this._m[0]==0.0 && this._m[1]==0.0 && this._m[2]==0.0 &&
				this._m[3]==0.0 && this._m[4]==0.0 && this._m[5]==0.0 &&
				this._m[6]==0.0 && this._m[7]==0.0 && this._m[8]==0.0;
	}
	
	isIdentity() {
		return	this._m[0]==1.0 && this._m[1]==0.0 && this._m[2]==0.0 &&
				this._m[3]==0.0 && this._m[4]==1.0 && this._m[5]==0.0 &&
				this._m[6]==0.0 && this._m[7]==0.0 && this._m[8]==1.0;
	}

	row(i) { return new bg.Vector3(this._m[i*3], this._m[i*3 + 1], this._m[i*3 + 2]); }
	setRow(i, row) { this._m[i*3]=row._v[0]; this._m[i*3 + 1]=row._v[1]; this._m[i*3 + 2]=row._v[2]; return this; }

	setScale(x,y,z) { 
		let rx = new bg.Vector3(this._m[0], this._m[3], this._m[6]).normalize().scale(x);
		let ry = new bg.Vector3(this._m[1], this._m[4], this._m[7]).normalize().scale(y);
		let rz = new bg.Vector3(this._m[2], this._m[5], this._m[8]).normalize().scale(z);
		this._m[0] = rx.x; this._m[3] = rx.y; this._m[6] = rx.z;
		this._m[1] = ry.x; this._m[4] = ry.y; this._m[7] = ry.z;
		this._m[2] = rz.x; this._m[5] = rz.y; this._m[8] = rz.z;
		return this;
	}
	getScale() {
		return new bg.Vector3(
			new bg.Vector3(this._m[0], this._m[3], this._m[6]).module,
			new bg.Vector3(this._m[1], this._m[4], this._m[7]).module,
			new bg.Vector3(this._m[2], this._m[5], this._m[8]).module
		);
	}

	get eulerRotation() {
		return rotationMatrixToEulerAngles(this);
	}
	
	get length() { return this._m.length; }
	
	traspose() {
		let r0 = new bg.Vector3(this._m[0], this._m[3], this._m[6]);
		let r1 = new bg.Vector3(this._m[1], this._m[4], this._m[7]);
		let r2 = new bg.Vector3(this._m[2], this._m[5], this._m[8]);
		
		this.setRow(0, r0);
		this.setRow(1, r1);
		this.setRow(2, r2);

		return this;
	}
	
	elemAtIndex(i) { return this._m[i]; }
	assign(a) {
		if (a.length==9) {
			this._m[0] = a._m[0]; this._m[1] = a._m[1]; this._m[2] = a._m[2];
			this._m[3] = a._m[3]; this._m[4] = a._m[4]; this._m[5] = a._m[5];
			this._m[6] = a._m[6]; this._m[7] = a._m[7]; this._m[8] = a._m[8];
		}
		else if (a.length==16) {
			this._m[0] = a._m[0]; this._m[1] = a._m[1]; this._m[2] = a._m[2];
			this._m[3] = a._m[4]; this._m[4] = a._m[5]; this._m[5] = a._m[6];
			this._m[6] = a._m[8]; this._m[7] = a._m[9]; this._m[8] = a._m[10];
		}
		return this;
	}
	
	equals(m) {
		return	this._m[0] == m._m[0] && this._m[1] == m._m[1]  && this._m[2] == m._m[2] &&
				this._m[3] == m._m[3] && this._m[4] == m._m[4]  && this._m[5] == m._m[5] &&
				this._m[6] == m._m[6] && this._m[7] == m._m[7]  && this._m[8] == m._m[8];
	}

	notEquals(m) {
		return	this._m[0] != m._m[0] || this._m[1] != m._m[1]  || this._m[2] != m._m[2] &&
				this._m[3] != m._m[3] || this._m[4] != m._m[4]  || this._m[5] != m._m[5] &&
				this._m[6] != m._m[6] || this._m[7] != m._m[7]  || this._m[8] != m._m[8];
	}
		
	mult(a) {
		if (typeof(a)=="number") {
			this._m[0] *= a; this._m[1] *= a; this._m[2] *= a;
			this._m[3] *= a; this._m[4] *= a; this._m[5] *= a;
			this._m[6] *= a; this._m[7] *= a; this._m[8] *= a;
			
		}
		else {
			let rm = this._m;
			let lm = a._m;
			
			let res = new bg.Math.Array(9);
			res[0] = lm[0] * rm[0] + lm[1] * rm[1] + lm[2] * rm[2];
			res[1] = lm[0] * rm[1] + lm[1] * rm[4] + lm[2] * rm[7];
			res[2] = lm[0] * rm[2] + lm[1] * rm[5] + lm[2] * rm[8];
			
			res[3] = lm[3] * rm[0] + lm[4] * rm[3] + lm[5] * rm[6];
			res[4] = lm[3] * rm[1] + lm[4] * rm[4] + lm[5] * rm[7];
			res[5] = lm[3] * rm[2] + lm[4] * rm[5] + lm[5] * rm[8];
			
			res[6] = lm[6] * rm[0] + lm[7] * rm[3] + lm[8] * rm[6];
			res[7] = lm[6] * rm[1] + lm[7] * rm[4] + lm[8] * rm[7];
			res[8] = lm[6] * rm[2] + lm[7] * rm[5] + lm[8] * rm[8];
			this._m = res;
		}
		return this;
	}

	multVector(vec) {
		if (typeof(vec)=='object' && vec._v && vec._v.length>=2) {
			vec = vec._v;
		}
		let x=vec[0];
		let y=vec[1];
		let z=1.0;
	
		return new bg.Vector3(	this._m[0]*x + this._m[3]*y + this._m[6]*z,
								this._m[1]*x + this._m[4]*y + this._m[7]*z,
								this._m[2]*x + this._m[5]*y + this._m[8]*z);
	}
		
	isNan() {
		return	!Math.isNaN(_m[0]) && !Math.isNaN(_m[1]) && !Math.isNaN(_m[2]) &&
				!Math.isNaN(_m[3]) && !Math.isNaN(_m[4]) && !Math.isNaN(_m[5]) &&
				!Math.isNaN(_m[6]) && !Math.isNaN(_m[7]) && !Math.isNaN(_m[8]);
	}

	toString() {
		return "[" + this._m[0] + ", " + this._m[1] + ", " + this._m[2] + "]\n" +
			   " [" + this._m[3] + ", " + this._m[4] + ", " + this._m[5] + "]\n" +
			   " [" + this._m[6] + ", " + this._m[7] + ", " + this._m[8] + "]";
	}
}

bg.Matrix3 = Matrix3;

class Matrix4 {
	static Unproject(x, y, depth, mvMat, pMat, viewport) {
		let mvp = new bg.Matrix4(pMat);
		mvp.mult(mvMat);
		mvp.invert();

		let vin = new bg.Vector4(((x - viewport.y) / viewport.width) * 2.0 - 1.0,
								((y - viewport.x) / viewport.height) * 2.0 - 1.0,
								depth * 2.0 - 1.0,
								1.0);
		
		let result = new bg.Vector4(mvp.multVector(vin));
		if (result.z==0) {
			result.set(0);
		}
		else {
			result.set(	result.x/result.w,
						result.y/result.w,
						result.z/result.w,
						result.w/result.w);
		}

		return result;
	}

	static Identity() {
		return new bg.Matrix4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
	}
		
	static Perspective(fovy, aspect, nearPlane, farPlane) {
		let fovy2 = bg.Math.tan(fovy * bg.Math.PI / 360.0) * nearPlane;
		let fovy2aspect = fovy2 * aspect;

		return bg.Matrix4.Frustum(-fovy2aspect,fovy2aspect,-fovy2,fovy2,nearPlane,farPlane);
	}

	static Frustum(left, right, bottom, top, nearPlane, farPlane) {
		let res = new bg.Matrix4();
		let A = right-left;
		let B = top-bottom;
		let C = farPlane-nearPlane;
		
		res.setRow(0, new bg.Vector4(nearPlane*2.0/A,	0.0,	0.0,	0.0));
		res.setRow(1, new bg.Vector4(0.0,	nearPlane*2.0/B,	0.0,	0.0));
		res.setRow(2, new bg.Vector4((right+left)/A,	(top+bottom)/B,	-(farPlane+nearPlane)/C,	-1.0));
		res.setRow(3, new bg.Vector4(0.0,	0.0,	-(farPlane*nearPlane*2.0)/C,	0.0));
		
		return res;
	}

	static Ortho(left, right, bottom, top, nearPlane, farPlane) {
		let p = new bg.Matrix4();
		
		let m = right-left;
		let l = top-bottom;
		let k = farPlane-nearPlane;;
		
		p._m[0] = 2/m; p._m[1] = 0;   p._m[2] = 0;     p._m[3] = 0;
		p._m[4] = 0;   p._m[5] = 2/l; p._m[6] = 0;     p._m[7] = 0;
		p._m[8] = 0;   p._m[9] = 0;   p._m[10] = -2/k; p._m[11]= 0;
		p._m[12]=-(left+right)/m; p._m[13] = -(top+bottom)/l; p._m[14] = -(farPlane+nearPlane)/k; p._m[15]=1;

		return p;
	}
		
	static LookAt(p_eye, p_center, p_up) {
		let result = bg.Matrix4.Identity();
		let y = new bg.Vector3(p_up);
		let z = bg.Vector3.Sub(p_eye,p_center);
		z.normalize();
		let x = bg.Vector3.Cross(y,z);
		x.normalize();
		y.normalize();

		result.m00 = x.x;
		result.m10 = x.y;
		result.m20 = x.z;
		result.m30 = -x.dot( p_eye );
		result.m01 = y.x;
		result.m11 = y.y;
		result.m21 = y.z;
		result.m31 = -y.dot( p_eye );
		result.m02 = z.x;
		result.m12 = z.y;
		result.m22 = z.z;
		result.m32 = -z.dot( p_eye );
		result.m03 = 0;
		result.m13 = 0;
		result.m23 = 0;
		result.m33 = 1;
	
		return result;
	}

	static Translation(x, y, z) {
		if (typeof(x)=='object' && x._v && x._v.length>=3) {
			y = x._v[1];
			z = x._v[2];
			x = x._v[0];
		}
		return new bg.Matrix4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			  x,   y,   z, 1.0
		);
	}
		
	static Rotation(alpha, x, y, z) {
		let axis = new bg.Vector3(x,y,z);
		axis.normalize();
		let rot = new bg.Matrix4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
				
		var cosAlpha = bg.Math.cos(alpha);
		var acosAlpha = 1.0 - cosAlpha;
		var sinAlpha = bg.Math.sin(alpha);
		
		return new bg.Matrix4(
			axis.x * axis.x * acosAlpha + cosAlpha, axis.x * axis.y * acosAlpha + axis.z * sinAlpha, axis.x * axis.z * acosAlpha - axis.y * sinAlpha, 0,
			axis.y * axis.x * acosAlpha - axis.z * sinAlpha, axis.y * axis.y * acosAlpha + cosAlpha, axis.y * axis.z * acosAlpha + axis.x * sinAlpha, 0,
			axis.z * axis.x * acosAlpha + axis.y * sinAlpha, axis.z * axis.y * acosAlpha - axis.x * sinAlpha, axis.z * axis.z * acosAlpha + cosAlpha, 0,
			0,0,0,1
		);
	}

	static Scale(x, y, z) {
		if (typeof(x)=='object' && x._v && x._v.length>=3) {
			x = x._v[0];
			y = x._v[1];
			z = x._v[2];
		}
		return new bg.Matrix4(
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		)
	}
	
	constructor(m00=0,m01=0,m02=0,m03=0, m10=0,m11=0,m12=0,m13=0, m20=0,m21=0,m22=0,m23=0, m30=0,m31=0,m32=0,m33=0) {
		this._m = new bg.Math.Array(16);
		if (Array.isArray(m00)) {
			this._m[ 0] =  m00[0]; this._m[ 1] =  m00[1]; this._m[ 2] =  m00[2]; this._m[ 3] =  m00[3];
			this._m[ 4] =  m00[4]; this._m[ 5] =  m00[5]; this._m[ 6] =  m00[6]; this._m[ 7] =  m00[7];
			this._m[ 8] =  m00[8]; this._m[ 9] =  m00[9]; this._m[10] = m00[10]; this._m[11] = m00[11];
			this._m[12] = m00[12]; this._m[13] = m00[13]; this._m[14] = m00[14]; this._m[15] = m00[15];
		}
		else if (typeof(m00)=="number") {
			this._m[ 0] = m00; this._m[ 1] = m01; this._m[ 2] = m02; this._m[ 3] = m03;
			this._m[ 4] = m10; this._m[ 5] = m11; this._m[ 6] = m12; this._m[ 7] = m13;
			this._m[ 8] = m20; this._m[ 9] = m21; this._m[10] = m22; this._m[11] = m23;
			this._m[12] = m30; this._m[13] = m31; this._m[14] = m32; this._m[15] = m33;
		}
		else {
			this.assign(m00);
		}
	}
	
	get m() { return this._m; }

	toArray() {
		return [
			this._m[ 0], this._m[ 1], this._m[ 2], this._m[ 3],
			this._m[ 4], this._m[ 5], this._m[ 6], this._m[ 7],
			this._m[ 8], this._m[ 9], this._m[10], this._m[11],
			this._m[12], this._m[13], this._m[14], this._m[15]
		]
	}
	
	get m00() { return this._m[0]; }
	get m01() { return this._m[1]; }
	get m02() { return this._m[2]; }
	get m03() { return this._m[3]; }
	get m10() { return this._m[4]; }
	get m11() { return this._m[5]; }
	get m12() { return this._m[6]; }
	get m13() { return this._m[7]; }
	get m20() { return this._m[8]; }
	get m21() { return this._m[9]; }
	get m22() { return this._m[10]; }
	get m23() { return this._m[11]; }
	get m30() { return this._m[12]; }
	get m31() { return this._m[13]; }
	get m32() { return this._m[14]; }
	get m33() { return this._m[15]; }
	
	set m00(v) { this._m[0] = v; }
	set m01(v) { this._m[1] = v; }
	set m02(v) { this._m[2] = v; }
	set m03(v) { this._m[3] = v; }
	set m10(v) { this._m[4] = v; }
	set m11(v) { this._m[5] = v; }
	set m12(v) { this._m[6] = v; }
	set m13(v) { this._m[7] = v; }
	set m20(v) { this._m[8] = v; }
	set m21(v) { this._m[9] = v; }
	set m22(v) { this._m[10] = v; }
	set m23(v) { this._m[11] = v; }
	set m30(v) { this._m[12] = v; }
	set m31(v) { this._m[13] = v; }
	set m32(v) { this._m[14] = v; }
	set m33(v) { this._m[15] = v; }


	zero() {
		this._m[ 0] = 0; this._m[ 1] = 0; this._m[ 2] = 0; this._m[ 3] = 0;
		this._m[ 4] = 0; this._m[ 5] = 0; this._m[ 6] = 0; this._m[ 7] = 0;
		this._m[ 8] = 0; this._m[ 9] = 0; this._m[10] = 0; this._m[11] = 0;
		this._m[12] = 0; this._m[13] = 0; this._m[14] = 0; this._m[15] = 0;
		return this;
	}

	identity() {
		this._m[ 0] = 1; this._m[ 1] = 0; this._m[ 2] = 0; this._m[ 3] = 0;
		this._m[ 4] = 0; this._m[ 5] = 1; this._m[ 6] = 0; this._m[ 7] = 0;
		this._m[ 8] = 0; this._m[ 9] = 0; this._m[10] = 1; this._m[11] = 0;
		this._m[12] = 0; this._m[13] = 0; this._m[14] = 0; this._m[15] = 1;
		return this;
	}
	
	isZero() {
		return	this._m[ 0]==0 && this._m[ 1]==0 && this._m[ 2]==0 && this._m[ 3]==0 &&
				this._m[ 4]==0 && this._m[ 5]==0 && this._m[ 6]==0 && this._m[ 7]==0 &&
				this._m[ 8]==0 && this._m[ 9]==0 && this._m[10]==0 && this._m[11]==0 &&
				this._m[12]==0 && this._m[13]==0 && this._m[14]==0 && this._m[15]==0;
	}
	
	isIdentity() {
		return	this._m[ 0]==1 && this._m[ 1]==0 && this._m[ 2]==0 && this._m[ 3]==0 &&
				this._m[ 4]==0 && this._m[ 5]==1 && this._m[ 6]==0 && this._m[ 7]==0 &&
				this._m[ 8]==0 && this._m[ 9]==0 && this._m[10]==1 && this._m[11]==0 &&
				this._m[12]==0 && this._m[13]==0 && this._m[14]==0 && this._m[15]==1;
	}

	row(i) { return new bg.Vector4(this._m[i*4],this._m[i*4 + 1],this._m[i*4 + 2],this._m[i*4 + 3]); }
	setRow(i, row) { this._m[i*4]=row._v[0]; this._m[i*4 + 1]=row._v[1]; this._m[i*4 + 2]=row._v[2]; this._m[i*4 + 3]=row._v[3]; return this; }
	setScale(x,y,z) {
		let rx = new bg.Vector3(this._m[0], this._m[4], this._m[8]).normalize().scale(x);
		let ry = new bg.Vector3(this._m[1], this._m[5], this._m[9]).normalize().scale(y);
		let rz = new bg.Vector3(this._m[2], this._m[6], this._m[10]).normalize().scale(z);
		this._m[0] = rx.x; this._m[4] = rx.y; this._m[8] = rx.z;
		this._m[1] = ry.x; this._m[5] = ry.y; this._m[9] = ry.z;
		this._m[2] = rz.x; this._m[6] = rz.y; this._m[10] = rz.z;
		return this;
	}
	getScale() {
		return new bg.Vector3(
			new bg.Vector3(this._m[0], this._m[4], this._m[8]).module,
			new bg.Vector3(this._m[1], this._m[5], this._m[9]).module,
			new bg.Vector3(this._m[2], this._m[6], this._m[10]).module
		);
	}

	setPosition(pos,y,z) {
		if (typeof(pos)=="number") {
			this._m[12] = pos;
			this._m[13] = y;
			this._m[14] = z;
		}
		else {
			this._m[12] = pos.x;
			this._m[13] = pos.y;
			this._m[14] = pos.z;
		}
		return this;
	}

	get rotation() {
		let scale = this.getScale();
		return new bg.Matrix4(
				this._m[0]/scale.x, this._m[1]/scale.y, this._m[ 2]/scale.z, 0,
				this._m[4]/scale.x, this._m[5]/scale.y, this._m[ 6]/scale.z, 0,
				this._m[8]/scale.x, this._m[9]/scale.y, this._m[10]/scale.z, 0,
				0,	   0,	  0, 	1
			);
	}

	get position() {
		return new bg.Vector3(this._m[12], this._m[13], this._m[14]);
	}
	
	get length() { return this._m.length; }

	get eulerRotation() {
		return rotationMatrixToEulerAngles(this);
	}
	
	getMatrix3() {
		return new bg.Matrix3(this._m[0], this._m[1], this._m[ 2],
								this._m[4], this._m[5], this._m[ 6],
								this._m[8], this._m[9], this._m[10]);
	}
	
	perspective(fovy, aspect, nearPlane, farPlane) {
		this.assign(bg.Matrix4.Perspective(fovy, aspect, nearPlane, farPlane));
		return this;
	}
	
	frustum(left, right, bottom, top, nearPlane, farPlane) {
		this.assign(bg.Matrix4.Frustum(left, right, bottom, top, nearPlane, farPlane));
		return this;
	}
	
	ortho(left, right, bottom, top, nearPlane, farPlane) {
		this.assign(bg.Matrix4.Ortho(left, right, bottom, top, nearPlane, farPlane));
		return this;
	}

	lookAt(origin, target, up) {
		this.assign(bg.Matrix4.LookAt(origin,target,up));
		return this;
	}

	translate(x, y, z) {
		this.mult(bg.Matrix4.Translation(x, y, z));
		return this;
	}

	rotate(alpha, x, y, z) {
		this.mult(bg.Matrix4.Rotation(alpha, x, y, z));
		return this;
	}
	
	scale(x, y, z) {
		this.mult(bg.Matrix4.Scale(x, y, z));
		return this;
	}

	elemAtIndex(i) { return this._m[i]; }

	assign(a) {
		if (a.length==9) {
			this._m[0]  = a._m[0]; this._m[1]  = a._m[1]; this._m[2]  = a._m[2]; this._m[3]  = 0;
			this._m[4]  = a._m[3]; this._m[5]  = a._m[4]; this._m[6]  = a._m[5]; this._m[7]  = 0;
			this._m[8]  = a._m[6]; this._m[9]  = a._m[7]; this._m[10] = a._m[8]; this._m[11] = 0;
			this._m[12] = 0;	   this._m[13] = 0;		  this._m[14] = 0;		 this._m[15] = 1;
		}
		else if (a.length==16) {
			this._m[0]  = a._m[0];  this._m[1]  = a._m[1];  this._m[2]  = a._m[2];  this._m[3]  = a._m[3];
			this._m[4]  = a._m[4];  this._m[5]  = a._m[5];  this._m[6]  = a._m[6];  this._m[7]  = a._m[7];
			this._m[8]  = a._m[8];  this._m[9]  = a._m[9];  this._m[10] = a._m[10]; this._m[11] = a._m[11];
			this._m[12] = a._m[12]; this._m[13] = a._m[13];	this._m[14] = a._m[14];	this._m[15] = a._m[15];
		}
		return this;
	}
	
	equals(m) {
		return	this._m[ 0]==m._m[ 0] && this._m[ 1]==m._m[ 1] && this._m[ 2]==m._m[ 2] && this._m[ 3]==m._m[ 3] &&
				this._m[ 4]==m._m[ 4] && this._m[ 5]==m._m[ 5] && this._m[ 6]==m._m[ 6] && this._m[ 7]==m._m[ 7] &&
				this._m[ 8]==m._m[ 8] && this._m[ 9]==m._m[ 9] && this._m[10]==m._m[10] && this._m[11]==m._m[11] &&
				this._m[12]==m._m[12] && this._m[13]==m._m[13] && this._m[14]==m._m[14] && this._m[15]==m._m[15];
	}
	
	notEquals(m) {
		return	this._m[ 0]!=m._m[ 0] || this._m[ 1]!=m._m[ 1] || this._m[ 2]!=m._m[ 2] || this._m[ 3]!=m._m[ 3] ||
				this._m[ 4]!=m._m[ 4] || this._m[ 5]!=m._m[ 5] || this._m[ 6]!=m._m[ 6] || this._m[ 7]!=m._m[ 7] ||
				this._m[ 8]!=m._m[ 8] || this._m[ 9]!=m._m[ 9] || this._m[10]!=m._m[10] || this._m[11]!=m._m[11] ||
				this._m[12]!=m._m[12] || this._m[13]!=m._m[13] || this._m[14]!=m._m[14] || this._m[15]!=m._m[15];
	}
	
	mult(a) {
		if (typeof(a)=='number') {
			this._m[ 0] *= a; this._m[ 1] *= a; this._m[ 2] *= a; this._m[ 3] *= a;
			this._m[ 4] *= a; this._m[ 5] *= a; this._m[ 6] *= a; this._m[ 7] *= a;
			this._m[ 8] *= a; this._m[ 9] *= a; this._m[10] *= a; this._m[11] *= a;
			this._m[12] *= a; this._m[13] *= a; this._m[14] *= a; this._m[15] *= a;
			return this;
		}

		var rm = this._m;
		var lm = a._m;
		var res = new bg.Math.Array(16);
	
		res[0] = lm[ 0] * rm[ 0] + lm[ 1] * rm[ 4] + lm[ 2] * rm[ 8] + lm[ 3] * rm[12];
		res[1] = lm[ 0] * rm[ 1] + lm[ 1] * rm[ 5] + lm[ 2] * rm[ 9] + lm[ 3] * rm[13];
		res[2] = lm[ 0] * rm[ 2] + lm[ 1] * rm[ 6] + lm[ 2] * rm[10] + lm[ 3] * rm[14];
		res[3] = lm[ 0] * rm[ 3] + lm[ 1] * rm[ 7] + lm[ 2] * rm[11] + lm[ 3] * rm[15];
		
		res[4] = lm[ 4] * rm[ 0] + lm[ 5] * rm[ 4] + lm[ 6] * rm[ 8] + lm[ 7] * rm[12];
		res[5] = lm[ 4] * rm[ 1] + lm[ 5] * rm[ 5] + lm[ 6] * rm[ 9] + lm[ 7] * rm[13];
		res[6] = lm[ 4] * rm[ 2] + lm[ 5] * rm[ 6] + lm[ 6] * rm[10] + lm[ 7] * rm[14];
		res[7] = lm[ 4] * rm[ 3] + lm[ 5] * rm[ 7] + lm[ 6] * rm[11] + lm[ 7] * rm[15];
		
		res[8]  = lm[ 8] * rm[ 0] + lm[ 9] * rm[ 4] + lm[10] * rm[ 8] + lm[11] * rm[12];
		res[9]  = lm[ 8] * rm[ 1] + lm[ 9] * rm[ 5] + lm[10] * rm[ 9] + lm[11] * rm[13];
		res[10] = lm[ 8] * rm[ 2] + lm[ 9] * rm[ 6] + lm[10] * rm[10] + lm[11] * rm[14];
		res[11] = lm[ 8] * rm[ 3] + lm[ 9] * rm[ 7] + lm[10] * rm[11] + lm[11] * rm[15];
		
		res[12] = lm[12] * rm[ 0] + lm[13] * rm[ 4] + lm[14] * rm[ 8] + lm[15] * rm[12];
		res[13] = lm[12] * rm[ 1] + lm[13] * rm[ 5] + lm[14] * rm[ 9] + lm[15] * rm[13];
		res[14] = lm[12] * rm[ 2] + lm[13] * rm[ 6] + lm[14] * rm[10] + lm[15] * rm[14];
		res[15] = lm[12] * rm[ 3] + lm[13] * rm[ 7] + lm[14] * rm[11] + lm[15] * rm[15];
	
		this._m = res;
		return this;
	}

	multVector(vec) {
		if (typeof(vec)=='object' && vec._v && vec._v.length>=3) {
			vec = vec._v;
		}
		let x=vec[0];
		let y=vec[1];
		let z=vec[2];
		let w=1.0;
	
		return new bg.Vector4(this._m[0]*x + this._m[4]*y + this._m[ 8]*z + this._m[12]*w,
								this._m[1]*x + this._m[5]*y + this._m[ 9]*z + this._m[13]*w,
								this._m[2]*x + this._m[6]*y + this._m[10]*z + this._m[14]*w,
								this._m[3]*x + this._m[7]*y + this._m[11]*z + this._m[15]*w);
	}
	
	invert() {
		let a00 = this._m[0],  a01 = this._m[1],  a02 = this._m[2],  a03 = this._m[3],
	        a10 = this._m[4],  a11 = this._m[5],  a12 = this._m[6],  a13 = this._m[7],
	        a20 = this._m[8],  a21 = this._m[9],  a22 = this._m[10], a23 = this._m[11],
	        a30 = this._m[12], a31 = this._m[13], a32 = this._m[14], a33 = this._m[15];

	    let b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32;

	    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) {
			this.zero();
	        return this;
	    }
		else {
			det = 1.0 / det;

			this._m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			this._m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			this._m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			this._m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			this._m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			this._m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			this._m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			this._m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			this._m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			this._m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			this._m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			this._m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			this._m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			this._m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			this._m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			this._m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
			return this;
		}
	}
	
	traspose() {
		let r0 = new bg.Vector4(this._m[0], this._m[4], this._m[ 8], this._m[12]);
		let r1 = new bg.Vector4(this._m[1], this._m[5], this._m[ 9], this._m[13]);
		let r2 = new bg.Vector4(this._m[2], this._m[6], this._m[10], this._m[14]);
		let r3 = new bg.Vector4(this._m[3], this._m[7], this._m[11], this._m[15]);
	
		this.setRow(0, r0);
		this.setRow(1, r1);
		this.setRow(2, r2);
		this.setRow(3, r3);
		return this;
	}
	
	transformDirection(/* Vector3 */ dir) {
		let direction = new bg.Vector3(dir);
		let trx = new bg.Matrix4(this);
		trx.setRow(3, new bg.Vector4(0.0, 0.0, 0.0, 1.0));
		direction.assign(trx.multVector(direction).xyz);
		direction.normalize();
		return direction;
	}
	
	get forwardVector() {
		return this.transformDirection(new bg.Vector3(0.0, 0.0, 1.0));
	}
	
	get rightVector() {
		return this.transformDirection(new bg.Vector3(1.0, 0.0, 0.0));
	}
	
	get upVector() {
		return this.transformDirection(new bg.Vector3(0.0, 1.0, 0.0));
	}
	
	get backwardVector() {
		return this.transformDirection(new bg.Vector3(0.0, 0.0, -1.0));
	}
	
	get leftVector() {
		return this.transformDirection(new bg.Vector3(-1.0, 0.0, 0.0));
	}
	
	get downVector() {
		return this.transformDirection(new bg.Vector3(0.0, -1.0, 0.0));
	}
	
	isNan() {
		return	Number.isNaN(this._m[ 0]) || Number.isNaN(this._m[ 1]) || Number.isNaN(this._m[ 2]) || Number.isNaN(this._m[ 3]) ||
				Number.isNaN(this._m[ 4]) || Number.isNaN(this._m[ 5]) || Number.isNaN(this._m[ 6]) || Number.isNaN(this._m[ 7]) ||
				Number.isNaN(this._m[ 8]) || Number.isNaN(this._m[ 9]) || Number.isNaN(this._m[10]) || Number.isNaN(this._m[11]) ||
				Number.isNaN(this._m[12]) || Number.isNaN(this._m[13]) || Number.isNaN(this._m[14]) || Number.isNaN(this._m[15]);
	}
	
	getOrthoValues() {
		return [ (1+get23())/get22(),
				-(1-get23())/get22(),
				 (1-get13())/get11(),
				-(1+get13())/get11(),
				-(1+get03())/get00(),
				 (1-get03())/get00() ];
	}

	getPerspectiveValues() {
		return [ get23()/(get22()-1),
				 get23()/(get22()+1),
				 near * (get12()-1)/get11(),
				 near * (get12()+1)/get11(),
				 near * (get02()-1)/get00(),
				 near * (get02()+1)/get00() ];
	}

	toString() {
		return "[" + this._m[ 0] + ", " + this._m[ 1] + ", " + this._m[ 2] + ", " + this._m[ 3] + "]\n" +
			  " [" + this._m[ 4] + ", " + this._m[ 5] + ", " + this._m[ 6] + ", " + this._m[ 7] + "]\n" +
			  " [" + this._m[ 8] + ", " + this._m[ 9] + ", " + this._m[10] + ", " + this._m[11] + "]\n" +
			  " [" + this._m[12] + ", " + this._m[13] + ", " + this._m[14] + ", " + this._m[15] + "]";
	}
}

bg.Matrix4 = Matrix4;

})();