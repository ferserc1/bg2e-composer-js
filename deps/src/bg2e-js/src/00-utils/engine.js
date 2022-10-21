(function() {
	let s_Engine = null;
	
	class Engine {
		static Set(engine) {
			s_Engine = engine;
		}
		
		static Get() {
			return s_Engine;
		}
		
		get id() { return this._engineId; }
		
		get texture() { return this._texture; }
		get pipeline() { return this._pipeline; }
		get polyList() { return this._polyList; }
		get shader() { return this._shader; }
		get colorBuffer() { return this._colorBuffer; }
		get textureBuffer() { return this._textureBuffer; }
		get shaderSource() { return this._shaderSource; }
		get cubemapCapture() { return this._cubemapCapture; }
		get textureMerger() { return this._textureMerger; }
	}
	
	bg.Engine = Engine;
})();