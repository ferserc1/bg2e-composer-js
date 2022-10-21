(function() {



	class DeferredRenderer extends bg.render.Renderer {
		constructor(context) {
			super(context);
			this._size = new bg.Size2D(0);
		}

		get isSupported() {
			return  bg.base.RenderSurface.MaxColorAttachments()>5 &&
					bg.base.RenderSurface.SupportFormat(bg.base.RenderSurfaceFormat.FLOAT) &&
					bg.base.RenderSurface.SupportType(bg.base.RenderSurfaceType.DEPTH);
		}

		get pipeline() { return this._pipeline; }

		create() {
			let ctx = this.context;

			this._renderQueueVisitor = new bg.scene.RenderQueueVisitor();

			this._opaqueLayer = new bg.render.DeferredRenderLayer(ctx);
			this._opaqueLayer.settings = this.settings;
			this._opaqueLayer.createOpaque();

			this._transparentLayer = new bg.render.DeferredRenderLayer(ctx);
			this._transparentLayer.settings = this.settings;
			this._transparentLayer.createTransparent(this._opaqueLayer.maps);

			this._shadowMap = new bg.base.ShadowMap(ctx);
			this._shadowMap.size = new bg.Vector2(2048);

			this._opaqueLayer.shadowMap = this._shadowMap;
			this._transparentLayer.shadowMap = this._shadowMap;

			let mixSurface = new bg.base.TextureSurface(ctx);
			mixSurface.create();
			this._mixPipeline = new bg.base.Pipeline(ctx);
			this._mixPipeline.textureEffect = new bg.render.RendererMixEffect(ctx);
			this._mixPipeline.renderSurface = mixSurface;

			this._pipeline = new bg.base.Pipeline(ctx);
			this._pipeline.textureEffect = new bg.render.PostprocessEffect(ctx);
			
			this.settings.renderScale = this.settings.renderScale || 1.0;
		}

		draw(scene,camera) {
			if (this._shadowMap.size.x!=this.settings.shadows.quality) {
				this._shadowMap.size = new bg.Vector2(this.settings.shadows.quality);
			}
			
			let vp = camera.viewport;
			let aa = this.settings.antialiasing || {};
			let maxSize = aa.maxTextureSize || 4096;
			let ratio = vp.aspectRatio;
			let scaledWidth = vp.width;
			let scaledHeight = vp.height;
			if (aa.enabled) {
				scaledWidth = vp.width * 2;
				scaledHeight = vp.height * 2;
				if (ratio>1 && scaledWidth>maxSize) {	// Landscape
					scaledWidth = maxSize;
					scaledHeight = maxSize / ratio;
				}
				else if (scaledHeight>maxSize) {	// Portrait
					scaledHeight = maxSize;
					scaledWidth = maxSize * ratio;
				}
			}
			else if (true) {
				scaledWidth = vp.width * this.settings.renderScale;
				scaledHeight = vp.height * this.settings.renderScale;
				if (ratio>1 && scaledWidth>maxSize) {	// Landscape
					scaledWidth = maxSize;
					scaledHeight = maxSize / ratio;
				}
				else if (scaledHeight>maxSize) {	// Portrait
					scaledHeight = maxSize;
					scaledWidth = maxSize * ratio;
				}
			}

			let scaledViewport = new bg.Viewport(0,0,scaledWidth,scaledHeight);
			camera.viewport = scaledViewport;
			let mainLight = null;

			this._opaqueLayer.clearColor = this.clearColor;
			if (this._size.width!=camera.viewport.width ||
				this._size.height!=camera.viewport.height)
			{
				this._opaqueLayer.resize(camera);
				this._transparentLayer.resize(camera);
			}
			

			// Update render queue
			this._renderQueueVisitor.modelMatrixStack.identity();
			this._renderQueueVisitor.projectionMatrixStack.push();
			this._renderQueueVisitor.projectionMatrixStack.set(camera.projection);
			this._renderQueueVisitor.viewMatrixStack.set(camera.viewMatrix);
			this._renderQueueVisitor.renderQueue.beginFrame(camera.worldPosition);
			scene.accept(this._renderQueueVisitor);
			this._renderQueueVisitor.renderQueue.sortTransparentObjects();
			this._opaqueLayer.draw(this._renderQueueVisitor.renderQueue,scene,camera);
			this._transparentLayer.draw(this._renderQueueVisitor.renderQueue,scene,camera);
			this._renderQueueVisitor.projectionMatrixStack.pop();

			bg.base.Pipeline.SetCurrent(this._mixPipeline);
			this._mixPipeline.viewport = camera.viewport;
			this._mixPipeline.clearColor = bg.Color.Black();
			this._mixPipeline.clearBuffers();
			this._mixPipeline.drawTexture({
				opaque:this._opaqueLayer.texture,
				transparent:this._transparentLayer.texture,
				transparentNormal:this._transparentLayer.maps.normal,
				opaqueDepth:this._opaqueLayer.maps.position,
				transparentDepth:this._transparentLayer.maps.position
			});

			bg.base.Pipeline.SetCurrent(this.pipeline);
			this.pipeline.viewport = vp;
			this.pipeline.clearColor = this.clearColor;
			this.pipeline.clearBuffers();
			this.pipeline.drawTexture({
				texture: this._mixPipeline.renderSurface.getTexture(0)
			});
			camera.viewport = vp;
		}

		getImage(scene,camera,width,height) {
			let prevViewport = camera.viewport;
			camera.viewport = new bg.Viewport(0,0,width,height);
			this.draw(scene,camera);

			let canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			let ctx = canvas.getContext('2d');

			let buffer = this.pipeline.renderSurface.readBuffer(new bg.Viewport(0,0,width,height));
			let imgData = ctx.createImageData(width,height);
			let len = width * 4;
			// Flip image data
			for (let i = 0; i<height; ++i) {
				for (let j = 0; j<len; j+=4) {
					let srcRow = i * width * 4;
					let dstRow = (height - i) * width * 4;
					imgData.data[dstRow + j + 0] = buffer[srcRow + j + 0];
					imgData.data[dstRow + j + 1] = buffer[srcRow + j + 1];
					imgData.data[dstRow + j + 2] = buffer[srcRow + j + 2];
					imgData.data[dstRow + j + 3] = buffer[srcRow + j + 3];
				}
			}
			ctx.putImageData(imgData,0,0);

			let img = canvas.toDataURL('image/jpeg');

			camera.viewport = prevViewport;
			this.viewport = prevViewport;
			this.draw(scene,camera);
			return img;
		}
	}

	bg.render.DeferredRenderer = DeferredRenderer;
})();