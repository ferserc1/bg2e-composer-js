(function() {
	
	class Plane {
		// a = normal: create a plane with origin=(0,0,0) and normal=a
		// a = normal, b = origin: create a plane with origin=b and normal=a
		// a = p1, b = p2, c = p3: create a plane that contains the points p1, p2 and p3
		constructor(a, b, c) {
			a = a instanceof bg.Vector3 && a;
			b = b instanceof bg.Vector3 && b;
			c = c instanceof bg.Vector3 && c;
			if (a && !b) {
				this._normal = new bg.Vector3(a);
				this._origin = new bg.Vector3(0);
			}
			else if (a && b && !c) {
				this._normal = new bg.Vector3(a);
				this._origin = new bg.Vector3(b);
			}
			else if (a && b && c) {
				var vec1 = new bg.Vector3(a); vec1.sub(b);
				var vec2 = new bg.Vector3(c); vec2.sub(a);
				this._origin = new bg.Vector3(p1);
				this._normal = new bg.Vector3(vec1);
				this._normal.cross(vec2).normalize();
			}
			else {
				this._origin = new bg.Vector3(0);
				this._normal = new bg.Vector3(0,1,0);
			}
		}

		get normal() { return this._normal; }
		set normal(n) { this._normal.assign(n); }

		get origin() { return this._origin; }
		set origin(o) { this._origin.assign(o); }

		toString() {
			return `P0: ${this._origin.toString()}, normal:${this._normal.toString()}`;
		}

		valid() { return !this._origin.isNan() && !this._normal.isNan(); }

		assign(p) {
			this._origin.assign(p._origin);
			this._normal.assign(p._normal);
			return this;
		}
		
		equals(p) {
			return this._origin.equals(p._origin) && this._normal.equals(p._normal);
		}
	}
	
	bg.physics.Plane = Plane;
	
})();