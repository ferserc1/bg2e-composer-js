(function() {
	
	class Canvas {
		constructor(domElem) {		
			let initContext = () => {
				this._context = bg.utils.initWebGLContext(domElem);
				return this._context.supported;
			}
			
						
			// Attributes
			this._domElem = domElem;
			this._domElem.style.MozUserSelect = 'none';
			this._domElem.style.WebkitUserSelect = 'none';
			this._domElem.setAttribute("onselectstart","return false");

			this._multisample = 1.0;
			
			// Initialization
			if (!initContext()) {
				throw new Error("Sorry, your browser does not support WebGL.");
			}
		}

		get multisample() {
			return this._multisample;
		}

		set multisample(ms) {
			this._multisample = ms;
		}
		
		get context() {
			return this._context;
		}
		
		get domElement() {
			return this._domElem;
		}
		
		get width() {
			return this._domElem.clientWidth;
		}
		
		get height() {
			return this._domElem.clientHeight;
		}

		screenshot(format, width, height) {
			let canvasStyle = "";
			let prevSize = {}
			if (width) {
				height = height ? height:width;
				canvasStyle = this.domElement.style.cssText;
				prevSize.width = this.domElement.width;
				prevSize.height = this.domElement.height;

				this.domElement.style.cssText = "top:auto;left:auto;bottom:auto;right:auto;width:" + width + "px;height:" + height + "px;";
				this.domElement.width = width;
				this.domElement.height = height;
				bg.app.MainLoop.singleton.windowController.reshape(width,height);
				bg.app.MainLoop.singleton.windowController.postRedisplay();
				bg.app.MainLoop.singleton.windowController.display();
			}
			var data = this.domElement.toDataURL(format);
			if (width) {
				this.domElement.style.cssText = canvasStyle;
				this.domElement.width = prevSize.width;
				this.domElement.height = prevSize.height;
				bg.app.MainLoop.singleton.windowController.reshape(prevSize.width,prevSize.height);
				bg.app.MainLoop.singleton.windowController.postRedisplay();
				bg.app.MainLoop.singleton.windowController.display();
			}
			return data;
		}

	}
	
	bg.app.Canvas = Canvas;
	
	class ContextObject {
		constructor(context) {
			this._context = context;
		}
		
		get context() { return this._context; }
		set context(c) { this._context = c; }
	}
	
	bg.app.ContextObject = ContextObject;
})();