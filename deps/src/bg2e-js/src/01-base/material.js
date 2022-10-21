(function() {
	bg.base.MaterialFlag = {
		DIFFUSE							: 1 << 0,
		SPECULAR						: 1 << 1,
		SHININESS						: 1 << 2,
		LIGHT_EMISSION					: 1 << 3,
		REFRACTION_AMOUNT				: 1 << 4,
		REFLECTION_AMOUNT				: 1 << 5,
		TEXTURE							: 1 << 6,
		LIGHT_MAP						: 1 << 7,
		NORMAL_MAP						: 1 << 8,
		TEXTURE_OFFSET					: 1 << 9,
		TEXTURE_SCALE					: 1 << 10,
		LIGHT_MAP_OFFSET				: 1 << 11,
		LIGHT_MAP_SCALE					: 1 << 12,
		NORMAL_MAP_OFFSET				: 1 << 13,
		NORMAL_MAP_SCALE				: 1 << 14,
		CAST_SHADOWS					: 1 << 15,
		RECEIVE_SHADOWS					: 1 << 16,
		ALPHA_CUTOFF					: 1 << 17,
		SHININESS_MASK					: 1 << 18,
		SHININESS_MASK_CHANNEL			: 1 << 19,
		SHININESS_MASK_INVERT			: 1 << 20,
		LIGHT_EMISSION_MASK				: 1 << 21,
		LIGHT_EMISSION_MASK_CHANNEL		: 1 << 22,
		LIGHT_EMISSION_MASK_INVERT		: 1 << 23,
		REFLECTION_MASK					: 1 << 24,
		REFLECTION_MASK_CHANNEL			: 1 << 25,
		REFLECTION_MASK_INVERT			: 1 << 26,
		CULL_FACE						: 1 << 27,
		ROUGHNESS						: 1 << 28,	// All the roughness attributes are controlled by this flag
		UNLIT							: 1 << 29
	};

	function loadTexture(context,image,url) {
		return bg.base.Texture.FromImage(context,image,url);
	}
	
	class MaterialModifier {
		constructor(jsonData) {
			this._modifierFlags = 0;

			this._diffuse = bg.Color.White();
			this._specular = bg.Color.White();
			this._shininess = 0;
			this._lightEmission = 0;
			this._refractionAmount = 0;
			this._reflectionAmount = 0;
			this._texture = null;
			this._lightmap = null;
			this._normalMap = null;
			this._textureOffset = new bg.Vector2();
			this._textureScale = new bg.Vector2(1);
			this._lightmapOffset = new bg.Vector2();
			this._lightmapScale = new bg.Vector2(1);
			this._normalMapOffset = new bg.Vector2();
			this._normalMapScale = new bg.Vector2(1);
			this._castShadows = true;
			this._receiveShadows = true;
			this._alphaCutoff = 0.5;
			this._shininessMask = null;
			this._shininessMaskChannel = 0;
			this._shininessMaskInvert = false;
			this._lightEmissionMask = null;
			this._lightEmissionMaskChannel = 0;
			this._lightEmissionMaskInvert = false;
			this._reflectionMask = null;
			this._reflectionMaskChannel = 0;
			this._reflectionMaskInvert = false;
			this._cullFace = true;
			this._roughness = true;
			this._roughnessMask = null;
			this._roughnessMaskChannel = 0;
			this._roughnessMaskInvert = false;
			this._unlit = false;

			if (jsonData) {
				if (jsonData.diffuseR!==undefined && jsonData.diffuseG!==undefined && jsonData.diffuseB!==undefined) {
					this.diffuse = new bg.Color(jsonData.diffuseR,
									  			jsonData.diffuseG,
									  			jsonData.diffuseB,
									  			jsonData.diffuseA ? jsonData.diffuseA : 1.0);
				}
				if (jsonData.specularR!==undefined && jsonData.specularG!==undefined && jsonData.specularB!==undefined) {
					this.specular = new bg.Color(jsonData.specularR,
									  			 jsonData.specularG,
									  			 jsonData.specularB,
									  			 jsonData.specularA ? jsonData.specularA : 1.0);
				}

				if (jsonData.shininess!==undefined) {
					this.shininess = jsonData.shininess;
				}

				if (jsonData.lightEmission!==undefined) {
					this.lightEmission = jsonData.lightEmission;
				}

				if (jsonData.refractionAmount!==undefined) {
					this.refractionAmount = jsonData.refractionAmount;
				}

				if (jsonData.reflectionAmount!==undefined) {
					this.reflectionAmount = jsonData.reflectionAmount;
				}

				if (jsonData.texture!==undefined) {
					this.texture = jsonData.texture;
				}

				if (jsonData.lightmap!==undefined) {
					this.lightmap = jsonData.lightmap;
				}


				if (jsonData.normalMap!==undefined) {
					this.normalMap = jsonData.normalMap;
				}
			
				if (jsonData.textureOffsetX!==undefined && jsonData.textureOffsetY!==undefined) {
					this.textureOffset = new bg.Vector2(jsonData.textureOffsetX,
														jsonData.textureOffsetY);
				}

				if (jsonData.textureScaleX!==undefined && jsonData.textureScaleY!==undefined) {
					this.textureScale = new bg.Vector2(jsonData.textureScaleX,
														jsonData.textureScaleY);
				}

				if (jsonData.lightmapOffsetX!==undefined && jsonData.lightmapOffsetY!==undefined) {
					this.lightmapOffset = new bg.Vector2(jsonData.lightmapOffsetX,
														 jsonData.lightmapOffsetY);
				}

				if (jsonData.lightmapScaleX!==undefined && jsonData.lightmapScaleY!==undefined) {
					this.lightmapScale = new bg.Vector2(jsonData.lightmapScaleX,
														 jsonData.lightmapScaleY);
				}

				if (jsonData.normalMapScaleX!==undefined && jsonData.normalMapScaleY!==undefined) {
					this.normalMapScale = new bg.Vector2(jsonData.normalMapScaleX,
														 jsonData.normalMapScaleY);
				}

				if (jsonData.normalMapOffsetX!==undefined && jsonData.normalMapOffsetY!==undefined) {
					this.normalMapOffset = new bg.Vector2(jsonData.normalMapOffsetX,
														 jsonData.normalMapOffsetY);
				}

				if (jsonData.castShadows!==undefined) {
					this.castShadows = jsonData.castShadows;
				}
				if (jsonData.receiveShadows!==undefined) {
					this.receiveShadows = jsonData.receiveShadows;
				}
				
				if (jsonData.alphaCutoff!==undefined) {
					this.alphaCutoff = jsonData.alphaCutoff;
				}

				if (jsonData.shininessMask!==undefined) {
					this.shininessMask = jsonData.shininessMask;
				}
				if (jsonData.shininessMaskChannel!==undefined) {
					this.shininessMaskChannel = jsonData.shininessMaskChannel;
				}
				if (jsonData.invertShininessMask!==undefined) {
					this.shininessMaskInvert = jsonData.invertShininessMask;
				}

				if (jsonData.lightEmissionMask!==undefined) {
					this.lightEmissionMask = jsonData.lightEmissionMask;
				}
				if (jsonData.lightEmissionMaskChannel!==undefined) {
					this.lightEmissionMaskChannel = jsonData.lightEmissionMaskChannel;
				}
				if (jsonData.invertLightEmissionMask!==undefined) {
					this.lightEmissionMaskInvert = jsonData.invertLightEmissionMask;
				}
				
				if (jsonData.reflectionMask!==undefined) {
					this.reflectionMask = jsonData.reflectionMask;
				}
				if (jsonData.reflectionMaskChannel!==undefined) {
					this.reflectionMaskChannel = jsonData.reflectionMaskChannel;
				}
				if (jsonData.invertReflectionMask!==undefined) {
					this.reflectionMaskInvert = jsonData.reflectionMaskInvert;
				}

				if (jsonData.roughness!==undefined) {
					this.roughness = jsonData.roughness;
				}
				if (jsonData.roughnessMask!==undefined) {
					this.roughnessMask = jsonData.roughnessMask;
				}
				if (jsonData.roughnessMaskChannel!==undefined) {
					this.roughnessMaskChannel = jsonData.roughnessMaskChannel;
				}
				if (jsonData.invertRoughnessMask!==undefined) {
					this.roughnessMaskInvert = jsonData.roughnessMaskInvert;
				}

				if (jsonData.unlit!==undefined) {
					this.unlit = jsonData.unlit;
				}
			}
		}
		
		get modifierFlags() { return this._modifierFlags; }
		set modifierFlags(f) { this._modifierFlags = f; }
		setEnabled(flag) { this._modifierFlags = this._modifierFlags | flag; }
		isEnabled(flag) { return (this._modifierFlags & flag)!=0; }
		
		get diffuse() { return this._diffuse; } 
		get specular() { return this._specular; } 
		get shininess() { return this._shininess; } 
		get lightEmission() { return this._lightEmission; } 
		get refractionAmount() { return this._refractionAmount; } 
		get reflectionAmount() { return this._reflectionAmount; } 
		get texture() { return this._texture; } 
		get lightmap() { return this._lightmap; } 
		get normalMap() { return this._normalMap; } 
		get textureOffset() { return this._textureOffset; } 
		get textureScale() { return this._textureScale; } 
		get lightmapOffset() { return this._lightmapOffset; } 
		get lightmapScale() { return this._lightmapScale; } 
		get normalMapOffset() { return this._normalMapOffset; } 
		get normalMapScale() { return this._normalMapScale; } 
		get castShadows() { return this._castShadows; } 
		get receiveShadows() { return this._receiveShadows; } 
		get alphaCutoff() { return this._alphaCutoff; } 
		get shininessMask() { return this._shininessMask; } 
		get shininessMaskChannel() { return this._shininessMaskChannel; } 
		get shininessMaskInvert() { return this._shininessMaskInvert; } 
		get lightEmissionMask() { return this._lightEmissionMask; } 
		get lightEmissionMaskChannel() { return this._lightEmissionMaskChannel; } 
		get lightEmissionMaskInvert() { return this._lightEmissionMaskInvert; } 
		get reflectionMask() { return this._reflectionMask; } 
		get reflectionMaskChannel() { return this._reflectionMaskChannel; } 
		get reflectionMaskInvert() { return this._reflectionMaskInvert; } 
		get cullFace() { return this._cullFace; }
		get roughness() { return this._roughness; }
		get roughnessMask() { return this._roughnessMask; }
		get roughnessMaskChannel() { return this._roughnessMaskChannel; }
		get roughnessMaskInvert() { return this._roughnessMaskInvert; }
		get unlit() { return this._unlit; }

		set diffuse(newVal) { this._diffuse = newVal; this.setEnabled(bg.base.MaterialFlag.DIFFUSE); }
		set specular(newVal) { this._specular = newVal; this.setEnabled(bg.base.MaterialFlag.SPECULAR); }
		set shininess(newVal) { if (!isNaN(newVal)) { this._shininess = newVal; this.setEnabled(bg.base.MaterialFlag.SHININESS); } }
		set lightEmission(newVal) { if (!isNaN(newVal)) { this._lightEmission = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION); } }
		set refractionAmount(newVal) { if (!isNaN(newVal)) { this._refractionAmount = newVal; this.setEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT); } }
		set reflectionAmount(newVal) { if (!isNaN(newVal)) { this._reflectionAmount = newVal; this.setEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT); } }
		set texture(newVal) { this._texture = newVal; this.setEnabled(bg.base.MaterialFlag.TEXTURE); }
		set lightmap(newVal) { this._lightmap = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP); }
		set normalMap(newVal) { this._normalMap = newVal; this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP); }
		set textureOffset(newVal) { this._textureOffset = newVal; this.setEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET); }
		set textureScale(newVal) { this._textureScale = newVal; this.setEnabled(bg.base.MaterialFlag.TEXTURE_SCALE); }
		set lightmapOffset(newVal) { this._lightmapOffset = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET); }
		set lightmapScale(newVal) { this._lightmapScale = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE); }
		set normalMapOffset(newVal) { this._normalMapOffset = newVal; this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET); }
		set normalMapScale(newVal) { this._normalMapScale = newVal; this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE); }
		set castShadows(newVal) { this._castShadows = newVal; this.setEnabled(bg.base.MaterialFlag.CAST_SHADOWS); }
		set receiveShadows(newVal) { this._receiveShadows = newVal; this.setEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS); }
		set alphaCutoff(newVal) { if (!isNaN(newVal)) { this._alphaCutoff = newVal; this.setEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF); } }
		set shininessMask(newVal) { this._shininessMask = newVal; this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK); }
		set shininessMaskChannel(newVal) { this._shininessMaskChannel = newVal; this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL); }
		set shininessMaskInvert(newVal) { this._shininessMaskInvert = newVal; this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT); }
		set lightEmissionMask(newVal) { this._lightEmissionMask = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK); }
		set lightEmissionMaskChannel(newVal) { this._lightEmissionMaskChannel = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL); }
		set lightEmissionMaskInvert(newVal) { this._lightEmissionMaskInvert = newVal; this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT); }
		set reflectionMask(newVal) { this._reflectionMask = newVal; this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK); }
		set reflectionMaskChannel(newVal) { this._reflectionMaskChannel = newVal; this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL); }
		set reflectionMaskInvert(newVal) { this._reflectionMaskInvert = newVal; this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT); }
		set cullFace(newVal) { this._cullFace = newVal; this.setEnabled(bg.base.MaterialFlag.CULL_FACE); }
		set roughness(newVal) { this._roughness = newVal; this.setEnabled(bg.base.MaterialFlag.ROUGHNESS); }
		set roughnessMask(newVal) { this._roughnessMask = newVal; this.setEnabled(bg.base.MaterialFlag.ROUGHNESS); }
		set roughnessMaskChannel(newVal) { this._roughnessMaskChannel = newVal; this.setEnabled(bg.base.MaterialFlag.ROUGHNESS); }
		set roughnessMaskInvert(newVal) { this._roughnessMaskInvert = newVal; this.setEnabled(bg.base.MaterialFlag.ROUGHNESS); }
		set unlit(newVal) { this._unlit = newVal; this.setEnabled(bg.base.MaterialFlag.UNLIT); }

		clone() {
			let copy = new MaterialModifier();
			copy.assign(this);
			return copy;
		}
		
		assign(mod) {
			this._modifierFlags = mod._modifierFlags;

			this._diffuse = mod._diffuse;
			this._specular = mod._specular;
			this._shininess = mod._shininess;
			this._lightEmission = mod._lightEmission;
			this._refractionAmount = mod._refractionAmount;
			this._reflectionAmount = mod._reflectionAmount;
			this._texture = mod._texture;
			this._lightmap = mod._lightmap;
			this._normalMap = mod._normalMap;
			this._textureOffset = mod._textureOffset;
			this._textureScale = mod._textureScale;
			this._lightmapOffset = mod._lightmapOffset;
			this._lightmapScale = mod._lightmapScale;
			this._normalMapOffset = mod._normalMapOffset;
			this._normalMapScale = mod._normalMapScale;
			this._castShadows = mod._castShadows;
			this._receiveShadows = mod._receiveShadows;
			this._alphaCutoff = mod._alphaCutoff;
			this._shininessMask = mod._shininessMask;
			this._shininessMaskChannel = mod._shininessMaskChannel;
			this._shininessMaskInvert = mod._shininessMaskInvert;
			this._lightEmissionMask = mod._lightEmissionMask;
			this._lightEmissionMaskChannel = mod._lightEmissionMaskChannel;
			this._lightEmissionMaskInvert = mod._lightEmissionMaskInvert;
			this._reflectionMask = mod._reflectionMask;
			this._reflectionMaskChannel = mod._reflectionMaskChannel;
			this._reflectionMaskInvert = mod._reflectionMaskInvert;
			this._cullFace = mod._cullFace;
			this._roughness = mod._roughness;
			this._roughnessMask = mod._roughnessMask;
			this._roughnessMaskChannel = mod._roughnessMaskChannel;
			this._roughnessMaskInvert = mod._roughnessMaskInvert;
			this._unlit = mod._unlit;
		}

		serialize() {
			let result = {};
			let mask = this._modifierFlags;

			if ( mask & bg.base.MaterialFlag.DIFFUSE) {
				result.diffuseR = this._diffuse.r;
				result.diffuseG = this._diffuse.g;
				result.diffuseB = this._diffuse.b;
				result.diffuseA = this._diffuse.a;
			}
			if ( mask & bg.base.MaterialFlag.SPECULAR) {
				result.specularR = this._specular.r;
				result.specularG = this._specular.g;
				result.specularB = this._specular.b;
				result.specularA = this._specular.a;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS) {
				result.shininess = this._shininess;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK) {
				result.shininessMask = this._shininessMask;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK_CHANNEL) {
				result.shininessMaskChannel = this._shininessMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK_INVERT) {
				result.invertShininessMask = this._shininessMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION) {
				result.lightEmission = this._lightEmission;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK) {
				result.lightEmissionMask = this._lightEmissionMask;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL) {
				result.lightEmissionMaskChannel = this._lightEmissionMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT) {
				result.invertLightEmissionMask = this._lightEmissionMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.REFRACTION_AMOUNT) {
				result.reflectionAmount = this._refractionAmount;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_AMOUNT) {
				result.refractionAmount = this._reflectionAmount;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE) {
				result.texture = this._texture;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP) {
				result.lightmap = this._lightmap;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP) {
				result.normalMap = this._normalMap;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE_OFFSET) {
				result.textureScaleX = this._textureScale.x;
				result.textureScaleY = this._textureScale.y;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE_SCALE) {
				result.textureScaleX = this._textureScale.x;
				result.textureScaleY = this._textureScale.y;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP_OFFSET) {
				result.lightmapOffsetX = this._lightmapOffset.x;
				result.lightmapOffsetY = this._lightmapOffset.y;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP_SCALE) {
				result.lightmapScaleX = this._lightmapScale.x;
				result.lightmapScaleY = this._lightmapScale.y;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP_OFFSET) {
				result.normalMapOffsetX = this._normalMapOffset.x;
				result.normalMapOffsetY = this._normalMapOffset.y;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP_SCALE) {
				result.normalMapScaleX = this._normalMapScale.x;
				result.normalMapScaleY = this._normalMapScale.y;
			}
			if ( mask & bg.base.MaterialFlag.CAST_SHADOWS) {
				result.castShadows = this._castShadows;
			}
			if ( mask & bg.base.MaterialFlag.RECEIVE_SHADOWS) {
				result.receiveShadows = this._receiveShadows;
			}
			if ( mask & bg.base.MaterialFlag.ALPHA_CUTOFF) {
				result.alphaCutoff = this._alphaCutoff;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK) {
				result.reflectionMask = this._reflectionMask;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL) {
				result.reflectionMaskChannel = this._reflectionMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK_INVERT) {
				result.invertReflectionMask = this._reflectionMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.CULL_FACE) {
				result.cullFace = this._cullFace;
			}
			if ( mask & bg.base.MaterialFlag.ROUGHNESS) {
				result.roughness = this._roughness;
				result.roughnessMask = this._roughnessMask;
				result.roughnessMaskChannel = this._roughnessMaskChannel;
				result.invertRoughnessMask = this._roughnessMaskInvert;
			}
			if (mask & bg.base.MaterialFlag.UNLIT) {
				result.unlit = this._unlit;
			}
			return result;
		}
	}
	
	bg.base.MaterialModifier = MaterialModifier;

	bg.base.imageTools = {};

	function isAbsolutePath(path) {
		if (bg.isElectronApp) {
			return /^\//i.test(path);
		}
		else {
			return /^(f|ht)tps?:\/\//i.test(path);	
		}
	}
	bg.base.imageTools.isAbsolutePath = isAbsolutePath;

	function mergePaths(path,component) {
		return path.slice(-1)!='/' ? path + '/' + component :  path + component;
	}
	bg.base.imageTools.mergePath = mergePaths;

	function getTexture(context,texturePath,resourcePath) {
		let texture = null;
		if (texturePath) {
			if (!isAbsolutePath(texturePath)) {
				if (resourcePath.slice(-1)!='/') {
					resourcePath += '/';
				}
				texturePath = `${resourcePath}${texturePath}`;
			}

			texture = bg.base.TextureCache.Get(context).find(texturePath);
			if (!texture) {
				texture = new bg.base.Texture(context);
				texture.create();
				texture.fileName = texturePath;
				bg.base.TextureCache.Get(context).register(texturePath,texture);

				(function(path,tex) {
					bg.utils.Resource.Load(path)
						.then(function(imgData) {
							tex.bind();
							texture.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
							texture.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
							tex.fileName = path;
							tex.setImage(imgData);
						});
				})(texturePath,texture);
			}
		}
		return texture;
	}
	bg.base.imageTools.getTexture = getTexture;
	
	function getPath(texture) {
		return texture ? texture.fileName:"";
	}
	bg.base.imageTools.getPath = getPath;

	function channelVector(channel) {
		return new bg.Vector4(
			channel==0 ? 1:0,
			channel==1 ? 1:0,
			channel==2 ? 1:0,
			channel==3 ? 1:0
		);
	}
	
	function readVector(data) {
		if (!data) return null;
		switch (data.length) {
		case 2:
			return new bg.Vector2(data[0],data[1]);
		case 3:
			return new bg.Vector3(data[0],data[1],data[2]);
		case 4:
			return new bg.Vector4(data[0],data[1],data[2],data[3]);
		}
		return null;
	}

	let g_base64Images = {};

	function readTexture(context,basePath,texData,mat,property) {
		return new Promise((resolve) => {
			if (!texData) {
				resolve();
			}
			else if (/data\:image\/[a-z]+\;base64\,/.test(texData)) {
				let hash = bg.utils.md5(texData);
				if (g_base64Images[hash]) {
					mat[property] = g_base64Images[hash];
				}
				else {
					mat[property] = bg.base.Texture.FromBase64Image(context,texData);
					g_base64Images[hash] = mat[property];
				}
				resolve(mat[property]);
			}
//			else if (/data\:md5/.test(texData)) {

//			}
			else {
				let fullPath = basePath + texData;	// TODO: add full path
				bg.base.Loader.Load(context,fullPath)
					.then(function(tex) {
						mat[property] = tex;
						resolve(tex);
					});
			}
		});
	}
	bg.base.imageTools.readTexture = readTexture;

	class Material {
		// Create and initialize a material from the json material definition
		static FromMaterialDefinition(context,def,basePath="") {
			return new Promise((resolve,reject) => {
				let mat = new Material();

				mat.diffuse = readVector(def.diffuse) || bg.Color.White();
				mat.specular = readVector(def.specular) || bg.Color.White();
				mat.shininess = def.shininess || 0;
				mat.shininessMaskChannel = def.shininessMaskChannel || 0;
				mat.shininessMaskInvert = def.shininessMaskInvert || false;
				mat.lightEmission = def.lightEmission || 0;
				mat.lightEmissionMaskChannel = def.lightEmissionMaskChannel || 0;
				mat.lightEmissionMaskInvert = def.lightEmissionMaskInvert || false;
				mat.refractionAmount = def.refractionAmount || 0;
				mat.reflectionAmount = def.reflectionAmount || 0;
				mat.reflectionMaskChannel = def.reflectionMaskChannel || 0;
				mat.reflectionMaskInvert = def.reflectionMaskInvert || false;
				mat.textureOffset = readVector(def.textureOffset) || new bg.Vector2(0,0);
				mat.textureScale = readVector(def.textureScale) || new bg.Vector2(1,1);
				mat.normalMapOffset = readVector(def.normalMapOffset) || new bg.Vector2(0,0);
				mat.normalMapScale = readVector(def.normalMapScale) || new bg.Vector2(1,1);
				mat.cullFace = def.cullFace===undefined ? true : def.cullFace;
				mat.castShadows = def.castShadows===undefined ? true : def.castShadows;
				mat.receiveShadows = def.receiveShadows===undefined ? true : def.receiveShadows;
				mat.alphaCutoff = def.alphaCutoff===undefined ? 0.5 : def.alphaCutoff;
				mat.name = def.name;
				mat.description = def.description;
				mat.roughness = def.roughness || 0;
				mat.roughnessMaskChannel = def.roughnessMaskChannel || 0;
				mat.roughnessMaskInvert = def.roughnessMaskInvert || false;
				mat.unlit = def.unlit || false;

				let texPromises = [];
				texPromises.push(readTexture(context,basePath,def.shininessMask,mat,"shininessMask"));
				texPromises.push(readTexture(context,basePath,def.lightEmissionMask,mat,"lightEmissionMask"));
				texPromises.push(readTexture(context,basePath,def.reflectionMask,mat,"reflectionMask"));
				texPromises.push(readTexture(context,basePath,def.texture,mat,"texture"));
				texPromises.push(readTexture(context,basePath,def.normalMap,mat,"normalMap"));
				texPromises.push(readTexture(context,basePath,def.roughnessMask,mat,"roughnessMask"));

				Promise.all(texPromises)
					.then(() => {
						resolve(mat);
					});
			});
		}

		constructor() {
			this._diffuse = bg.Color.White();
			this._specular = bg.Color.White();
			this._shininess = 0;
			this._lightEmission = 0;
			this._refractionAmount = 0;
			this._reflectionAmount = 0;
			this._texture = null;
			this._lightmap = null;
			this._normalMap = null;
			this._textureOffset = new bg.Vector2();
			this._textureScale = new bg.Vector2(1);
			this._lightmapOffset = new bg.Vector2();
			this._lightmapScale = new bg.Vector2(1);
			this._normalMapOffset = new bg.Vector2();
			this._normalMapScale = new bg.Vector2(1);
			this._castShadows = true;
			this._receiveShadows = true;
			this._alphaCutoff = 0.5;
			this._shininessMask = null;
			this._shininessMaskChannel = 0;
			this._shininessMaskInvert = false;
			this._lightEmissionMask = null;
			this._lightEmissionMaskChannel = 0;
			this._lightEmissionMaskInvert = false;
			this._reflectionMask = null;
			this._reflectionMaskChannel = 0;
			this._reflectionMaskInvert = false;
			this._cullFace = true;
			this._roughness = 0;
			this._roughnessMask = null;
			this._roughnessMaskChannel = 0;
			this._roughnessMaskInvert = false;
			this._unlit = false;
			
			this._selectMode = false;
		}
		
		clone() {
			let copy = new Material();
			copy.assign(this);
			return copy;
		}
		
		assign(other) {
			this._diffuse = new bg.Color(other.diffuse);
			this._specular = new bg.Color(other.specular);
			this._shininess = other.shininess;
			this._lightEmission = other.lightEmission;
			this._refractionAmount = other.refractionAmount;
			this._reflectionAmount = other.reflectionAmount;
			this._texture = other.texture;
			this._lightmap = other.lightmap;
			this._normalMap = other.normalMap;
			this._textureOffset = new bg.Vector2(other.textureOffset);
			this._textureScale = new bg.Vector2(other.textureScale);
			this._lightmapOffset = new bg.Vector2(other.ligthmapOffset);
			this._lightmapScale = new bg.Vector2(other.lightmapScale);
			this._normalMapOffset = new bg.Vector2(other.normalMapOffset);
			this._normalMapScale = new bg.Vector2(other.normalMapScale);
			this._castShadows = other.castShadows;
			this._receiveShadows = other.receiveShadows;
			this._alphaCutoff = other.alphaCutoff;
			this._shininessMask = other.shininessMask;
			this._shininessMaskChannel = other.shininessMaskChannel;
			this._shininessMaskInvert = other.shininessMaskInvert;
			this._lightEmissionMask = other.lightEmissionMask;
			this._lightEmissionMaskChannel = other.lightEmissionMaskChannel;
			this._lightEmissionMaskInvert = other.lightEmissionMaskInvert;
			this._reflectionMask = other.reflectionMask;
			this._reflectionMaskChannel = other.reflectionMaskChannel;
			this._reflectionMaskInvert = other.reflectionMaskInvert;
			this._cullFace = other.cullFace;
			this._roughness = other.roughness;
			this._roughnessMask = other.roughnessMask;
			this._roughnessMaskChannel = other.roughnessMaskChannel;
			this._roughnessMaskInvert = other.roughnessMaskInvert;
			this._unlit = other.unlit;
		}
		
		get isTransparent() {
			return this._diffuse.a<1;
		}
		
		get diffuse() { return this._diffuse; }
		get specular() { return this._specular; }
		get shininess() { return this._shininess; }
		get lightEmission() { return this._lightEmission; }
		get refractionAmount() { return this._refractionAmount; }
		get reflectionAmount() { return this._reflectionAmount; }
		get texture() { return this._texture; }
		get lightmap() { return this._lightmap; }
		get normalMap() { return this._normalMap; }
		get textureOffset() { return this._textureOffset; }
		get textureScale() { return this._textureScale; }
		get lightmapOffset() { return this._lightmapOffset; }
		get lightmapScale() { return this._lightmapScale; }
		get normalMapOffset() { return this._normalMapOffset; }
		get normalMapScale() { return this._normalMapScale; }
		get castShadows() { return this._castShadows; }
		get receiveShadows() { return this._receiveShadows; }
		get alphaCutoff() { return this._alphaCutoff; }
		get shininessMask() { return this._shininessMask; }
		get shininessMaskChannel() { return this._shininessMaskChannel; }
		get shininessMaskInvert() { return this._shininessMaskInvert; }
		get lightEmissionMask() { return this._lightEmissionMask; }
		get lightEmissionMaskChannel() { return this._lightEmissionMaskChannel; }
		get lightEmissionMaskInvert() { return this._lightEmissionMaskInvert; }
		get reflectionMask() { return this._reflectionMask; }
		get reflectionMaskChannel() { return this._reflectionMaskChannel; }
		get reflectionMaskInvert() { return this._reflectionMaskInvert; }
		get cullFace() { return this._cullFace; }
		get roughness() { return this._roughness; }
		get roughnessMask() { return this._roughnessMask; }
		get roughnessMaskChannel() { return this._roughnessMaskChannel; }
		get roughnessMaskInvert() { return this._roughnessMaskInvert; }
		get unlit() { return this._unlit; }

		
		set diffuse(newVal) { this._diffuse = newVal; }
		set specular(newVal) { this._specular = newVal; }
		set shininess(newVal) { if (!isNaN(newVal)) this._shininess = newVal; }
		set lightEmission(newVal) { if (!isNaN(newVal)) this._lightEmission = newVal; }
		set refractionAmount(newVal) { this._refractionAmount = newVal; }
		set reflectionAmount(newVal) { this._reflectionAmount = newVal; }
		set texture(newVal) { this._texture = newVal; }
		set lightmap(newVal) { this._lightmap = newVal; }
		set normalMap(newVal) { this._normalMap = newVal; }
		set textureOffset(newVal) { this._textureOffset = newVal; }
		set textureScale(newVal) { this._textureScale = newVal; }
		set lightmapOffset(newVal) { this._lightmapOffset = newVal; }
		set lightmapScale(newVal) { this._lightmapScale = newVal; }
		set normalMapOffset(newVal) { this._normalMapOffset = newVal; }
		set normalMapScale(newVal) { this._normalMapScale = newVal; }
		set castShadows(newVal) { this._castShadows = newVal; }
		set receiveShadows(newVal) { this._receiveShadows = newVal; }
		set alphaCutoff(newVal) { if (!isNaN(newVal)) this._alphaCutoff = newVal; }
		set shininessMask(newVal) { this._shininessMask = newVal; }
		set shininessMaskChannel(newVal) { this._shininessMaskChannel = newVal; }
		set shininessMaskInvert(newVal) { this._shininessMaskInvert = newVal; }
		set lightEmissionMask(newVal) { this._lightEmissionMask = newVal; }
		set lightEmissionMaskChannel(newVal) { this._lightEmissionMaskChannel = newVal; }
		set lightEmissionMaskInvert(newVal) { this._lightEmissionMaskInvert = newVal; }
		set reflectionMask(newVal) { this._reflectionMask = newVal; }
		set reflectionMaskChannel(newVal) { this._reflectionMaskChannel = newVal; }
		set reflectionMaskInvert(newVal) { this._reflectionMaskInvert = newVal; }
		set cullFace(newVal) { this._cullFace = newVal; }
		set roughness(newVal) { this._roughness = newVal; }
		set roughnessMask(newVal) { this._roughnessMask = newVal; }
		set roughnessMaskChannel(newVal) { this._roughnessMaskChannel = newVal; }
		set roughnessMaskInvert(newVal) { this._roughnessMaskInvert = newVal; }
		
		get unlit() { return this._unlit; }
		set unlit(u) { this._unlit = u; }

		get selectMode() { return this._selectMode; }
		set selectMode(s) { this._selectMode = s; }

		// Mask channel vectors: used to pass the mask channel to a shader
		get lightEmissionMaskChannelVector() {
			return channelVector(this.lightEmissionMaskChannel)
		}
		
		get shininessMaskChannelVector() {
			return channelVector(this.shininessMaskChannel);
		}
		
		get reflectionMaskChannelVector() {
			return channelVector(this.reflectionMaskChannel);
		}

		get roughnessMaskChannelVector() {
			return channelVector(this.roughnessMaskChannel);
		}
		
		// Returns an array of the external resources used by this material, for example,
		// the paths to the textures. If the "resources" parameter (array) is passed, the resources
		// will be added to this array, and the parameter will be modified to include the new
		// resources. If a resource exists in the "resources" parameter, it will not be added
		getExternalResources(resources=[]) {
			function tryadd(texture) {
				if (texture && texture.fileName && texture.fileName!="" && resources.indexOf(texture.fileName)==-1) {
					resources.push(texture.fileName);
				}
			}
			tryadd(this.texture);
			tryadd(this.lightmap);
			tryadd(this.normalMap);
			tryadd(this.shininessMask);
			tryadd(this.lightEmissionMask);
			tryadd(this.reflectionMask);
			tryadd(this.roughnessMask);
			return resources;
		}
		
		copyMaterialSettings(mat,mask) {
			if ( mask & bg.base.MaterialFlag.DIFFUSE) {
				mat.diffuse = this.diffuse;
			}
			if ( mask & bg.base.MaterialFlag.SPECULAR) {
				mat.specular = this.specular;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS) {
				mat.shininess = this.shininess;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION) {
				mat.lightEmission = this.lightEmission;
			}
			if ( mask & bg.base.MaterialFlag.REFRACTION_AMOUNT) {
				mat.refractionAmount = this.refractionAmount;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_AMOUNT) {
				mat.reflectionAmount = this.reflectionAmount;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE) {
				mat.texture = this.texture;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP) {
				mat.lightmap = this.lightmap;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP) {
				mat.normalMap = this.normalMap;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE_OFFSET) {
				mat.textureOffset = this.textureOffset;
			}
			if ( mask & bg.base.MaterialFlag.TEXTURE_SCALE) {
				mat.textureScale = this.textureScale;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP_OFFSET) {
				mat.lightmapOffset = this.lightmapOffset;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_MAP_SCALE) {
				mat.lightmapScale = this.lightmapScale;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP_OFFSET) {
				mat.normalMapOffset = this.normalMapOffset;
			}
			if ( mask & bg.base.MaterialFlag.NORMAL_MAP_SCALE) {
				mat.normalMapScale = this.normalMapScale;
			}
			if ( mask & bg.base.MaterialFlag.CAST_SHADOWS) {
				mat.castShadows = this.castShadows;
			}
			if ( mask & bg.base.MaterialFlag.RECEIVE_SHADOWS) {
				mat.receiveShadows = this.receiveShadows;
			}
			if ( mask & bg.base.MaterialFlag.ALPHA_CUTOFF) {
				mat.alphaCutoff = this.alphaCutoff;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK) {
				mat.shininessMask = this.shininessMask;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK_CHANNEL) {
				mat.shininessMaskChannel = this.shininessMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.SHININESS_MASK_INVERT) {
				mat.shininessMaskInvert = this.shininessMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK) {
				mat.lightEmissionMask = this.lightEmissionMask;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL) {
				mat.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT) {
				mat.lightEmissionMaskInvert = this.lightEmissionMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK) {
				mat.reflectionMask = this.reflectionMask;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL) {
				mat.reflectionMaskChannel = this.reflectionMaskChannel;
			}
			if ( mask & bg.base.MaterialFlag.REFLECTION_MASK_INVERT) {
				mat.reflectionMaskInvert = this.reflectionMaskInvert;
			}
			if ( mask & bg.base.MaterialFlag.CULL_FACE) {
				mat.cullFace = this.cullFace;
			}

			// All the roughness attributes are copied together using this flag. In
			// the future, the *_MASK, *_MASK_CHANNEL and *_MASK_INVERT for shininess,
			// light emission and reflection, will be deprecated and will work in the
			// same way as ROUGHNESS here
			if ( mask & bg.base.MaterialFlag.ROUGHNESS) {
				mat.reflectionAmount = this.reflectionAmount;
				mat.reflectionMask = this.reflectionMask;
				mat.reflectionMaskChannel = this.reflectionMaskChannel;
				mat.reflectionMaskInvert = this.reflectionMaskInvert;
			}

			if (mask & bg.base.MaterialFlag.UNLIT) {
				mat.unlit = this.unlit;
			}
		}

		applyModifier(context, mod, resourcePath) {
			if (mod.isEnabled(bg.base.MaterialFlag.DIFFUSE)) {
				this.diffuse = mod.diffuse;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SPECULAR)) {
				this.specular = mod.specular;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS)) {
				this.shininess = mod.shininess;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION)) {
				this.lightEmission = mod.lightEmission;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT)) {
				this.refractionAmount = mod.refractionAmount;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT)) {
				this.reflectionAmount = mod.reflectionAmount;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE)) {
				this.texture = getTexture(context,mod.texture,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP)) {
				this.lightmap = getTexture(context,mod.lightmap,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP)) {
				this.normalMap = getTexture(context,mod.normalMap,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET)) {
				this.textureOffset = mod.textureOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_SCALE)) {
				this.textureScale = mod.textureScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET)) {
				this.lightmapOffset = mod.lightmapOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE)) {
				this.lightmapScale = mod.lightmapScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET)) {
				this.normalMapOffset = mod.normalMapOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE)) {
				this.normalMapScale = mod.normalMapScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.CAST_SHADOWS)) {
				this.castShadows = mod.castShadows;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS)) {
				this.receiveShadows = mod.receiveShadows;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF)) {
				this.alphaCutoff = mod.alphaCutoff;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK)) {
				this.shininessMask = getTexture(context,mod.shininessMask,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL)) {
				this.shininessMaskChannel = mod.shininessMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT)) {
				this.shininessMaskInvert = mod.shininessMaskInvert;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK)) {
				this.lightEmissionMask = getTexture(context,mod.lightEmissionMask,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
				this.lightEmissionMaskChannel = mod.lightEmissionMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
				this.lightEmissionMaskInvert = mod.lightEmissionMaskInvert;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK)) {
				this.reflectionMask = getTexture(context,mod.reflectionMask,resourcePath);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL)) {
				this.reflectionMaskChannel = mod.reflectionMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT)) {
				this.reflectionMaskInvert = mod.reflectionMaskInvert;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.CULL_FACE)) {
				this.cullFace = mod.cullFace;
			}

			// See above note for ROUGHNESS flags
			if (mod.isEnabled(bg.base.MaterialFlag.ROUGHNESS)) {
				this.roughness = mod.roughness;
				this.roughnessMask = getTexture(context,mod.roughnessMask,resourcePath);
				this.roughnessMaskChannel = mod.roughnessMaskChannel;
				this.roughnessMaskInvert = mod.roughnessMaskInvert;
			}

			if (mod.isEnabled(bg.base.MaterialFlag.UNLIT)) {
				this.unlit = mod.unlit;
			}
		}
		
		getModifierWithMask(modifierMask) {
			var mod = new MaterialModifier();

			mod.modifierFlags = modifierMask;
			
			if (mod.isEnabled(bg.base.MaterialFlag.DIFFUSE)) {
				mod.diffuse = this.diffuse;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SPECULAR)) {
				mod.specular = this.specular;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS)) {
				mod.shininess = this.shininess;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION)) {
				mod.lightEmission = this.lightEmission;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT)) {
				mod.refractionAmount = this.refractionAmount;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT)) {
				mod.reflectionAmount = this.reflectionAmount;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE)) {
				mod.texture = getPath(this.texture);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP)) {
				mod.lightmap = getPath(this.lightmap);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP)) {
				mod.normalMap = getPath(this.normalMap);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET)) {
				mod.textureOffset = this.textureOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_SCALE)) {
				mod.textureScale = this.textureScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET)) {
				mod.lightmapOffset = this.lightmapOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE)) {
				mod.lightmapScale = this.lightmapScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET)) {
				mod.normalMapOffset = this.normalMapOffset;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE)) {
				mod.normalMapScale = this.normalMapScale;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.CAST_SHADOWS)) {
				mod.castShadows = this.castShadows;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS)) {
				mod.receiveShadows = this.receiveShadows;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF)) {
				mod.alphaCutoff = this.alphaCutoff;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK)) {
				mod.shininessMask = getPath(this.shininessMask);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL)) {
				mod.shininessMaskChannel = this.shininessMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT)) {
				mod.shininessMaskInvert = this.shininessMaskInvert;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK)) {
				mod.lightEmissionMask = getPath(this.lightEmissionMask);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
				mod.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
				mod.lightEmissionMaskInver = this.lightEmissionMaskInver;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK)) {
				mod.reflectionMask = getPath(this.reflectionMask);
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL)) {
				mod.reflectionMaskChannel = this.reflectionMaskChannel;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT)) {
				mod.reflectionMaskInvert = this.reflectionMaskInvert;
			}
			if (mod.isEnabled(bg.base.MaterialFlag.CULL_FACE)) {
				mod.cullFace = this.cullFace;
			}

			// See above note about ROUGHNESS flag
			if (mod.isEnabled(bg.base.MaterialFlag.ROUGHNESS)) {
				mod.roughness = this.roughness;
				mod.roughnessMask = getPath(this.roughnessMask);
				mod.roughnessMaskChannel = this.roughnessMaskChannel;
				mod.roughnessMaskInvert = this.roughnessMaskInvert;
			}

			if (mod.isEnabled(bg.base.MaterialFlag.UNLIT)) {
				mod.unlit = this.unlit;
			}

			return mod;
		}
		
		static GetMaterialWithJson(context,data,path) {
			let material = new Material();
			if (data.cullFace===undefined) {
				data.cullFace = true;
			}
			
			material.diffuse.set(data.diffuseR,data.diffuseG,data.diffuseB,data.diffuseA);
			material.specular.set(data.specularR,data.specularG,data.specularB,data.specularA);
			material.shininess = data.shininess;
			material.lightEmission = data.lightEmission;
			
			material.refractionAmount = data.refractionAmount;
			material.reflectionAmount = data.reflectionAmount;
			
			material.textureOffset.set(data.textureOffsetX,data.textureOffsetY);
			material.textureScale.set(data.textureScaleX,data.textureScaleY);
			
			material.lightmapOffset.set(data.lightmapOffsetX,data.lightmapOffsetY);
			material.lightmapScale.set(data.lightmapScaleX,data.lightmapScaleY);
			
			material.normalMapOffset.set(data.normalMapOffsetX,data.normalMapOffsetY);
			material.normalMapScale.set(data.normalMapScaleX,data.normalMapScaleY);
			
			material.alphaCutoff = data.alphaCutoff;
			material.castShadows = data.castShadows;
			material.receiveShadows = data.receiveShadows;
			
			material.shininessMaskChannel = data.shininessMaskChannel;
			material.shininessMaskInvert = data.invertShininessMask;
			
			material.lightEmissionMaskChannel = data.lightEmissionMaskChannel;
			material.lightEmissionMaskInvert = data.invertLightEmissionMask;
			
			material.reflectionMaskChannel = data.reflectionMaskChannel;
			material.reflectionMaskInvert = data.invertReflectionMask;

			material.roughness = data.roughness;
			material.roughnessMaskChannel = data.roughnessMaskChannel;
			material.roughnessMaskInvert = data.invertRoughnessMask;
			
			material.cullFace = data.cullFace;
			
			material.unlit = data.unlit;
			
			if (path && path[path.length-1]!='/') {
				path += '/';
			}
			
			function mergePath(path,file) {
				if (!file) return null;
				return path ? path + file:file;
			}

			data.texture = mergePath(path,data.texture);
			data.lightmap = mergePath(path,data.lightmap);
			data.normalMap = mergePath(path,data.normalMap);
			data.shininessMask = mergePath(path,data.shininessMask);
			data.lightEmissionMask = mergePath(path,data.lightEmissionMask);
			data.reflectionMask = mergePath(path,data.reflectionMask);
			data.roughnessMask = mergePath(path,data.roughnessMask);
			
			return new Promise((accept,reject) => {
				let textures = [];
				
				if (data.texture) {
					textures.push(data.texture);
				}
				if (data.lightmap && textures.indexOf(data.lightmap)==-1) {
					textures.push(data.lightmap);
				}
				if (data.normalMap && textures.indexOf(data.normalMap)==-1) {
					textures.push(data.normalMap);
				}
				if (data.shininessMask && textures.indexOf(data.shininessMask)==-1) {
					textures.push(data.shininessMask);
				}
				if (data.lightEmissionMask && textures.indexOf(data.lightEmissionMask)==-1) {
					textures.push(data.lightEmissionMask);
				}
				if (data.reflectionMask && textures.indexOf(data.reflectionMask)==-1) {
					textures.push(data.reflectionMask);
				}
				if (data.roughnessMask && textures.indexOf(data.roughnessMask)==-1) {
					textures.push(data.roughnessMask);
				}
				
				bg.utils.Resource.Load(textures)
					.then(function(images) {
						material.texture = loadTexture(context,images[data.texture],data.texture);
						material.lightmap = loadTexture(context,images[data.lightmap],data.lightmap);
						material.normalMap = loadTexture(context,images[data.normalMap],data.normalMap);
						material.shininessMask = loadTexture(context,images[data.shininessMask],data.shininessMask);
						material.lightEmissionMask = loadTexture(context,images[data.lightEmissionMask],data.lightEmissionMask);
						material.reflectionMask = loadTexture(context,images[data.reflectionMask],data.reflectionMask);
						material.roughnessMask = loadTexture(context,images[data.roughnessMask],data.roughnessMask);
						accept(material);
					});
			});
		}
	}
	
	bg.base.Material = Material;
})();