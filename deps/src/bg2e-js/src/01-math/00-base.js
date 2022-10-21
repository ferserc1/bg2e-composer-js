
(function() {
	bg.Math = {

		seed:1,

		PI:3.141592653589793,
		DEG_TO_RAD:0.01745329251994,
		RAD_TO_DEG:57.29577951308233,
		PI_2:1.5707963267948966,
		PI_4:0.785398163397448,
		PI_8:0.392699081698724,
		TWO_PI:6.283185307179586,
		
		EPSILON:0.0000001,
		Array:Float32Array,
		ArrayHighP:Array,
		FLOAT_MAX:3.402823e38,
		
		checkPowerOfTwo:function(n) {
			if (typeof n !== 'number') {
				return false;
			}
			else {
				return n && (n & (n - 1)) === 0;
			}  
		},

		closestPow2(aSize){
			return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2))); 
		},

		checkZero:function(v) {
			return v>-this.EPSILON && v<this.EPSILON ? 0:v;
		},
		
		equals:function(a,b) {
			return Math.abs(a - b) < this.EPSILON;
		},
		
		degreesToRadians:function(d) {
			return Math.fround(this.checkZero(d * this.DEG_TO_RAD));
		},
		
		radiansToDegrees:function(r) {
			return Math.fround(this.checkZero(r * this.RAD_TO_DEG));
		},

		sin:function(val) {
			return Math.fround(this.checkZero(Math.sin(val)));
		},

		cos:function(val) {
			return Math.fround(this.checkZero(Math.cos(val)));
		},

		tan:function(val) {
			return Math.fround(this.checkZero(Math.tan(val)));
		},

		cotan:function(val) {
			return Math.fround(this.checkZero(1.0 / this.tan(val)));
		},

		atan:function(val) {
			return Math.fround(this.checkZero(Math.atan(val)));
		},
		
		atan2:function(i, j) {
			return Math.fround(this.checkZero(Math.atan2f(i, j)));
		},

		random:function() {
			return Math.random();
		},

		seededRandom:function() {
			let max = 1;
			let min = 0;
		 
			this.seed = (this.seed * 9301 + 49297) % 233280;
			var rnd = this.seed / 233280;
		 
			return min + rnd * (max - min);
		},
		
		max:function(a,b) {
			return Math.fround(Math.max(a,b));
		},
		
		min:function(a,b) {
			return Math.fround(Math.min(a,b));
		},
		
		abs:function(val) {
			return Math.fround(Math.abs(val));
		},
		
		sqrt:function(val) {
			return Math.fround(Math.sqrt(val));
		},
		
		lerp:function(from, to, t) {
			return Math.fround((1.0 - t) * from + t * to);
		},
		
		square:function(n) {
			return Math.fround(n * n);
		}
	};

	class MatrixStrategy {
		constructor(target) {
			this._target = target;
		}

		get target() { return this._target; }
		set target(t) { this._target = t; }

		apply() {
			console.log("WARNING: MatrixStrategy::apply() not overloaded by the child class.");
		}
	}

	bg.MatrixStrategy = MatrixStrategy;

})();
