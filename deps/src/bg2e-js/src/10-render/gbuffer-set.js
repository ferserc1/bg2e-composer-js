(function() {

	function updatePipeline(pipeline,drawVisitor,scene,camera) {
		bg.base.Pipeline.SetCurrent(pipeline);
		pipeline.viewport = camera.viewport;
		pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
		scene.accept(drawVisitor);
	}
	
	class GBufferSet extends bg.app.ContextObject {
		constructor(context) {
			super(context);
			
			this._pipelines = {
				ubyte: new bg.base.Pipeline(context),
				float: new bg.base.Pipeline(context)
			};
			
			// Create two g-buffer render pipelines:
			//	- ubyte pipeline: to generate unsigned byte g-buffers (diffuse, material properties, etc)
			//	- float pipeline: to generate float g-buffers (currently, only needed to generate the position g-buffer)
 			let ubyteRS = new bg.base.TextureSurface(context);
			ubyteRS.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._pipelines.ubyte.effect = new bg.render.GBufferEffect(context);
			this._pipelines.ubyte.renderSurface = ubyteRS;

			let floatRS = new bg.base.TextureSurface(context);
			floatRS.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.FLOAT },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._pipelines.float.effect = new bg.render.PositionGBufferEffect(context);
			this._pipelines.float.renderSurface = floatRS;
					
			this._ubyteDrawVisitor = new bg.scene.DrawVisitor(this._pipelines.ubyte,this._matrixState);
			this._floatDrawVisitor = new bg.scene.DrawVisitor(this._pipelines.float,this._matrixState);
		}
		
		get diffuse() { return this._pipelines.ubyte.renderSurface.getTexture(0); }
		get specular() { return this._pipelines.ubyte.renderSurface.getTexture(1); }
		get normal() { return this._pipelines.ubyte.renderSurface.getTexture(2); }
		get material() { return this._pipelines.ubyte.renderSurface.getTexture(3); }
		get position() { return this._pipelines.float.renderSurface.getTexture(0); }
		get shadow() { return this._pipelines.ubyte.renderSurface.getTexture(4); }
		
		update(sceneRoot,camera) {
			updatePipeline(this._pipelines.ubyte,this._ubyteDrawVisitor,sceneRoot,camera);
			updatePipeline(this._pipelines.float,this._floatDrawVisitor,sceneRoot,camera);
		}
	}
	
	bg.render.GBufferSet = GBufferSet;
	
})();