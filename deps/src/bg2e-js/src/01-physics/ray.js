(function() {

	function calculateVector(ray) {
		ray._vector = new bg.Vector3(ray._end);
		ray._vector.sub(ray._start);
		ray._magnitude = ray._vector.magnitude();
		ray._vector.normalize();
	}
	
	class Ray {
		static RayWithPoints(start,end) {
			return new Ray(start,end);
		}
		
		static RayWithVector(vec,origin,maxDepth) {
			let r = new Ray();
			r.setWithVector(vec,origin,maxDepth);
			return r;
		}
		
		static RayWithScreenPoint(screenPoint,projMatrix,viewMatrix,viewport) {
			let r = new Ray();
			r.setWithScreenPoint(screenPoint,projMatrix,viewMatrix,viewport);
			return r;
		}
		
		
		constructor(start,end) {
			this._start = start || new bg.Vector3();
			this._end = end || new bg.Vector3(1);
			calculateVector(this);
		}
		
		setWithPoints(start,end) {
			this._start.assign(start);
			this._end.assign(end);
			calculateVector();
			return this;
		}
		
		setWithVector(vec,origin,maxDepth) {
			this._start.assign(origin);
			this._end.assign(origin);
			let vector = new bg.Vector3(vec);
			vector.normalize().scale(maxDepth);
			this._end.add(vector);
			calculateVector(this);
			return this;
		}
		
		setWithScreenPoint(screenPoint,projMatrix,viewMatrix,viewport) {
			let start = bg.Matrix4.Unproject(screenPoint.x, screenPoint.y, 0, viewMatrix, projMatrix, viewport);
			let end = bg.Matrix4.Unproject(screenPoint.x, screenPoint.y, 1, viewMatrix, projMatrix, viewport);
			this._start = start.xyz;
			this._end = end.xyz;
			calculateVector(this);
			return this;
		}
		
		assign(r) {
			this._start.assign(r.start);
			this._end.assign(r.end);
			this._vector.assign(r.vector);
			this._magnitude.assign(r.magnitude);
		}
		
		get start() { return this._start; }
		set start(s) { this._start.assign(s); calculateVector(this); }
		
		get end() { return this._end; }
		set end(e) { this._end.assign(e); }
		
		get vector() { return this._vector; }
		
		get magnitude() { return this._magnitude; }
		
		toString() {
			return `start: ${this.start.toString()}, end: ${this.end.toString()}`;
		}
	}
	
	bg.physics.Ray = Ray;
	
})()
