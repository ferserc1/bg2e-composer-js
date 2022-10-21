(function() {
	let s_singleton = null;

	class Extensions extends bg.app.ContextObject {
		static Get(gl) {
			if (!s_singleton) {
				s_singleton = new Extensions(gl);
			}
			return s_singleton;
		}
		
		constructor(gl) {
			super(gl);
		}
		
		getExtension(ext) {
			return this.context.getExtension(ext);
		}
		
		get textureFloat() {
			if (this._textureFloat===undefined) {
				this._textureFloat = this.getExtension("OES_texture_float");
			}
			return this._textureFloat;
		}
		
		get depthTexture() {
			if (this._depthTexture===undefined) {
				this._depthTexture = this.getExtension("WEBGL_depth_texture");
			}
			return this._depthTexture;
		}
		
		get drawBuffers() {
			if (this._drawBuffers===undefined) {
				this._drawBuffers = this.getExtension("WEBGL_draw_buffers");
			}
			return this._drawBuffers;
		}
	}
	
	bg.webgl1.Extensions = Extensions;
})();