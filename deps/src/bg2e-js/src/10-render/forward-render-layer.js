(function() {

	class ForwardRenderLayer extends bg.render.RenderLayer {		
		constructor(context,opacityLayer) {
			super(context,opacityLayer);
			
			this._pipeline.effect = new bg.base.ForwardEffect(context);
			this._pipeline.opacityLayer = opacityLayer;

			// one light source
			this._lightComponent = null;

			// Multiple light sources
			this._lightComponents = [];
	
			if (opacityLayer == bg.base.OpacityLayer.TRANSPARENT) {
				this._pipeline.buffersToClear = bg.base.ClearBuffers.NONE;
				this._pipeline.blend = true;
				this._pipeline.blendMode = bg.base.BlendMode.NORMAL;
			}
		}

		// Single light
		set lightComponent(light) { this._lightComponent = light; }
		get lightComponent() { return this._lightComponent; }

		// Multiple lights
		setLightSources(lightComponents) {
			this._lightComponents = lightComponents;
		}

		set shadowMap(sm) { this._shadowMap = sm; }
		get shadowMap() { return this._shadowMap; }
		
		draw(renderQueue,scene,camera) {
			// TODO: Why is this required to update the light transforms?
			let activeQueue = this._pipeline.opacityLayer==bg.base.OpacityLayer.OPAQUE ? renderQueue.opaqueQueue : renderQueue.transparentQueue;
			this.matrixState.modelMatrixStack.push();
			activeQueue.forEach((objectData) => {
				this.matrixState.modelMatrixStack.set(objectData.modelMatrix);
				this.matrixState.viewMatrixStack.set(objectData.viewMatrix);
			});
			this.matrixState.modelMatrixStack.pop();

			bg.base.Pipeline.SetCurrent(this._pipeline);
			this._pipeline.viewport = camera.viewport;
			
			if (camera.clearBuffers!=0) {
				this._pipeline.clearBuffers();
			}
		
			this.matrixState.projectionMatrixStack.set(camera.projection);

			this.willDraw(scene,camera);
			this.performDraw(renderQueue,scene,camera);
		}

		willDraw(scene,camera) {
			if (this._lightComponent) {
				this._pipeline.effect.light = this._lightComponent.light;
				this._pipeline.effect.lightTransform = this._lightComponent.transform;
				this._pipeline.effect.shadowMap = this._shadowMap;
			}
			else if (this._lightComponents) {
				this._pipeline.effect.lightArray.reset();
				this._lightComponents.forEach((comp) => {
					this._pipeline.effect.lightArray.push(comp.light,comp.transform);
				});
				this._pipeline.effect.shadowMap = this._shadowMap;
			}
		}

		performDraw(renderQueue,scene,camera) {
			this._pipeline.viewport = camera.viewport;

			let activeQueue = this._pipeline.opacityLayer==bg.base.OpacityLayer.OPAQUE ? renderQueue.opaqueQueue : renderQueue.transparentQueue;
			this.matrixState.modelMatrixStack.push();
			activeQueue.forEach((objectData) => {
				this.matrixState.modelMatrixStack.set(objectData.modelMatrix);
				this.matrixState.viewMatrixStack.set(objectData.viewMatrix);
				this._pipeline.effect.material = objectData.material;
				this._pipeline.draw(objectData.plist);
			});
			this.matrixState.modelMatrixStack.pop();
		}
	}
	
	bg.render.ForwardRenderLayer = ForwardRenderLayer;
	
})();
