(function() {
	
	let s_shaderLibrary = null;
	
	function defineAll(obj) {
		Reflect.defineProperty(obj,"all", {
			get() {
				if (!this._all) {
					this._all = [];
					for (let key in obj) {
						if (typeof(obj[key])=="object" && obj[key].name) {
							this._all.push(obj[key]);
						}
					}
				}
				return this._all;
			}
		});
	}
	
	class ShaderLibrary {
		static Get() {
			if (!s_shaderLibrary) {
				s_shaderLibrary = new ShaderLibrary();
			}
			return s_shaderLibrary;
		}
		
		constructor() {
			let library = bg[bg.Engine.Get().id].shaderLibrary;
			
			for (let key in library) {
				this[key] = library[key];
			}
			
			defineAll(this.inputs.matrix);
			Object.defineProperty(this.inputs.matrix,"modelViewProjection",{
				get() {
					return [
						this.model,
						this.view,
						this.projection
					]
				}
			});
			defineAll(this.inputs.material);
            defineAll(this.inputs.lighting);
			defineAll(this.inputs.lightingForward);
			defineAll(this.inputs.shadows);
			defineAll(this.inputs.colorCorrection);
			defineAll(this.functions.materials);
			defineAll(this.functions.colorCorrection);
			defineAll(this.functions.lighting);
			defineAll(this.functions.utils);

			// PBR materials
			for (let key in this.inputs.pbr) {
				defineAll(this.inputs.pbr[key]);
			}
			for (let key in this.functions.pbr) {
				defineAll(this.functions.pbr[key]);
			}
		}
	}
	
	bg.base.ShaderLibrary = ShaderLibrary;
	
	class ShaderSourceImpl {
		header(shaderType) { return ""; }
		parameter(shaderType,paramData) { return paramData.name; }
		func(shaderType,funcData) { return funcData.name; }
	}
	
	bg.base.ShaderSourceImpl = ShaderSourceImpl;
	
	class ShaderSource {
		static FormatSource(src) {
			let result = "";
			let lines = src.replace(/^\n*/,"").replace(/\n*$/,"").split("\n");
			let minTabs = 100;
			lines.forEach((line) => {
				let tabsInLine = /(\t*)/.exec(line)[0].length;
				if (minTabs>tabsInLine) {
					minTabs = tabsInLine;
				}
			});
			
			lines.forEach((line) => {
				let tabsInLine = /(\t*)/.exec(line)[0].length;
				let diff = tabsInLine - minTabs;
				result += line.slice(tabsInLine - diff,line.length) + "\n";
			});
			
			return result.replace(/^\n*/,"").replace(/\n*$/,"");
		}
		
		constructor(type) {
			this._type = type;
			this._params = [];
			this._functions = [];
			this._requiredExtensions = [];
			this._header = "";
			this._preprocessor = "";
		}
		
		get type() { return this._type; }
		get params() { return this._params; }
		get header() { return this._header; }
		get functions() { return this._functions; }
		
		addParameter(param) {
			if (param instanceof Array) {
				this._params = [...this._params, ...param];
			}
			else {
				this._params.push(param);
			}
			this._params.push(null);	// This will be translated into a new line character
		}
		
		addFunction(func) {
			if (func instanceof Array) {
				this._functions = [...this._functions, ...func];
			}
			else {
				this._functions.push(func);
			}
		}
		
		setMainBody(body) {
			this.addFunction({
				returnType:"void", name:"main", params:{}, body:body
			});
		}
				
		appendHeader(src) {
			this._header += src + "\n";
		}

		appendPreprocessor(src) {
			this._preprocessor += src + "\n";
		}
				
		toString() {
			let impl = bg.Engine.Get().shaderSource;
			// Build header
			let src = this._preprocessor;
			src += impl.header(this.type) + "\n" + this._header + "\n\n";
			
			this.params.forEach((p) => {
				src += impl.parameter(this.type,p) + "\n";
			});
			
			this.functions.forEach((f) => {
				src += "\n" + impl.func(this.type,f) + "\n";
			})
			return src;
		}
	}
	
	bg.base.ShaderSource = ShaderSource;
})();