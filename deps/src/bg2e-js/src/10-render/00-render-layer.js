(function() {
	
	class RenderLayer extends bg.app.ContextObject {
		constructor(context,opacityLayer = bg.base.OpacityLayer.ALL) {
			super(context);
			
			this._pipeline = new bg.base.Pipeline(context);
			this._pipeline.opacityLayer = opacityLayer;
			this._matrixState = bg.base.MatrixState.Current();
			this._drawVisitor = new bg.scene.DrawVisitor(this._pipeline,this._matrixState);
			this._settings = {};
		}

		get pipeline() { return this._pipeline; }

		get opacityLayer() { return this._pipeline.opacityLayer; }

		get drawVisitor() { return this._drawVisitor; }
		
		get matrixState() { return this._matrixState; }
		
		set settings(s) { this._settings = s; }
		get settings() { return this._settings; }

		draw(scene,camera) {}
	}
	
	bg.render.RenderLayer = RenderLayer;
	
})();