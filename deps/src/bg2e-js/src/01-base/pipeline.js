(function() {
	
	bg.base.ClearBuffers = {
		COLOR:null,
		DEPTH:null,
		COLOR_DEPTH:null
	};
	
	bg.base.BlendMode = {
		NORMAL: 1,			// It works as the Photoshop layers does	GL_SRC_ALPHA GL_ONE_MINUS_SRC_ALPHA, GL_FUNC_ADD
		MULTIPLY: 2,		// GL_ZERO GL_SRC_COLOR, GL_FUNC_ADD
		ADD: 3,				// GL_ONE GL_ONE, GL_FUNC_ADD
		SUBTRACT: 4,		// GL_ONE GL_ONE, GL_FUNC_SUBTRACT
		ALPHA_ADD: 5,		// GL_SRC_ALPHA GL_DST_ALPHA, GL_FUNC_ADD
		ALPHA_SUBTRACT: 6	// GL_SRC_ALPHA GL_DST_ALPHA, GL_FUNC_SUBTRACT
	};

	bg.base.OpacityLayer = {
		TRANSPARENT: 0b1,
		OPAQUE: 0b10,
		GIZMOS: 0b100,
		SELECTION: 0b1000,
		GIZMOS_SELECTION: 0b10000,
		ALL: 0b1111,
		NONE: 0
	};

	class PipelineImpl {
		constructor(context) {
			this.initFlags(context);
			bg.base.ClearBuffers.COLOR_DEPTH = bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH;
		}
		
		initFlags(context) {}
		
		setViewport(context,vp) {}
		clearBuffers(context,color,buffers) {}
		setDepthTestEnabled(context,e) {}
		setBlendEnabled(context,e) {}
		setBlendMode(context,m) {}
		setCullFace(context,e) {}
	}
	
	bg.base.PipelineImpl = PipelineImpl;

	let s_currentPipeline = null;
	
	function enablePipeline(pipeline) {
		if (pipeline._effect) {
			pipeline._effect.setActive();
		}
		pipeline.renderSurface.setActive();
		
		bg.Engine.Get().pipeline.setViewport(pipeline.context,pipeline._viewport);
		bg.Engine.Get().pipeline.setDepthTestEnabled(pipeline.context,pipeline._depthTest);
		bg.Engine.Get().pipeline.setCullFace(pipeline.context,pipeline._cullFace);
		bg.Engine.Get().pipeline.setBlendEnabled(pipeline.context,pipeline._blend);
		bg.Engine.Get().pipeline.setBlendMode(pipeline.context,pipeline._blendMode);
	}
	
	class Pipeline extends bg.app.ContextObject {
		static SetCurrent(p) {
			s_currentPipeline = p;
			if (s_currentPipeline) {
				enablePipeline(s_currentPipeline);
			}
		}
		
		static Current() { return s_currentPipeline; }
		
		constructor(context) {
			super(context);

			// Opacity layer
			this._opacityLayer = bg.base.OpacityLayer.ALL;
	
			// Viewport
			this._viewport = new bg.Viewport(0,0,200,200);
			
			// Clear buffer
			this._clearColor = bg.Color.Black();
			
			// Effect (used with draw method)
			this._effect = null;
			
			// Texture effect (used with drawTexture method)
			this._textureEffect = null;
			
			
			// Other flags
			this._depthTest = true;
			this._cullFace = true;
			
			// Render surface
			this._renderSurface = null;
			
			// Blending
			this._blend = false;
			this._blendMode = bg.base.BlendMode.NORMAL;

			this._buffersToClear = bg.base.ClearBuffers.COLOR_DEPTH;
		}
		
		get isCurrent() { return s_currentPipeline==this; }
		
		set opacityLayer(l) { this._opacityLayer = l; }
		get opacityLayer() { return this._opacityLayer; }
		shouldDraw(material) {
			return material &&
				   ((material.isTransparent && (this._opacityLayer & bg.base.OpacityLayer.TRANSPARENT)!=0) ||
				   (!material.isTransparent && (this._opacityLayer & bg.base.OpacityLayer.OPAQUE)!=0));
		}

		get effect() { return this._effect; }
		set effect(m) {
			this._effect = m;
			if (this._effect && this.isCurrent) {
				this._effect.setActive();
			}
		}
		
		get textureEffect() {
			if (!this._textureEffect) {
				this._textureEffect = new bg.base.DrawTextureEffect(this.context);
			}
			return this._textureEffect;
		}
		
		set textureEffect(t) {
			this._textureEffect = t;
		}

		set buffersToClear(b) { this._buffersToClear = b; }
		get buffersToClear() { return this._buffersToClear; }

		get renderSurface() {
			if (!this._renderSurface) {
				this._renderSurface = new bg.base.ColorSurface(this.context);
				this._renderSurface.setActive();
			}
			return this._renderSurface;
		}

		set renderSurface(r) {
			this._renderSurface = r;
			if (this.isCurrent) {
				this._renderSurface.setActive();
			}
		}
		 
		draw(polyList) {
			if (this._effect && polyList && this.isCurrent) {
				let cf = this.cullFace;
				this._effect.bindPolyList(polyList);
				if (this._effect.material) {
					
					this.cullFace = this._effect.material.cullFace;
				}
				polyList.draw();
				this._effect.unbind();
				this.cullFace = cf;
			}
		}
		
		drawTexture(texture) {
			let depthTest = this.depthTest;
			this.depthTest = false;
			this.textureEffect.drawSurface(texture);
			this.depthTest = depthTest;
		}
		
		get blend() { return this._blend; }
		set blend(b) {
			this._blend = b;
			if (this.isCurrent) {
				bg.Engine.Get().pipeline.setBlendEnabled(this.context,this._blend);
			}
		}
		
		get blendMode() { return this._blendMode; }
		set blendMode(b) {
			this._blendMode = b;
			if (this.isCurrent) {
				bg.Engine.Get().pipeline.setBlendMode(this.context,this._blendMode);
			}
		}
		
		get viewport() { return this._viewport; }
		set viewport(vp) {
			this._viewport = vp;
			if (this.renderSurface.resizeOnViewportChanged) {
				this.renderSurface.size = new bg.Vector2(vp.width,vp.height);
			}
			if (this.isCurrent) {
				bg.Engine.Get().pipeline.setViewport(this.context,this._viewport);
			}
		}
		
		clearBuffers(buffers) {
			if (this.isCurrent) {
				buffers = buffers!==undefined ? buffers : this._buffersToClear;
				bg.Engine.Get().pipeline.clearBuffers(this.context,this._clearColor,buffers);
			}
		}
		
		get clearColor() { return this._clearColor; }
		set clearColor(c) { this._clearColor = c; }
		
		get depthTest() { return this._depthTest; }
		set depthTest(e) {
			this._depthTest = e;
			if (this.isCurrent) {
				bg.Engine.Get().pipeline.setDepthTestEnabled(this.context,this._depthTest);
			}
		}
		
		get cullFace() { return this._cullFace; }
		set cullFace(c) {
			this._cullFace = c;
			if (this.isCurrent) {
				bg.Engine.Get().pipeline.setCullFace(this.context,this._cullFace);
			}
		}
	}
	
	bg.base.Pipeline = Pipeline;
})();