(function() {
		
	function readBlock(arrayBuffer,offset) {
		var block = new Uint8Array(arrayBuffer,offset,4);
		block = String.fromCharCode(block[0]) + String.fromCharCode(block[1]) + String.fromCharCode(block[2]) + String.fromCharCode(block[3]);
		return block;
	}

	function readInt(arrayBuffer,offset) {
		var dataView = new DataView(arrayBuffer,offset,4);
		return dataView.getInt32(0);
	}
	
	function readFloat(arrayBuffer,offset) {
		var dataView = new DataView(arrayBuffer,offset,4);
		return dataView.getFloat32(0);
	}
	
	function readMatrix4(arrayBuffer,offset) {
		var response = {offset:0,data:[]}
		var size = 16;
		var dataView = new DataView(arrayBuffer,offset, size*4);
		var littleEndian = false;
		for (var i=0;i<size;++i) {
			response.data[i] = dataView.getFloat32(i*4,littleEndian);
		}
		response.offset += size * 4;
		return response;
	}

	function readString(arrayBuffer,offset) {
		var response = {offset:0,data:""}
		var size = readInt(arrayBuffer,offset);
		response.offset += 4;
		var strBuffer = new Uint8Array(arrayBuffer, offset + 4, size);
		for (var i=0;i<size;++i) {
			response.data += String.fromCharCode(strBuffer[i]);
		}
		response.offset += size;
		return response;
	}
	
	function readFloatArray(arrayBuffer,offset) {
		var response = {offset:0,data:[]}
		var size = readInt(arrayBuffer,offset);
		response.offset += 4;
		var dataView = new DataView(arrayBuffer,offset + 4, size*4);
		var littleEndian = false;
		for (var i=0;i<size;++i) {
			response.data[i] = dataView.getFloat32(i*4,littleEndian);
		}
		response.offset += size * 4;
		return response;
	}
	
	function readIndexArray(arrayBuffer,offset) {
		var response = {offset:0,data:[]}
		var size = readInt(arrayBuffer,offset);
		response.offset += 4;
		var dataView = new DataView(arrayBuffer,offset + 4, size*4);
		var littleEndian = false;
		for (var i=0;i<size;++i) {
			response.data[i] = dataView.getInt32(i*4,littleEndian);
		}
		response.offset += size * 4;
		return response;
	}
	
	function addJoint(node,type,jointData) {
		let joint =  new bg.physics[jointData.type]();
		joint.offset = new bg.Vector3(...jointData.offset);
		joint.roll = jointData.roll;
		joint.pitch = jointData.pitch;
		joint.yaw = jointData.yaw;
		let component = new bg.scene[type](joint);
		node.addComponent(component);
	}
	
	class VWGLBParser {
		constructor(context,data) {
			this._context = context;
		}

		loadDrawable(data,path) {
			this._jointData = null;
			var parsedData = this.parseData(data);
			return this.createDrawable(parsedData,path);
		}
		
		parseData(data) {
			let polyLists = [];
			let materials = null;
			let components = null;
			
			let offset = 0;
			let header = new Uint8Array(data,0,8);
			offset = 8;
			let hdr = String.fromCharCode(header[4]) + String.fromCharCode(header[5]) + String.fromCharCode(header[6]) + String.fromCharCode(header[7]);
			
			if (header[0]==1) throw "Could not open the model file. This file has been saved as computer (little endian) format, try again saving it in network (big endian) format";
			if (hdr!='hedr') throw "File format error. Expecting header";
			
			let version = {maj:header[1],min:header[2],rev:header[3]};
			bg.log("vwglb file version: " + version.maj + "." + version.min + "." + version.rev + ", big endian");
			
			let numberOfPolyList = readInt(data,offset);
			offset += 4;
			
			let mtrl = readBlock(data,offset);
			offset += 4;
			if (mtrl!='mtrl') throw "File format error. Expecting materials definition";
			
			let matResult = readString(data,offset);
			offset += matResult.offset;
			materials = JSON.parse(matResult.data);
			
			let proj = readBlock(data,offset);
			if (proj=='proj') {
				// Projectors are deprecated. This section only skips the projector section
				offset += 4;				
				let shadowTexFile = readString(data,offset);
				offset += shadowTexFile.offset;
				
				let attenuation = readFloat(data,offset);
				offset +=4;
				
				let projectionMatData = readMatrix4(data,offset);
				offset += projectionMatData.offset;
				let projMatrix = projectionMatData.data;
				
				let transformMatData = readMatrix4(data,offset);
				offset += transformMatData.offset;
				let transMatrix = transformMatData.data;
				
				// model projectors are deprecated
				//projector = new vwgl.Projector();
				//projector.setProjection(new vwgl.Matrix4(projMatrix));
				//projector.setTransform(new vwgl.Matrix4(transMatrix));
				//projector.setTexture(loader.loadTexture(shadowTexFile.data))
			}
			
			let join = readBlock(data,offset);
			if (join=='join') {
				offset += 4;
				
				let jointData = readString(data,offset);
				offset += jointData.offset;
				
				let jointText = jointData.data;
				try {
					this._jointData = JSON.parse(jointText);
				}
				catch (e) {
					throw new Error("VWGLB file format reader: Error parsing joint data");
				}
			}
			
			let block = readBlock(data,offset);
			if (block!='plst') throw "File format error. Expecting poly list";
			let done = false;
			offset += 4;
			let plistName;
			let matName;
			let vArray;
			let nArray;
			let t0Array;
			let t1Array;
			let t2Array;
			let iArray;
			while (!done) {
				block = readBlock(data,offset);
				offset += 4;
				let strData = null;
				let tarr = null;
				switch (block) {
				case 'pnam':
					strData = readString(data,offset);
					offset += strData.offset;
					plistName = strData.data;
					break;
				case 'mnam':
					strData = readString(data,offset);
					offset += strData.offset;
					matName = strData.data;
					break;
				case 'varr':
					let varr = readFloatArray(data,offset);
					offset += varr.offset;
					vArray = varr.data;
					break;
				case 'narr':
					let narr = readFloatArray(data,offset);
					offset += narr.offset;
					nArray = narr.data;
					break;
				case 't0ar':
					tarr = readFloatArray(data,offset);
					offset += tarr.offset;
					t0Array = tarr.data;
					break;
				case 't1ar':
					tarr = readFloatArray(data,offset);
					offset += tarr.offset;
					t1Array = tarr.data;
					break;
				case 't2ar':
					tarr = readFloatArray(data,offset);
					offset += tarr.offset;
					t2Array = tarr.data;
					break;
				case 'indx':
					let iarr = readIndexArray(data,offset);
					offset += iarr.offset;
					iArray = iarr.data;
					break;
				case 'plst':
				case 'endf':
					if (block=='endf' && (offset + 4)<data.byteLength) {
						try {
							block = readBlock(data,offset);
							offset += 4;
							if (block=='cmps') {
								let componentData = readString(data,offset);
								offset += componentData.offset;
	
								// Prevent a bug in the C++ API version 2.0, that inserts a comma after the last
								// element of some arrays and objects
								componentData.data = componentData.data.replace(/,[\s\r\n]*\]/g,']');
								componentData.data = componentData.data.replace(/,[\s\r\n]*\}/g,'}');
								components = JSON.parse(componentData.data);
							}
						}
						catch (err) {
							console.error(err.message);
						}
						done = true;
					}
					else if ((offset + 4)>=data.byteLength) {
						done = true;
					}

					let plistData = {
						name:plistName,
						matName:matName,
						vertices:vArray,
						normal:nArray,
						texcoord0:t0Array,
						texcoord1:t1Array,
						texcoord2:t2Array,
						indices:iArray
					}
					polyLists.push(plistData)
					plistName = "";
					matName = "";
					vArray = null;
					nArray = null;
					t0Array = null;
					t1Array = null;
					t2Array = null;
					iArray = null;
					break;
				default:
					throw "File format exception. Unexpected poly list member found";
				}
			}

			var parsedData =  {
				version:version,
				polyList:polyLists,
				materials: {}
			}
			this._componentData = components;
			materials.forEach((matData) => {
				parsedData.materials[matData.name] = matData;
			});
			return parsedData;
		}
		
		createDrawable(data,path) {
			let drawable = new bg.scene.Drawable(this.context);
			drawable._version = data.version;
			let promises = [];
			
			data.polyList.forEach((plistData) => {
				let materialData = data.materials[plistData.matName];
				
				let polyList = new bg.base.PolyList(this._context);
				polyList.name = plistData.name;
				polyList.vertex = plistData.vertices || polyList.vertex;
				polyList.normal = plistData.normal || polyList.normal;
				polyList.texCoord0 = plistData.texcoord0 || polyList.texCoord0;
				polyList.texCoord1 = plistData.texcoord1 || polyList.texCoord1;
				polyList.texCoord2 = plistData.texcoord2 || polyList.texCoord2;
				polyList.index = plistData.indices || polyList.index;
				
				polyList.groupName = materialData.groupName || "";
				polyList.visible = materialData.visible!==undefined ? materialData.visible : true;
				polyList.visibleToShadows = materialData.visibleToShadows!==undefined ? materialData.visibleToShadows : true;
				
				polyList.build();

				if (materialData['class'] == 'PBRMaterial') {
					promises.push(bg.base.PBRMaterial.GetMaterialWithJson(this._context,materialData,path)
						.then(function(material) {
							drawable.addPolyList(polyList,material);
						}));
				}
				else {
					promises.push(bg.base.Material.GetMaterialWithJson(this._context,materialData,path)
						.then(function(material) {
							drawable.addPolyList(polyList,material);
						}));	
				}
			});
			
			return Promise.all(promises)
				.then(() => {
					return drawable;
				});
		}
		
		addComponents(node,url) {
			if (this._jointData) {
				let i = null;
				let o = null;
				if (this._jointData.input) {
					i = this._jointData.input;
				}
				if (this._jointData.output && this._jointData.output.length) {
					o = this._jointData.output[0];
				}
				
				if (i) addJoint(node,"InputChainJoint",i);
				if (o) addJoint(node,"OutputChainJoint",o);
			}

			if (this._componentData) {
				console.log("Component data found");
				let baseUrl = url;
				if (bg.isElectronApp) {
					baseUrl = bg.base.Writer.StandarizePath(url);
				}
				baseUrl = baseUrl.split("/");
				baseUrl.pop();
				baseUrl = baseUrl.join("/");
				this._componentData.forEach((cmpData) => {
					bg.scene.Component.Factory(this.context,cmpData,node,baseUrl)
				})
			}
		}
	}
	
	class VWGLBLoaderPlugin extends bg.base.LoaderPlugin {
		acceptType(url,data) {
			let ext = bg.utils.Resource.GetExtension(url);
			return ext=="vwglb" || ext=="bg2";
		}
		
		load(context,url,data) {
			return new Promise((accept,reject) => {
				if (data) {
					try {
						let parser = new VWGLBParser(context,data);
						let path = url.substr(0,url.lastIndexOf("/"));
						parser.loadDrawable(data,path)
							.then((drawable) => {
								let node = new bg.scene.Node(context,drawable.name);
								node.addComponent(drawable);
								parser.addComponents(node,url);
								accept(node);
							});
					}
					catch(e) {
						reject(e);
					}
				}
				else {
					reject(new Error("Error loading drawable. Data is null"));
				}
			});
		}
	}

	// This plugin load vwglb and bg2 files, but will also try to load the associated bg2mat file
	class Bg2LoaderPlugin extends VWGLBLoaderPlugin {
		load(context,url,data) {
			let promise = super.load(context,url,data);
			return new Promise((resolve,reject) => {
				promise
					.then((node) => {
						let basePath = url.split("/");
						basePath.pop();
						basePath = basePath.join("/") + '/';
						let matUrl = url.split(".");
						matUrl.pop();
						matUrl.push("bg2mat");
						matUrl = matUrl.join(".");
						bg.utils.Resource.LoadJson(matUrl)
							.then((matData) => {
								let promises = [];
								try {
									let drw = node.component("bg.scene.Drawable");
									drw.forEach((plist,mat)=> {
										let matDef = null;
										matData.some((defItem) => {
											if (defItem.name==plist.name) {
												matDef = defItem;
												return true;
											}
										});
										
										if (matDef) {
											let p = matDef["class"] == 'PBRMaterial' ?
														bg.base.PBRMaterial.FromMaterialDefinition(context,matDef,basePath) :
														bg.base.Material.FromMaterialDefinition(context,matDef,basePath);
											promises.push(p)
											p.then((newMat) => {
													mat.assign(newMat);
												});
										}
									});
								}
								catch(err) {
									
								}
								return Promise.all(promises);
							})
							.then(() => {
								resolve(node);
							})
							.catch(() => {	// bg2mat file not found
								resolve(node);
							});
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
	}

	bg.base.VWGLBLoaderPlugin = VWGLBLoaderPlugin;
	bg.base.Bg2LoaderPlugin = Bg2LoaderPlugin;
	
})();