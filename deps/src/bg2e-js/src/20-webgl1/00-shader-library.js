(function() {
	
	bg.webgl1.shaderLibrary = {
		inputs:{},
		functions:{}
	}

	class ShaderSourceImpl extends bg.base.ShaderSourceImpl {
		header(shaderType) {
			return "precision highp float;\nprecision highp int;";
		}
		
		parameter(shaderType,paramData) {
			if (!paramData) return "\n";
			let role = "";
			switch (paramData.role) {
				case "buffer":
					role = "attribute";
					break;
				case "value":
					role = "uniform";
					break;
				case "in":
				case "out":
					role = "varying";
					break;
			}
			let vec = "";
			if (paramData.vec) {
				vec = `[${paramData.vec}]`;
			}
			return `${role} ${paramData.dataType} ${paramData.name}${vec};`;
		}
		
		func(shaderType,funcData) {
			if (!funcData) return "\n";
			let params = "";
			for (let name in funcData.params) {
				params += `${funcData.params[name]} ${name},`;
			}
			let src = `${funcData.returnType} ${funcData.name}(${params}) {`.replace(',)',')');
			let body = ("\n" + bg.base.ShaderSource.FormatSource(funcData.body)).replace(/\n/g,"\n\t");
			return src + body + "\n}";
		}
	}
	
	bg.webgl1.ShaderSourceImpl = ShaderSourceImpl;
	
	
})();