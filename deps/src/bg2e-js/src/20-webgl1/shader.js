(function() {
	
	class ShaderImpl extends bg.base.ShaderImpl {
		initFlags(context) {
			bg.base.ShaderType.VERTEX = context.VERTEX_SHADER;
			bg.base.ShaderType.FRAGMENT = context.FRAGMENT_SHADER;
		}
		
		setActive(context,shaderProgram) {
			context.useProgram(shaderProgram && shaderProgram.program);
		}
		
		create(context) {
			return {
				program:context.createProgram(),
				attribLocations:{},
				uniformLocations:{}
			};
		}
		
		addShaderSource(context,shaderProgram,shaderType,source) {
			let error = null;
			
			if (!shaderProgram || !shaderProgram.program ) {
				error = "Could not attach shader. Invalid shader program";
			}
			else {
				let shader = context.createShader(shaderType);
				context.shaderSource(shader,source);
				context.compileShader(shader);
				
				if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
					error = context.getShaderInfoLog(shader);
				}
				else {
					context.attachShader(shaderProgram.program,shader);
				}
				
				context.deleteShader(shader);
			}
			
			return error;
		}
		
		link(context,shaderProgram) {
			let error = null;
			if (!shaderProgram || !shaderProgram.program ) {
				error = "Could not link shader. Invalid shader program";
			}
			else {
				context.linkProgram(shaderProgram.program);
				if (!context.getProgramParameter(shaderProgram.program,context.LINK_STATUS)) {
					error = context.getProgramInfoLog(shaderProgram.program);
				}
			}
			return error;
		}
		
		initVars(context,shader,inputBufferVars,valueVars) {
			inputBufferVars.forEach(function(name) {
				shader.attribLocations[name] = context.getAttribLocation(shader.program,name);
			});
			
			valueVars.forEach(function(name) {
				shader.uniformLocations[name] = context.getUniformLocation(shader.program,name);
			});
		}

		setInputBuffer(context,shader,varName,vertexBuffer,itemSize) {
			if (vertexBuffer && shader && shader.program) {
				let loc = shader.attribLocations[varName];
				if (loc!=-1) {
					context.bindBuffer(context.ARRAY_BUFFER,vertexBuffer);
					context.enableVertexAttribArray(loc);
					context.vertexAttribPointer(loc,itemSize,context.FLOAT,false,0,0);
				}
			}
		}
		
		disableInputBuffer(context,shader,name) {
			context.disableVertexAttribArray(shader.attribLocations[name]);
		}
		
		setValueInt(context,shader,name,v) {
			context.uniform1i(shader.uniformLocations[name],v);
		}

		setValueIntPtr(context,shader,name,v) {
			context.uniform1iv(shader.uniformLocations[name],v);
		}
		
		setValueFloat(context,shader,name,v) {
			context.uniform1f(shader.uniformLocations[name],v);
		}

		setValueFloatPtr(context,shader,name,v) {
			context.uniform1fv(shader.uniformLocations[name],v);
		}
		
		setValueVector2(context,shader,name,v) {
			context.uniform2fv(shader.uniformLocations[name],v.v);
		}
		
		setValueVector3(context,shader,name,v) {
			context.uniform3fv(shader.uniformLocations[name],v.v);
		}
		
		setValueVector4(context,shader,name,v) {
			context.uniform4fv(shader.uniformLocations[name],v.v);
		}

		setValueVector2v(context,shader,name,v) {
			context.uniform2fv(shader.uniformLocations[name],v);
		}

		setValueVector3v(context,shader,name,v) {
			context.uniform3fv(shader.uniformLocations[name],v);
		}

		setValueVector4v(context,shader,name,v) {
			context.uniform4fv(shader.uniformLocations[name],v);
		}
		
		setValueMatrix3(context,shader,name,traspose,v) {
			context.uniformMatrix3fv(shader.uniformLocations[name],traspose,v.m);
		}
		
		setValueMatrix4(context,shader,name,traspose,v) {
			context.uniformMatrix4fv(shader.uniformLocations[name],traspose,v.m);
		}
		
		setTexture(context,shader,name,texture,textureUnit) {
			texture.setActive(textureUnit);
			texture.bind();
			context.uniform1i(shader.uniformLocations[name],textureUnit);
		}
	}
	
	bg.webgl1.ShaderImpl = ShaderImpl;
	
})();
