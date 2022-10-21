(function() {
	let s_pbrMaterials = false;

	function createCube(context,w,h,d) {
		let plist = new bg.base.PolyList(context);
        
		let x = w/2;
		let y = h/2;
		let z = d/2;
		
		plist.vertex = [
			 x,-y,-z, -x,-y,-z, -x, y,-z,  x, y,-z,		// back face
			 x,-y, z,  x,-y,-z,  x, y,-z,  x, y, z,		// right face 
			-x,-y, z,  x,-y, z,  x, y, z, -x, y, z, 	// front face
			-x,-y,-z, -x,-y, z, -x, y, z, -x, y,-z,		// left face
			-x, y, z,  x, y, z,  x, y,-z, -x, y,-z,		// top face
			 x,-y, z, -x,-y, z, -x,-y,-z,  x,-y,-z		// bottom face
		];
		
		plist.normal = [
			 0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,		// back face
			 1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,		// right face 
			 0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1, 	// front face
			-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,		// left face
			 0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,		// top face
			 0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0		// bottom face
		];
		
		plist.texCoord0 = [
			0,0, 1,0, 1,1, 0,1,
			0,0, 1,0, 1,1, 0,1,
			0,0, 1,0, 1,1, 0,1,
			0,0, 1,0, 1,1, 0,1,
			0,0, 1,0, 1,1, 0,1,
			0,0, 1,0, 1,1, 0,1
		];

		plist.index = [
			 0, 1, 2,	 2, 3, 0,
			 4, 5, 6,	 6, 7, 4,
			 8, 9,10,	10,11, 8,
			12,13,14,	14,15,12,
			16,17,18,	18,19,16,
			20,21,22,	22,23,20
		];

		plist.texCoord1 = bg.tools.UVMap.atlas(plist.vertex,plist.index,0.03);
		
        plist.build();
		return plist;
	}
	
	function createPlane(context,w,d,plane='y') {
		let x = w / 2.0;
		let y = d / 2.0;
		
		let plist = new bg.base.PolyList(context);
		
		switch (plane.toLowerCase()) {
		case 'x':
			plist.vertex =[	0.000000,-x,-y,
							0.000000, x,-y,
							0.000000, x, y,
							0.000000, x, y,
							0.000000,-x, y,
							0.000000,-x,-y];
			
			plist.normal = [1.000000,0.000000,0.000000,
							1.000000,0.000000,0.000000,
							1.000000,0.000000,0.000000,
							1.000000,0.000000,0.000000,
							1.000000,0.000000,0.000000,
							1.000000,0.000000,0.000000];

			plist.texCoord0 = [	0.000000,0.000000,
				1.000000,0.000000,
				1.000000,1.000000,
				1.000000,1.000000,
				0.000000,1.000000,
				0.000000,0.000000];
	

			plist.index = [2,1,0,5,4,3];
			break;
		case 'y':
			plist.vertex =[	-x,0.000000,-y,
							 x,0.000000,-y,
							 x,0.000000, y,
							 x,0.000000, y,
							-x,0.000000, y,
							-x,0.000000,-y];

			plist.normal = [0.000000,1.000000,0.000000,
							0.000000,1.000000,0.000000,
							0.000000,1.000000,0.000000,
							0.000000,1.000000,0.000000,
							0.000000,1.000000,0.000000,
							0.000000,1.000000,0.000000];

			plist.texCoord0 = [	0.000000,0.000000,
				1.000000,0.000000,
				1.000000,1.000000,
				1.000000,1.000000,
				0.000000,1.000000,
				0.000000,0.000000];
	

			plist.index = [2,1,0,5,4,3];
			break;
		case 'z':
			plist.vertex =[-x, y,0.000000,
						-x,-y,0.000000,
						   x,-y,0.000000,
						   x,-y,0.000000,
						   x, y,0.000000,
						-x, y,0.000000];

			plist.normal = [0.000000,0.000000,1.000000,
							0.000000,0.000000,1.000000,
							0.000000,0.000000,1.000000,
							0.000000,0.000000,1.000000,
							0.000000,0.000000,1.000000,
							0.000000,0.000000,1.000000];
	
			plist.texCoord0 = [
				0.000000,1.000000,
				0.000000,0.000000,
				1.000000,0.000000,
				1.000000,0.000000,
				1.000000,1.000000,
				0.000000,1.000000];
	
			plist.index = [0,1,2,3,4,5];
			break;
		}

	
		plist.texCoord1 = [
			0.00,0.95,
			0.00,0.00,
			0.95,0.00,
			0.95,0.00,
			0.95,0.95,
			0.00,0.95
		];

		
		
		plist.build();
		return plist;
	}

	function _createSphere(context,radius,slices,stacks) {

	}

	function createSphere(context,radius,slices,stacks) {
		let plist = new bg.base.PolyList(context);
	
		++slices;
		const R = 1/(stacks-1);
		const S = 1/(slices-1);
		let r, s;
				
		let vertex = [];
		let normal = [];
		let tangent = [];
		let texCoord = [];
		let index = [];
	
		for(r = 0; r < stacks; r++) for(s = 0; s < slices; s++) {
			const y = bg.Math.sin( -bg.Math.PI_2 + bg.Math.PI * r * R );
			const x = bg.Math.cos(2*bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);
			const z = bg.Math.sin(2*bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);
			const ty = bg.Math.cos(2*bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);
			const tx = bg.Math.sin( -bg.Math.PI_2 + bg.Math.PI * r * R );
			const tz = bg.Math.sin(2*bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);

			texCoord.push(s * S); texCoord.push(r * R);
			normal.push(x,y,z);
			tangent.push(tx,ty,tz);
			vertex.push(x * radius, y * radius, z * radius);
		}

		for(r = 0; r < stacks - 1; r++) for(s = 0; s < slices - 1; s++) {
			let i1 = r * slices + s;
			let i2 = r * slices + (s + 1);
			let i3 = (r + 1) * slices + (s + 1);
			let i4 = (r + 1) * slices + s;
			index.push(i1); index.push(i4); index.push(i3);
			index.push(i3); index.push(i2); index.push(i1);
		}
		
		plist.vertex = vertex;
		plist.normal = normal;
		plist.texCoord0 = texCoord;
		plist.tangent = tangent;

		plist.texCoord1 = bg.tools.UVMap.atlas(vertex,index,0.03);
		plist.index = index;

		plist.build(false);	// Force not to rebuild tangents
		
		return plist;
	}
	
	function createDrawable(plist,name) {
		let drawable = new bg.scene.Drawable(name);
		let mat = s_pbrMaterials ? new bg.base.PBRMaterial() : new bg.base.Material();
		drawable.addPolyList(plist,mat);
		return drawable;
	}
	
	let s_objLoader = null;

	function applyTransform(polyList,matrix) {
        let newVertex = [];
        let newNormal = [];
        let rotationMatrix = matrix.rotation;
        for (let i=0; i<polyList.vertex.length; i+=3) {
            let newV = new bg.Vector3(polyList.vertex[i],polyList.vertex[i + 1],polyList.vertex[i + 2]);
            newV = matrix.multVector(newV);
            newVertex.push(newV.x,newV.y,newV.z);

            let newN = new bg.Vector3(polyList.normal[i],polyList.normal[i + 1],polyList.normal[i + 2]);
            newN = rotationMatrix.multVector(newN);
            newN.normalize();
            newNormal.push(newN.x,newN.y,newN.z);
        }
        polyList.vertex = newVertex;
        polyList.normal = newNormal;
        polyList.build();
    }

	function loadObjData(context,objData,name,trx) {
		if (!s_objLoader) {
			s_objLoader = new bg.base.OBJLoaderPlugin();
		}
		let node = s_objLoader.loadDataSync(context,objData,name);
		if (node) {
			let drw = node.drawable;
			drw.forEach((plist) => applyTransform(plist,trx));
			if (s_pbrMaterials) {
				let index = 0;
				drw.forEach((plist,mat) => {
					drw.replaceMaterial(index++, new bg.base.PBRMaterial());
				});
			}
			return drw;
		}
		else {
			return null;
		}
	}	

	class PrimitiveFactory {
		static SetPBRMaterials(pbrMat) {
			s_pbrMaterials = pbrMat;
		}

		static ObjDataPolyList(context,objData,name,trx = null) {
			let drw = loadObjData(context,objData,name,trx);
			let plist = null;
			drw.some((pl) => {
				plist = pl;
				return true;
			});
			return plist;
		}


		static CubePolyList(context,w=1,h,d) {
			h = h || w;
			d = d || w;
			let trx = bg.Matrix4.Scale(w,h,d);
			return PrimitiveFactory.ObjDataPolyList(context,bg.scene.primitiveData.cube,"Cube",trx);
		}

		static CubePolyList_procedural(context,w=1,h,d) {
			h = h || w;
			d = d || w;
			return createCube(context,w,h,d);
		}

		static PlanePolyList(context,w=1,d,plane='y') {
			d = d || w;
			let trx = bg.Matrix4.Scale(w,1,d);
			if (plane=="x") {
				trx.rotate(bg.Math.degreesToRadians(90),0,0,1);
			}
			else if (plane=="z") {
				trx.rotate(bg.Math.degreesToRadians(90),-1,0,0);
			}
			return PrimitiveFactory.ObjDataPolyList(context,bg.scene.primitiveData.plane,"Plane",trx);
		}

		static PlanePolyList_procedural(context,w=1,d,plane='y') {
			d = d || w;
			return createPlane(context,w,d,plane);
		}

		static SpherePolyList(context,r=1) {
			let trx = bg.Matrix4.Scale(r,r,r);
			return PrimitiveFactory.ObjDataPolyList(context,bg.scene.primitiveData.sphere,"Sphere",trx);
		}

		static SpherePolyList_procedural(context,r=1,slices=20,stacks) {
			stacks = stacks || slices;
			return createSphere(context,r,slices,stacks);
		}

		static Cube(context,w=1,h,d) {
			h = h || w;
			d = d || w;
			let trx = bg.Matrix4.Scale(w,h,d);
			return loadObjData(context,bg.scene.primitiveData.cube,"Cube",trx);
		}

		static Cube_procedural(context,w=1,h,d) {
			h = h || w;
			d = d || w;
			return createDrawable(createCube(context,w,h,d),"Cube");
		}
		
		static Plane_procedural(context,w=1,d,plane='y') {
			d = d || w;
			return createDrawable(createPlane(context,w,d,plane),"Plane");
		}

		static Plane(context,w=1,d,plane="y") {
			d = d || w;
			let trx = bg.Matrix4.Scale(w,1,d);
			if (plane=="x") {
				trx.rotate(bg.Math.degreesToRadians(90),0,0,1);
			}
			else if (plane=="z") {
				trx.rotate(bg.Math.degreesToRadians(90),-1,0,0);
			}
			return loadObjData(context,bg.scene.primitiveData.plane,"Plane",trx);
		}
		
		static Sphere(context,r=1) {
			let trx = bg.Matrix4.Scale(r*2,r*2,r*2);
			return loadObjData(context,bg.scene.primitiveData.sphere,"Sphere",trx);
		}

		static Sphere_procedural(context,r=1,slices=20,stacks) {
			stacks = stacks || slices;
			return createDrawable(createSphere(context,r,slices,stacks),"Sphere");
		}
	}
	
	bg.scene.PrimitiveFactory = PrimitiveFactory;
	
})();