(function() {
	
	let s_lightRegister = [];
	
	function registerLight(l) {
		s_lightRegister.push(l);
	}
	
	function unregisterLight(l) {
		let i = s_lightRegister.indexOf(l);
		if (i!=-1) {
			s_lightRegister.splice(i,1);
		}
	}

	function buildPlist(context,vertex,color) {
		let plist = new bg.base.PolyList(context);
		let normal = [];
		let texCoord0 = [];
		let index = [];
		let currentIndex = 0;
		for (let i=0; i<vertex.length; i+=3) {
			normal.push(0); normal.push(0); normal.push(1);
			texCoord0.push(0); texCoord0.push(0);
			index.push(currentIndex++);
		}
		plist.vertex = vertex;
		plist.normal = normal;
		plist.texCoord0 = texCoord0;
		plist.color = color;
		plist.index = index;
		plist.drawMode = bg.base.DrawMode.LINES;
		plist.build();
		return plist;
	}

	function getDirectionalGizmo(conext) {
		if (!this._directionalGizmo) {
			let context = this.node.context;
			let vertex = [
				0,0,0, 0,0,-1,
				0,0,-1, 0,0.1,-0.9,
				0,0,-1, 0,-0.1,-0.9,
			];
			let color = [
				1,1,1,1, 1,1,0,1,
				1,1,0,1, 1,1,0,1,
				1,1,0,1, 1,1,0,1
			];
			this._directionalGizmo = buildPlist(context,vertex,color);
		}
		return this._directionalGizmo;
	}

	function getSpotGizmo() {
		let context = this.node.context;
		let distance = 5;
		let alpha = bg.Math.degreesToRadians(this.light.spotCutoff / 2);
		let salpha = bg.Math.sin(alpha) * distance;
		let calpha = bg.Math.cos(alpha) * distance;

		let rx2 = bg.Math.cos(bg.Math.PI_8) * salpha;
		let rx1 = bg.Math.cos(bg.Math.PI_4) * salpha;
		let rx0 = bg.Math.cos(bg.Math.PI_4 + bg.Math.PI_8) * salpha;

		let ry2 = bg.Math.sin(bg.Math.PI_8) * salpha;
		let ry1 = bg.Math.sin(bg.Math.PI_4) * salpha;
		let ry0 = bg.Math.sin(bg.Math.PI_4 + bg.Math.PI_8) * salpha;

		let vertex = [
			0,0,0, 0,salpha,-calpha,
			0,0,0, 0,-salpha,-calpha,
			0,0,0, salpha,0,-calpha,
			0,0,0, -salpha,0,-calpha,

			0,salpha,-calpha, rx0,ry0,-calpha, rx0,ry0,-calpha, rx1,ry1,-calpha, rx1,ry1,-calpha, rx2,ry2,-calpha, rx2,ry2,-calpha, salpha,0,-calpha,
		
			salpha,0,-calpha, rx2,-ry2,-calpha, rx2,-ry2,-calpha, rx1,-ry1,-calpha, rx1,-ry1,-calpha, rx0,-ry0,-calpha, rx0,-ry0,-calpha, 0,-salpha,-calpha,
			0,-salpha,-calpha, -rx0,-ry0,-calpha, -rx0,-ry0,-calpha, -rx1,-ry1,-calpha, -rx1,-ry1,-calpha, -rx2,-ry2,-calpha, -rx2,-ry2,-calpha, -salpha,0,-calpha,

			-salpha,0,-calpha, -rx2,ry2,-calpha, -rx2,ry2,-calpha, -rx1,ry1,-calpha, -rx1, ry1,-calpha, -rx0,ry0,-calpha, -rx0,ry0,-calpha,  0,salpha,-calpha
		];
		let color = [
			1,1,1,1, 1,1,0,1,
			1,1,1,1, 1,1,0,1,
			1,1,1,1, 1,1,0,1,
			1,1,1,1, 1,1,0,1,

			1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
			1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
			
			1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
			1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1
		];

		if (!this._spotGizmo) {
			this._spotGizmo = buildPlist(context,vertex,color);
		}
		else {
			this._spotGizmo.updateBuffer(bg.base.BufferType.VERTEX,vertex);
			this._spotGizmo.updateBuffer(bg.base.BufferType.COLOR,color);
		}
		return this._spotGizmo;
	}

	function getPointGizmo() {
		if (!this._pointGizmo) {
			let context = this.node.context;
			let r = 0.5;
			let s = bg.Math.sin(bg.Math.PI_4) * r;
			let vertex = [
				// x-y plane
				0,0,0, 0,r,0, 0,0,0, 0,-r,0, 0,0,0, -r,0,0, 0,0,0, r,0,0,
				0,0,0, s,s,0, 0,0,0, s,-s,0, 0,0,0, -s,s,0, 0,0,0, -s,-s,0,

				// z, -z
				0,0,0, 0,0,r, 0,0,0, 0,0,-r,
				0,0,0, 0,s,s, 0,0,0, 0,-s,s, 0,0,0, 0,-s,-s, 0,0,0, 0,s,-s,
				0,0,0, s,0,s, 0,0,0, -s,0,s, 0,0,0, -s,0,-s, 0,0,0, s,0,-s
			];
			let color = [
				1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1,
				1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1,
				1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1,
				1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1,
				1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,0,1
			];
			this._pointGizmo = buildPlist(context,vertex,color);
		}
		return this._pointGizmo;
	}

	function getGizmo() {
		switch (this._light && this._light.type) {
		case bg.base.LightType.DIRECTIONAL:
			return getDirectionalGizmo.apply(this);
		case bg.base.LightType.SPOT:
			return getSpotGizmo.apply(this);
		case bg.base.LightType.POINT:
			return getPointGizmo.apply(this);
		}
		return null;
	}
	
	class Light extends bg.scene.Component {
		// The active lights are the lights that are attached to a node
		// in the scene.
		static GetActiveLights() {
			return s_lightRegister;
		}
		
		constructor(light = null) {
			super();
			this._light = light;
			this._visitor = new bg.scene.TransformVisitor();
			this._rebuildTransform = true;
		}
		
		clone() {
			let newLight = new bg.scene.Light();
			newLight.light = this.light.clone();
			return newLight;
		}
		
		get light() { return this._light; }
		set light(l) { this._light = l; }
		
		get transform() {
			if (this._rebuildTransform && this.node) {
				this._visitor.matrix.identity();
				this.node.acceptReverse(this._visitor);
				this._rebuildTransform = false;
			}
			return this._visitor.matrix;
		}
		
		frame(delta) {
			this._rebuildTransform = true;
			this.transform;
		}

		displayGizmo(pipeline,matrixState) {
			let plist = getGizmo.apply(this);
			if (plist) {
				pipeline.draw(plist);
			}
		}
		
		removedFromNode(node) {
			unregisterLight(this);
		}
		
		addedToNode(node) {
			registerLight(this);
		}

		deserialize(context,sceneData,url) {
			return new Promise((resolve,reject) => {
				this._light = new bg.base.Light(context);
				this._light.deserialize(sceneData);
				resolve(this);
			});
		}

		serialize(componentData,promises,url) {
			super.serialize(componentData,promises,url);
			this.light.serialize(componentData);
		}
	}

	bg.scene.registerComponent(bg.scene,Light,"bg.scene.Light");
})();