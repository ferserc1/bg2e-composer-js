(function() {
	
	class RenderSurfaceBufferImpl {
		constructor(context) {
			this.initFlags(context);
		}
		
		initFlags(context) {}
		
		create(context,attachments) {}
		setActive(context,renderSurface) {}
		readBuffer(context,renderSurface,rectangle) {}
		resize(context,renderSurface,size) {}
		destroy(context,renderSurface) {}
		supportType(type) {}
		supportFormat(format) {}
		maxColorAttachments() {}
	}

	bg.base.RenderSurfaceBufferImpl = RenderSurfaceBufferImpl;
	
	class RenderSurface extends bg.app.ContextObject {
		static DefaultAttachments() {
			return [
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			];
		}
		static SupportFormat(format) {
			return bg.Engine.Get().colorBuffer.supportFormat(format);
		}
		
		static SupportType(type) {
			return bg.Engine.Get().colorBuffer.supportType(type);
		}
		
		static MaxColorAttachments() {
			return bg.Engine.Get().textureBuffer.maxColorAttachments;
		}
		
		constructor(context) {
			super(context);
			
			this._size = new bg.Vector2(256);
			this._renderSurface = null;
			this._resizeOnViewportChanged = true;
		}
		
		get size() { return this._size; }
		set size(s) {
			if (this._size.x!=s.x || this._size.y!=s.y) {
				this._size = s;
				this.surfaceImpl.resize(this.context,this._renderSurface,s);
			}
		}
		
		get surfaceImpl() { return null; }

		get resizeOnViewportChanged() { return this._resizeOnViewportChanged; }
		set resizeOnViewportChanged(r) { this._resizeOnViewportChanged = r; }
		
		create(attachments) {
			if (!attachments) {
				attachments = RenderSurface.DefaultAttachments();
			}
			this._renderSurface = this.surfaceImpl.create(this.context,attachments);
		}
		
		setActive() {
			this.surfaceImpl.setActive(this.context,this._renderSurface);
		}
		
		readBuffer(rectangle) {
			return this.surfaceImpl.readBuffer(this.context,this._renderSurface,rectangle,this.size);
		}
		
		destroy() {
			this.surfaceImpl.destroy(this.context,this._renderSurface);
			this._renderSurface = null;
		}
	}
	
	bg.base.RenderSurface = RenderSurface;
	
	bg.base.RenderSurfaceType = {
		RGBA:null,
		DEPTH:null
	};
	
	bg.base.RenderSurfaceFormat = {
		UNSIGNED_BYTE:null,
		UNSIGNED_SHORT:null,
		FLOAT:null,
		RENDERBUFFER:null
	};
	
	class ColorSurface extends RenderSurface {
		static MaxColorAttachments() {
			return bg.Engine.Get().colorBuffer.maxColorAttachments;
		}
		
		get surfaceImpl() { return bg.Engine.Get().colorBuffer; }
	}
	
	bg.base.ColorSurface = ColorSurface;
	
	class TextureSurface extends RenderSurface {
		static MaxColorAttachments() {
			return bg.Engine.Get().textureBuffer.maxColorAttachments;
		}
		
		get surfaceImpl() { return bg.Engine.Get().textureBuffer; }
		
		getTexture(attachment = 0) {
			return  this._renderSurface.attachments[attachment] &&
					this._renderSurface.attachments[attachment].texture;
		}
	}
	
	bg.base.TextureSurface = TextureSurface;
	
})();
