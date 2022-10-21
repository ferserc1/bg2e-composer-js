(function() {

	bg.render.SurfaceType = {
		UNDEFINED: 0,
		OPAQUE: 1,
		TRANSPARENT: 2
	};

	let g_ssrtScale = 0.5;
	let g_ssaoScale = 1.0;

	class DeferredRenderSurfaces extends bg.app.ContextObject {
		constructor(context) {
			super(context);
			this._type = bg.render.SurfaceType.UNDEFINED;

			this._gbufferUByteSurface = null;
			this._gbufferFloatSurface = null;
			this._lightingSurface = null;
			this._shadowSurface = null;
			this._ssaoSurface = null;
			this._mixSurface = null;
			this._ssrtSurface = null;
	
			this._opaqueSurfaces = null;
		}
	
		createOpaqueSurfaces() {
			this._type = bg.render.SurfaceType.OPAQUE;
			this.createCommon();
		}

		createTransparentSurfaces(opaqueSurfaces) {
			this._type = bg.render.SurfaceType.TRANSPARENT;
			this._opaqueSurfaces = opaqueSurfaces;
			this.createCommon();
		}
		
		resize(newSize) {
			let s = new bg.Vector2(newSize.width,newSize.height);
			this._gbufferUByteSurface.size = s;
			this._gbufferFloatSurface.size = s;
			this._lightingSurface.size = s;
			this._shadowSurface.size = s;
			this._ssaoSurface.size = new bg.Vector2(s.x * g_ssaoScale,s.y * g_ssaoScale);
			this._ssrtSurface.size = new bg.Vector2(s.x * g_ssrtScale,s.y * g_ssrtScale);
			this._mixSurface.size = s;
		}

		get type() { return this._type; }
		
		get gbufferUByteSurface() { return this._gbufferUByteSurface; }
		get gbufferFloatSurface() { return this._gbufferFloatSurface; }
		get lightingSurface() { return this._lightingSurface; }
		get shadowSurface() { return this._shadowSurface; }
		get ssaoSurface() { return this._ssaoSurface; }
		get ssrtSurface() { return this._ssrtSurface; }
		get mixSurface() { return this._mixSurface; }
		
		get diffuse() { return this._gbufferUByteSurface.getTexture(0); }
		get specular() { return this._gbufferUByteSurface.getTexture(1); }
		get normal() { return this._gbufferUByteSurface.getTexture(2); }
		get material() { return this._gbufferUByteSurface.getTexture(3); }
		get position() { return this._gbufferFloatSurface.getTexture(0); }
		get lighting() { return this._lightingSurface.getTexture(); }
		get shadow() { return this._shadowSurface.getTexture(); }
		get ambientOcclusion() { return this._ssaoSurface.getTexture(); }
		get reflection() { return this._ssrtSurface.getTexture(); }
		get mix() { return this._mixSurface.getTexture(); }
		get reflectionColor() { return this._type==bg.render.SurfaceType.OPAQUE ? this.lighting : this._opaqueSurfaces.lighting; }
		get reflectionDepth() { return this._type==bg.render.SurfaceType.OPAQUE ? this.position : this._opaqueSurfaces.position; }
		get mixDepthMap() { return this._type==bg.render.SurfaceType.OPAQUE ? this.position : this._opaqueSurfaces.position; }
		
		// Generated in lighting shader
		get shininess() { return this._lightingSurface.getTexture(1); }
		get bloom() { return this._lightingSurface.getTexture(2); }
		
		createCommon() {
			var ctx = this.context;
			this._gbufferUByteSurface = new bg.base.TextureSurface(ctx);
			this._gbufferUByteSurface.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._gbufferUByteSurface.resizeOnViewportChanged = false;

			this._gbufferFloatSurface = new bg.base.TextureSurface(ctx);
			this._gbufferFloatSurface.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.FLOAT },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._gbufferFloatSurface.resizeOnViewportChanged = false;

			this._lightingSurface = new bg.base.TextureSurface(ctx);
			this._lightingSurface.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.FLOAT },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.FLOAT },
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.FLOAT },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._lightingSurface.resizeOnViewportChanged = false;

			this._shadowSurface = new bg.base.TextureSurface(ctx);
			this._shadowSurface.create([
				{ type:bg.base.RenderSurfaceType.RGBA, format:bg.base.RenderSurfaceFormat.UNSIGNED_BYTE },
				{ type:bg.base.RenderSurfaceType.DEPTH, format:bg.base.RenderSurfaceFormat.RENDERBUFFER }
			]);
			this._shadowSurface.resizeOnViewportChanged = false;

			this._ssaoSurface = new bg.base.TextureSurface(ctx);
			this._ssaoSurface.create();
			this._ssaoSurface.resizeOnViewportChanged = false;

			this._ssrtSurface = new bg.base.TextureSurface(ctx);
			this._ssrtSurface.create();
			this._ssrtSurface.resizeOnViewportChanged = false;

			this._mixSurface = new bg.base.TextureSurface(ctx);
			this._mixSurface.create();
			this._mixSurface.resizeOnViewportChanged = false;
		}
	}

	bg.render.DeferredRenderSurfaces = DeferredRenderSurfaces;

	function newPL(ctx,fx,surface,opacityLayer) {
		let pl = new bg.base.Pipeline(ctx);
		pl.renderSurface = surface;
		if (opacityLayer!==undefined) {
			pl.opacityLayer = opacityLayer;
			pl.effect = fx;
		}
		else {
			pl.textureEffect = fx;
		}
		return pl;
	}

	function createCommon(deferredRenderLayer) {
		let ctx = deferredRenderLayer.context;
		let s = deferredRenderLayer._surfaces;
		let opacityLayer = deferredRenderLayer._opacityLayer;

		deferredRenderLayer._gbufferUbyte = newPL(ctx,
			new bg.render.GBufferEffect(ctx),
			s.gbufferUByteSurface,opacityLayer);
		deferredRenderLayer._gbufferFloat = newPL(ctx,
			new bg.render.PositionGBufferEffect(ctx),
			s.gbufferFloatSurface, opacityLayer);
		deferredRenderLayer._shadow = newPL(ctx,
			new bg.render.ShadowEffect(ctx),
			s.shadowSurface,
			bg.base.OpacityLayer.ALL);

		deferredRenderLayer._lighting = newPL(ctx,new bg.render.LightingEffect(ctx), s.lightingSurface);
		deferredRenderLayer._ssao = newPL(ctx,new bg.render.SSAOEffect(ctx), s.ssaoSurface);
		deferredRenderLayer._ssao.clearColor = bg.Color.White();
		deferredRenderLayer._ssrt = newPL(ctx,new bg.render.SSRTEffect(ctx), s.ssrtSurface);

		// Visitors for gbuffers and shadow maps
		let matrixState = deferredRenderLayer.matrixState;
		deferredRenderLayer.ubyteVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._gbufferUbyte,matrixState);
		deferredRenderLayer.floatVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._gbufferFloat,matrixState);
		deferredRenderLayer.shadowVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._shadow,matrixState);


		// TODO: Debug code. Uncomment newPL()
		deferredRenderLayer._mix = newPL(ctx,new bg.render.DeferredMixEffect(ctx), s.mixSurface);
		//deferredRenderLayer._mix.renderSurface = new bg.base.ColorSurface(ctx);
		//deferredRenderLayer._mix = new bg.base.Pipeline(ctx);
		//deferredRenderLayer._mix.renderSurface = s.mixSurface;
	}

	class DeferredRenderLayer extends bg.render.RenderLayer {
		constructor(context) {
			super(context);
		}

		createOpaque() {
			this._opacityLayer = bg.base.OpacityLayer.OPAQUE;
			this._surfaces = new bg.render.DeferredRenderSurfaces(this.context);
			this._surfaces.createOpaqueSurfaces();
			createCommon(this);
		}

		createTransparent(opaqueMaps) {
			this._opacityLayer = bg.base.OpacityLayer.TRANSPARENT;
			this._surfaces = new bg.render.DeferredRenderSurfaces(this.context);
			this._surfaces.createTransparentSurfaces(opaqueMaps);
			createCommon(this);

			this._gbufferUbyte.blend = true;
			this._gbufferUbyte.setBlendMode = bg.base.BlendMode.NORMAL;
			this._gbufferUbyte.clearColor = bg.Color.Transparent();
			this._lighting.clearColor = bg.Color.Black();
			this.pipeline.clearColor = bg.Color.Transparent();
		}

		set shadowMap(sm) { this._shadowMap = sm; }
		get shadowMap() { return this._shadowMap; }

		get pipeline() { return this._mix; }
		get texture() { return this.maps.mix; }

		// TODO: Scene is used by the shadow map generator, but the shadow map can also be
		// modified to use the render queue
		draw(renderQueue,scene,camera) {
			g_ssaoScale = this.settings.ambientOcclusion.scale || 1;
			g_ssrtScale = this.settings.raytracer.scale || 0.5;

			this.matrixState.projectionMatrixStack.set(camera.projection);
			this.matrixState.viewMatrixStack.set(camera.viewMatrix);
			this.matrixState.modelMatrixStack.identity();
			
			this.performDraw(renderQueue,scene,camera);
		}
		
		get maps() { return this._surfaces; }
		
		resize(camera) {
			g_ssaoScale = this.settings.ambientOcclusion.scale || 1;
			g_ssrtScale = this.settings.raytracer.scale || 0.5;

			let vp = camera.viewport;
			this.maps.resize(new bg.Size2D(vp.width,vp.height));
		}
		
		performDraw(renderQueue,scene,camera) {
			let activeQueue = this._opacityLayer==bg.base.OpacityLayer.OPAQUE ? renderQueue.opaqueQueue : renderQueue.transparentQueue;

			let performRenderQueue = (queue,pipeline) => {
				this.matrixState.modelMatrixStack.push();
				this.matrixState.viewMatrixStack.push();
				queue.forEach((objectData) => {
					this.matrixState.modelMatrixStack.set(objectData.modelMatrix);
					this.matrixState.viewMatrixStack.set(objectData.viewMatrix);
					pipeline.effect.material = objectData.material;
					pipeline.draw(objectData.plist);
				});
				this.matrixState.modelMatrixStack.pop();
				this.matrixState.viewMatrixStack.pop();
			}

			bg.base.Pipeline.SetCurrent(this._gbufferUbyte);
			this._gbufferUbyte.viewport = camera.viewport;
			this._gbufferUbyte.clearBuffers();
			performRenderQueue(activeQueue,this._gbufferUbyte);
			
			bg.base.Pipeline.SetCurrent(this._gbufferFloat);
			this._gbufferFloat.viewport = camera.viewport;
			this._gbufferFloat.clearBuffers();
			performRenderQueue(activeQueue,this._gbufferFloat);

			// Render lights
			this._lighting.viewport = camera.viewport;
			this._lighting.clearcolor = bg.Color.White();
			bg.base.Pipeline.SetCurrent(this._lighting);
			this._lighting.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);
			this._lighting.blendMode = bg.base.BlendMode.ADD;
			this._lighting.blend = true;
			this._shadow.viewport = camera.viewport;

			let lightIndex = 0;
			bg.scene.Light.GetActiveLights().forEach((lightComponent) => {
				if (lightComponent.light && lightComponent.light.enabled &&
					lightComponent.node && lightComponent.node.enabled)
				{
					if (lightComponent.light.type==bg.base.LightType.DIRECTIONAL)
					{
						this._shadowMap.update(scene,camera,lightComponent.light,lightComponent.transform,bg.base.ShadowCascade.NEAR);
					
						bg.base.Pipeline.SetCurrent(this._shadow);
						this._shadow.viewport = camera.viewport;
						this._shadow.clearBuffers();
						this._shadow.effect.light = lightComponent.light;
						this._shadow.effect.shadowMap = this._shadowMap;
						scene.accept(this.shadowVisitor);	
					}
					else if (lightComponent.light.type==bg.base.LightType.SPOT) {
						this._shadowMap.shadowType = this.settings.shadows.type;
						this._shadowMap.update(scene,camera,lightComponent.light,lightComponent.transform);
						bg.base.Pipeline.SetCurrent(this._shadow);
						this._shadow.viewport = camera.viewport;
						this._shadow.clearBuffers();
						this._shadow.effect.light = lightComponent.light;
						this._shadow.effect.shadowMap = this._shadowMap;
						scene.accept(this.shadowVisitor);
					}

					bg.base.Pipeline.SetCurrent(this._lighting);
					// Only render light emission in the first light source
					this._lighting.textureEffect.lightEmissionFactor = lightIndex==0 ? 10:0;

					this._lighting.textureEffect.light = lightComponent.light;
					this._lighting.textureEffect.lightTransform = lightComponent.transform;
					this._lighting.textureEffect.shadowMap = this.maps.shadow;
					this._lighting.drawTexture(this.maps);
					++lightIndex;
				}				
			});

			let renderSSAO = this.settings.ambientOcclusion.enabled;
			let renderSSRT = this.settings.raytracer.enabled;
			let vp = new bg.Viewport(camera.viewport);

			this._ssao.textureEffect.enabled = renderSSAO;
			this._ssao.textureEffect.settings.kernelSize = this.settings.ambientOcclusion.kernelSize;
			this._ssao.textureEffect.settings.sampleRadius = this.settings.ambientOcclusion.sampleRadius;
			this._ssao.textureEffect.settings.maxDistance = this.settings.ambientOcclusion.maxDistance;
			if (renderSSAO) {
				bg.base.Pipeline.SetCurrent(this._ssao);
				this._ssao.viewport = new bg.Viewport(vp.x,vp.y,vp.width * g_ssaoScale, vp.height * g_ssaoScale);
				this._ssao.clearBuffers();
				this._ssao.textureEffect.viewport = camera.viewport;
				this._ssao.textureEffect.projectionMatrix = camera.projection;
				this._ssao.drawTexture(this.maps);
			}


			// SSRT
			bg.base.Pipeline.SetCurrent(this._ssrt);
			if (renderSSRT) {
				this._ssrt.viewport = new bg.Viewport(vp.x,vp.y,vp.width * g_ssrtScale, vp.height * g_ssrtScale);
				this._ssrt.clearBuffers(bg.base.ClearBuffers.DEPTH);
				this._ssrt.textureEffect.quality = this.settings.raytracer.quality;
				var cameraTransform = camera.node.component("bg.scene.Transform");
				if (cameraTransform) {
					let viewProjection = new bg.Matrix4(camera.projection);
					viewProjection.mult(camera.viewMatrix);
					this._ssrt.textureEffect.cameraPosition= viewProjection.multVector(cameraTransform.matrix.position).xyz;
				}
				this._ssrt.textureEffect.projectionMatrix = camera.projection;
				this._ssrt.textureEffect.rayFailColor = this.settings.raytracer.clearColor || bg.Color.Black();
				this._ssrt.textureEffect.basic = this.settings.raytracer.basicReflections || false;
				this._ssrt.textureEffect.viewportSize = new bg.Vector2(this._ssrt.viewport.width,this._ssrt.viewport.height);
				this._ssrt.drawTexture(this.maps);
			}

			bg.base.Pipeline.SetCurrent(this.pipeline);
			this.pipeline.viewport = camera.viewport;
			this.pipeline.clearBuffers();
			this.pipeline.textureEffect.viewport = camera.viewport;
			this.pipeline.textureEffect.ssaoBlur = renderSSAO ? this.settings.ambientOcclusion.blur : 1;
	
			this.pipeline.textureEffect.ssrtScale = g_ssrtScale * this.settings.renderScale;
			this.pipeline.drawTexture({
				lightingMap:this.maps.lighting,
				diffuseMap:this.maps.diffuse,
				positionMap:this.maps.position,
				ssaoMap:renderSSAO ? this.maps.ambientOcclusion:bg.base.TextureCache.WhiteTexture(this.context),
				reflectionMap:renderSSRT ? this.maps.reflection:this.maps.lighting,
				specularMap:this.maps.specular,
				materialMap:this.maps.material,
				opaqueDepthMap:this.maps.mixDepthMap,
				shininess:this.maps.shininess
				// TODO: bloom
			});	// null: all textures are specified as parameters to the effect

			camera.viewport = vp;
		}
	}
	
	bg.render.DeferredRenderLayer = DeferredRenderLayer;
	
})();
