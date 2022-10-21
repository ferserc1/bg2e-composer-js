(function() {
	
	class PipelineImpl extends bg.base.PipelineImpl {
		initFlags(context) {
			bg.base.ClearBuffers.COLOR = context.COLOR_BUFFER_BIT;
			bg.base.ClearBuffers.DEPTH = context.DEPTH_BUFFER_BIT;
		}
		
		setViewport(context,vp) {
			context.viewport(vp.x,vp.y,vp.width,vp.height);
		}
		
		clearBuffers(context,color,buffers) {
			context.clearColor(color.r,color.g,color.b,color.a);
			if (buffers) context.clear(buffers);
		}
		
		setDepthTestEnabled(context,e) {
			e ? context.enable(context.DEPTH_TEST):context.disable(context.DEPTH_TEST);
		}
		
		setCullFace(context,e) {
			e ? context.enable(context.CULL_FACE):context.disable(context.CULL_FACE);
		}
		
		setBlendEnabled(context,e) {
			e ? context.enable(context.BLEND):context.disable(context.BLEND);
		}
		
		setBlendMode(gl,m) {
			switch (m) {
				case bg.base.BlendMode.NORMAL:
					gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
					//gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
					gl.blendEquation(gl.FUNC_ADD);
					break;
				case bg.base.BlendMode.MULTIPLY:
					gl.blendFunc(gl.ZERO,gl.SRC_COLOR);
					gl.blendEquation(gl.FUNC_ADD);
					break;
				case bg.base.BlendMode.ADD:
					gl.blendFunc(gl.ONE,gl.ONE);
					gl.blendEquation(gl.FUNC_ADD);
					break;
				case bg.base.BlendMode.SUBTRACT:
					gl.blendFunc(gl.ONE,gl.ONE);
					gl.blendEquation(gl.FUNC_SUBTRACT);
					break;
				case bg.base.BlendMode.ALPHA_ADD:
					gl.blendFunc(gl.SRC_ALPHA,gl.SRC_ALPHA);
					gl.blendEquation(gl.FUNC_ADD);
					break;
				case bg.base.BlendMode.ALPHA_SUBTRACT:
					gl.blendFunc(gl.SRC_ALPHA,gl.SRC_ALPHA);
					gl.blendEquation(gl.FUNC_SUBTRACT);
					break;
			}
		}
	}
	
	bg.webgl1.PipelineImpl = PipelineImpl;
})();