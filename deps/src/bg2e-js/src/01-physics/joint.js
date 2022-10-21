(function() {
	
	class Joint {
		static Factory(linkData) {
			switch (linkData.type) {
			case 'LinkJoint':
				return LinkJoint.Factory(linkData);
				break;
			}
			return null;
		}

		constructor() {
			this._transform = bg.Matrix4.Identity();
		}
		
		get transform() { return this._transform; }
		set transform(t) { this._transform = t; }
		
		applyTransform(matrix) {
			
		}
		
		calculateTransform() {
			
		}
	}
	
	bg.physics.Joint = Joint;
	
	bg.physics.LinkTransformOrder = {
		TRANSLATE_ROTATE:1,
		ROTATE_TRANSLATE:0
	}
	
	class LinkJoint extends Joint {
		static Factory(data) {
			let result = new LinkJoint();
			result.offset = new bg.Vector3(
				data.offset[0] || 0,
				data.offset[1] || 0,
				data.offset[2] || 0
			);
			result.yaw = data.yaw || 0;
			result.pitch = data.pitch || 0;
			result.roll = data.roll || 0;
			result.order = data.order || 1;
			return result;
		}

		constructor() {
			super();
			this._offset = new bg.Vector3();
			this._eulerRotation = new bg.Vector3();
			
			this._transformOrder = bg.physics.LinkTransformOrder.TRANSLATE_ROTATE;
		}
		
		applyTransform(matrix) {
			matrix.mult(this.transform);
		}
		
		assign(j) {
			this.yaw = j.yaw;
			this.pitch = j.pitch;
			this.roll = j.roll;
			this.offset.assign(j.offset);
			this.transformOrder = j.transformOrder;
		}
		
		get offset() { return this._offset; }
		set offset(o) { this._offset = o; this.calculateTransform(); }
		
		get eulerRotation() { return this._eulerRotation; }
		set eulerRotation(r) { this._eulerRotation = r; this.calculateTransform(); }
		
		get yaw() { return this._eulerRotation.x; }
		get pitch() { return this._eulerRotation.y; }
		get roll() { return this._eulerRotation.z; }
		
		set yaw(y) { this._eulerRotation.x = y; this.calculateTransform(); }
		set pitch(p) { this._eulerRotation.y = p; this.calculateTransform(); }
		set roll(r) { this._eulerRotation.z = r; this.calculateTransform(); }
		
		get transformOrder() { return this._transformOrder; }
		set transformOrder(o) { this._transformOrder = o; this.calculateTransform(); }
		
		multTransform(dst) {
			let offset = this.offset;
			switch (this.transformOrder) {
				case bg.physics.LinkTransformOrder.TRANSLATE_ROTATE:
					dst.translate(offset.x,offset.y,offset.z);
					this.multRotation(dst);
					break;
				case bg.physics.LinkTransformOrder.ROTATE_TRANSLATE:
					this.multRotation(dst);
					dst.translate(offset.x,offset.y,offset.z);
					break;
			}
		}
		
		multRotation(dst) {
			dst.rotate(this.eulerRotation.z, 0,0,1)
			   .rotate(this.eulerRotation.y, 0,1,0)
			   .rotate(this.eulerRotation.x, 1,0,0);
		}
		
		calculateTransform() {
			this.transform.identity();
			this.multTransform(this.transform);
		}

		serialize(data) {
			data.type = "LinkJoint";
			data.offset = [
				this.offset.x,
				this.offset.y,
				this.offset.z
			];
			data.yaw = this.yaw;
			data.pitch = this.pitch;
			data.roll = this.roll;
			data.order = this.order;
		}
	}
	
	bg.physics.LinkJoint = LinkJoint;
})();