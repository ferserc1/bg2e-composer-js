bg.webgl1 = {};

(function() {
	let WEBGL_1_STRING = "webgl1";
	
	bg.webgl1.EngineId = WEBGL_1_STRING;
	
	class WebGL1Engine extends bg.Engine {
		constructor(context) {
			super(context);
			
			// Initialize webgl extensions
			bg.webgl1.Extensions.Get(context);
			
			this._engineId = WEBGL_1_STRING;
			this._texture = new bg.webgl1.TextureImpl(context);
			this._pipeline = new bg.webgl1.PipelineImpl(context);
			this._polyList = new bg.webgl1.PolyListImpl(context);
			this._shader = new bg.webgl1.ShaderImpl(context);
			this._colorBuffer = new bg.webgl1.ColorRenderSurfaceImpl(context);
			this._textureBuffer = new bg.webgl1.TextureRenderSurfaceImpl(context);
			this._shaderSource = new bg.webgl1.ShaderSourceImpl();
			this._cubemapCapture = new bg.webgl1.CubemapCaptureImpl();
		}

		createTextureMergerInstance() {
			return new bg.webgl1.TextureMergerImpl();
		}
	}
	
	bg.webgl1.Engine = WebGL1Engine;
	
})();
