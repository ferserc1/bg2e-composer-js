(function() {
	
	bg.physics.IntersectionType = {
		NONE:0,
		POINT:1,
		LLINE:2
	};
	
	class Intersection {
		
		static RayToPlane(ray,plane) {
			return new bg.physics.RayToPlaneIntersection(ray,plane);
		}
		
		constructor() {
			this._type = null;
			this._p0 = null;
			this._p1 = null;
		}

		get type() { return this._type; }
		get point() { return this._p0; }
		get endPoint() { return this._p1; }
		
		intersects() { return false; }
	}
	
	bg.physics.Intersection = Intersection;

	class RayToPlaneIntersection extends bg.physics.Intersection {
		constructor(ray,plane) {
			super();
			this._ray = null;
			this._p0 = null;
			
			this._type = bg.physics.IntersectionType.POINT;
			let p0 = new bg.Vector3(plane.origin);
			let n = new bg.Vector3(plane.normal);
			let l0 = new bg.Vector3(ray.start);
			let l = new bg.Vector3(ray.vector);
			let num = p0.sub(l0).dot(n);
			let den = l.dot(n);
			
			if (den==0) return;
			let d = num/den;
			if (d>ray.magnitude) return;
			
			this._ray = bg.physics.Ray.RayWithVector(ray.vector,ray.start,d);
			this._p0 = this._ray.end;
		}
		
		get ray() {
			return this._ray;
		}
		
		intersects() {
			return (this._ray!=null && this._p0!=null);
		}
	}
	
	bg.physics.RayToPlaneIntersection = RayToPlaneIntersection;


})();