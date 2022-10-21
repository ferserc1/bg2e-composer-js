(function() {

	function createGizmo() {
		let v = [];
		let n = [];
		let t = [];
		let c = [];
		let indexes = [];
		let valid = false;
		let vectorScale = 0.4;
		let currentIndex = 0;
		try {
			this.forEach((plist) => {
				// The gizmo shows normals, tangents and bitangents, so only works with
				// triangles
				if (plist.normal.length && plist.tangent.length && plist.index.length%3==0) {
					valid = true;
					
					for (let i = 0; i<plist.index.length; ++i) {
						let i0 = plist.index[i];
						let vert = new bg.Vector3(plist.vertex[i0 * 3], plist.vertex[i0 * 3 + 1], plist.vertex[i0 * 3 + 2]);
						let norm = new bg.Vector3(plist.normal[i0 * 3], plist.normal[i0 * 3 + 1], plist.normal[i0 * 3 + 2]);
						let tang = new bg.Vector3(plist.tangent[i0 * 3], plist.tangent[i0 * 3 + 1], plist.tangent[i0 * 3 + 2]);
						let bitg = new bg.Vector3(norm);
						bitg.cross(tang);
						norm.scale(vectorScale);
						tang.scale(vectorScale);
						bitg.scale(vectorScale);
						norm.add(vert);
						tang.add(vert);
						bitg.add(vert);
						v.push(vert.x, vert.y, vert.z); n.push(0,1,0); t.push(0,0); c.push(0,1,0,1);
						v.push(norm.x, norm.y, norm.z); n.push(0,1,0); t.push(0,1); c.push(0,1,0,1);
						v.push(vert.x, vert.y, vert.z); n.push(0,1,0); t.push(0,0); c.push(1,0,0,1);
						v.push(tang.x, tang.y, tang.z); n.push(0,1,0); t.push(0,1); c.push(1,0,0,1);
						v.push(vert.x, vert.y, vert.z); n.push(0,1,0); t.push(0,0); c.push(0,0,1,1);
						v.push(bitg.x, bitg.y, bitg.z); n.push(0,1,0); t.push(0,1); c.push(0,0,1,1);
						indexes.push(currentIndex++); indexes.push(currentIndex++);
						indexes.push(currentIndex++); indexes.push(currentIndex++);
						indexes.push(currentIndex++); indexes.push(currentIndex++);
					}
				}
			});
		}
		catch(err) {
			console.warn("Error generating drawable gizmo: " + err.message);
		}
		

		let result = null;
		
		if (valid) {
			result = new bg.base.PolyList(this.node.context);

			result.vertex = v;
			result.normal = n;
			result.texCoord0 = t;
			result.index = indexes;
			result.color = c;
			result.drawMode = bg.base.DrawMode.LINES;
			result.build();
		}

		return result;
	}

	function escapePathCharacters(name) {
		if (!name) {
			return bg.utils.generateUUID();
		}
		else {
			var illegalRe = /[\/\?<>\\:\*\|":\[\]\(\)\{\}]/g;
			var controlRe = /[\x00-\x1f\x80-\x9f]/g;
			var reservedRe = /^\.+$/;
			var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
			var windowsTrailingRe = /[\. ]+$/;

			function sanitize(input, replacement) {
				var sanitized = input
					.replace(illegalRe, replacement)
					.replace(controlRe, replacement)
					.replace(reservedRe, replacement)
					.replace(windowsReservedRe, replacement)
					.replace(windowsTrailingRe, replacement);
				return sanitized;
			}

			return sanitize(name,'-');
		}
	}
	class Drawable extends bg.scene.Component {
				
		// It creates a copy of the node with all its components, except the drawable
		// component, that will be an instance (share the same polyList instances)
		static InstanceNode(node) {
			let newNode = new bg.scene.Node(node.context,node.name ? `copy of ${node.name}`:"");
			newNode.enabled = node.enabled;
			node.forEachComponent((comp) => {
				let newComp = null;
				if (comp instanceof Drawable) {
					newComp = comp.instance();
				}
				else {
					newComp = comp.clone();
				}
				newNode.addComponent(newComp);
			});
			return newNode;
		}
		
		constructor(name="") {
			super();

			this._name = name;			
			this._items = []; // { polyList:p, material:m, transform:t }
		}
		
		get name() { return this._name; }
		set name(n) { this._name = n; }

		get length() { return this._items.length; }
		
		clone(newName) {
			let newInstance = new bg.scene.Drawable();
			newInstance.name = newName || `copy of ${this.name}`;
			this.forEach((plist,material,trx) => {
				newInstance.addPolyList(plist.clone(), material.clone(), trx ? new bg.Matrix4(trx):null);
			});
			return newInstance;
		}

		destroy() {
			this.forEach((plist,mat) => {
				plist.destroy();
				if (mat && mat.destroy) {
					mat.destroy();
				}
			});
			this._name = "";
			this._items = [];
		}
		
		// It works as clone(), but it doesn't duplicate the polyList
		instance(newName) {
			let newInstance = new bg.scene.Drawable();
			newInstance.name = newName || `copy of ${this.name}`;
			this.forEach((plist,material,trx) => {
				newInstance.addPolyList(plist, material.clone(), trx ? new bg.Matrix4(trx):null);
			});
			return newInstance;
		}
		
		addPolyList(plist,mat,trx=null) {
			if (plist && this.indexOf(plist)==-1) {
				this._updated = false;
				mat = mat || new bg.base.Material();
				
				this._items.push({
					polyList:plist,
					material:mat,
					transform:trx
				});
				return true;
			}
			return false;
		}

		getExternalResources(resources = []) {
			this.forEach((plist,material) => {
				material.getExternalResources(resources)
			});
			return resources;
		}

		// Apply a material definition object to the polyLists
		applyMaterialDefinition(materialDefinitions,resourcesUrl) {
			let promises = [];
			this.forEach((plist,mat) => {
				let definition = materialDefinitions[plist.name];
				if (definition) {
					promises.push(new Promise((resolve,reject) => {
						let modifier = new bg.base.MaterialModifier(definition);
						mat.applyModifier(plist.context,modifier,resourcesUrl);
						resolve();
					}));
				}
			});
			return Promise.all(promises);
		}
		
		removePolyList(plist) {
			let index = -1;
			this._items.some((item, i) => {
				if (plist==item.polyList) {
					index = i;
				}
			})
			if (index>=0) {
				this._items.splice(index,1);
			}
			this._updated = false;
		}
		
		indexOf(plist) {
			let index = -1;
			this._items.some((item,i) => {
				if (item.polyList==plist) {
					index = i;
					return true;
				}
			});
			return index;
		}
		
		replacePolyList(index,plist) {
			if (index>=0 && index<this._items.length) {
				this._items[index].polyList = plist;
				return true;
			}
			this._updated = false;
			return false;
		}
		
		replaceMaterial(index,mat) {
			if (index>=0 && index<this._items.length) {
				// Release PBR material resources
				if (this._items[index].material.destroy) {
					this._items[index].material.destroy();
				}
				this._items[index].material = mat;
				return true;
			}
			return false;
		}
		
		replaceTransform(index,trx) {
			if (index>=0 && index<this._items.length) {
				this._items[index].transform = trx;
				return true;
			}
			return false;
		}
		
		getPolyList(index) {
			if (index>=0 && index<this._items.length) {
				return this._items[index].polyList;
			}
			return false;
		}
		
		getMaterial(index) {
			if (index>=0 && index<this._items.length) {
				return this._items[index].material;
			}
			return false;
		}
		
		getTransform(index) {
			if (index>=0 && index<this._items.length) {
				return this._items[index].transform;
			}
			return false;
		}
		
		
		forEach(callback) {
			for (let elem of this._items) {
				callback(elem.polyList,elem.material,elem.transform);
			}
		}
		
		some(callback) {
			for (let elem of this._items) {
				if (callback(elem.polyList,elem.material,elem.transform)) {
					return true;
				}
			}
			return false;
		}
		
		every(callback) {
			for (let elem of this._items) {
				if (!callback(elem.polyList,elem.material,elem.transform)) {
					return false;
				}
			}
			return true;
		}
		
		////// Direct rendering method: will be deprecated soon
		display(pipeline,matrixState,forceDraw=false) {
			if (!pipeline.effect) {
				throw new Error("Could not draw component: invalid effect found.");
			}

			let isShadowMap = pipeline.effect instanceof bg.base.ShadowMapEffect;

			if (!this.node.enabled) {
				return;
			}
			else {
				this.forEach((plist,mat,trx) => {
					if ((!isShadowMap && plist.visible) || (isShadowMap && plist.visibleToShadows) || forceDraw) {
						let currMaterial = pipeline.effect.material;
						if (trx) {
							matrixState.modelMatrixStack.push();
							matrixState.modelMatrixStack.mult(trx);
						}
						
						if (pipeline.shouldDraw(mat)) {
							pipeline.effect.material = mat;
							pipeline.draw(plist);
						}
						
						if (trx) {
							matrixState.modelMatrixStack.pop();
						}
						pipeline.effect.material = currMaterial;
					}
				});
			}
		}

		//// Render queue method
		draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			if (!this.node.enabled) {
				return;
			}

			this.forEach((plist,mat,trx) => {
				if (!plist.visible) {
					return;
				}
				if (trx) {
					modelMatrixStack.push();
					modelMatrixStack.mult(trx);
				}

				if (mat.isTransparent) {
					renderQueue.renderTransparent(plist,mat,modelMatrixStack.matrix,viewMatrixStack.matrix);
				}
				else {
					renderQueue.renderOpaque(plist,mat,modelMatrixStack.matrix,viewMatrixStack.matrix);
				}

				if (trx) {
					modelMatrixStack.pop(trx);
				}
			});
		}

		// Display gizmo: shows the normal and tangent vectors
		displayGizmo(pipeline,matrixState) {
			if (!this._updated) {
				this._updated = true;
				this._gizmoPlist = createGizmo.apply(this);
			}
			if (this._gizmoPlist) {
				pipeline.draw(this._gizmoPlist);
			}
		}
		
		setGroupVisible(groupName,visibility=true) {
			this.forEach((plist) => {
				if (plist.groupName==groupName) {
					plist.visible = visibility;
				}
			});
		}
		
		hideGroup(groupName) { this.setGroupVisible(groupName,false); }
		
		showGroup(groupName) { this.setGroupVisible(groupName,true); }
		
		setVisibleByName(name,visibility=true) {
			this.some((plist) => {
				if (plist.name==name) {
					plist.visible = visibility;
					return true;
				}
			});
		}
		
		showByName(name) {
			this.setVisibleByName(name,true);
		}
		
		hideByName(name) {
			this.setVisibleByName(name,false);
		}
		
		deserialize(context,sceneData,url) {
			return new Promise((resolve,reject) => {
				let modelUrl = bg.utils.Resource.JoinUrl(url,sceneData.name + '.vwglb');
				bg.base.Loader.Load(context,modelUrl)
					.then((node) => {
						let drw = node.component("bg.scene.Drawable");
						this._name = sceneData.name;
						this._items = drw._items;
						resolve(this);
					});
			});
		}

		serialize(componentData,promises,url) {
			if (!bg.isElectronApp) {
				return;
			}
			super.serialize(componentData,promises,url);
			this.name = escapePathCharacters(this.name);
		
			componentData.name = this.name;
			const path = require('path');
			let dst = path.join(url.path,componentData.name + ".vwglb");
			promises.push(new Promise((resolve,reject) => {
				bg.base.Writer.Write(dst,this.node)
					.then(() => resolve())
					.catch((err) => reject(err));
			}));
		}
	}
	
	bg.scene.registerComponent(bg.scene,Drawable,"bg.scene.Drawable");
	
})();