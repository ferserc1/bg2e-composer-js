(function() {

	class ForwardRenderer extends bg.render.Renderer {
		constructor(context) {
			super(context);
		}

		get isSupported() { return true; }
		create() {
			let ctx = this.context;
			this._transparentLayer = new bg.render.ForwardRenderLayer(ctx,bg.base.OpacityLayer.TRANSPARENT);
			this._opaqueLayer = new bg.render.ForwardRenderLayer(ctx,bg.base.OpacityLayer.OPAQUE);
			this._shadowMap = new bg.base.ShadowMap(ctx);
			this._shadowMap.size = new bg.Vector2(2048);

			this.settings.shadows.cascade = bg.base.ShadowCascade.NEAR;

			this._renderQueueVisitor = new bg.scene.RenderQueueVisitor
		}

		draw(scene,camera) {
			let shadowLight = null;
			let lightSources = [];
			let enabledLights = 0;
			bg.scene.Light.GetActiveLights().some((lightComponent,index) => {
				if (index>=bg.base.MAX_FORWARD_LIGHTS) return true;
				if (lightComponent.light &&
					lightComponent.light.enabled &&
					lightComponent.node &&
					lightComponent.node.enabled)
				{
					enabledLights++;
					lightSources.push(lightComponent);
					if (!shadowLight && lightComponent.light.type!=bg.base.LightType.POINT && lightComponent.light.castShadows) {
						shadowLight = lightComponent;
					}
				}
				return enabledLights>=bg.base.MAX_FORWARD_LIGHTS;
			});
			
			if (shadowLight) {
				if (this._shadowMap.size.x!=this.settings.shadows.quality) {
					this._shadowMap.size = new bg.Vector2(this.settings.shadows.quality);
				}
				this._shadowMap.update(scene,camera,shadowLight.light,shadowLight.transform,this.settings.shadows.cascade);
			}
			if (lightSources.length) {
				this._opaqueLayer.setLightSources(lightSources);
				this._opaqueLayer.shadowMap = this._shadowMap;

				this._transparentLayer.setLightSources(lightSources);
				this._transparentLayer.shadowMap = this._shadowMap;
			}
			else {
				this._opaqueLayer.setLightSources([]);
				this._opaqueLayer.shadowMap = null;
				this._transparentLayer.setLightSources([]);
				this._transparentLayer.shadowMap = null;
			}

			// Update render queue
			this._renderQueueVisitor.projectionMatrixStack.set(camera.projection);
			this._renderQueueVisitor.modelMatrixStack.identity();
			this._renderQueueVisitor.viewMatrixStack.set(camera.viewMatrix);
			this._renderQueueVisitor.renderQueue.beginFrame(camera.worldPosition);
			scene.accept(this._renderQueueVisitor);
			this._renderQueueVisitor.renderQueue.sortTransparentObjects();

			this._opaqueLayer.pipeline.clearColor = this.clearColor;
			this._opaqueLayer.draw(this._renderQueueVisitor.renderQueue,scene,camera);
			this._transparentLayer.draw(this._renderQueueVisitor.renderQueue,scene,camera);
		}

		getImage(scene,camera,width,height) {
			let prevViewport = camera.viewport;
			camera.viewport = new bg.Viewport(0,0,width,height);
			this.draw(scene,camera);
			this.draw(scene,camera);

			let canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			let ctx = canvas.getContext('2d');

			let buffer = this._opaqueLayer.pipeline.renderSurface.readBuffer(new bg.Viewport(0,0,width,height));
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
			this._opaqueLayer.viewport = prevViewport;
			this._transparentLayer.viewport = prevViewport;
			return img;
		}
	}

	bg.render.ForwardRenderer = ForwardRenderer;

})();