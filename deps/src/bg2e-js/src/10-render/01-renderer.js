(function() {
	
	bg.render.RenderPath = {
		FORWARD:1,
		DEFERRED:2,

		PBR:3,
		PBR_DEFERRED:4
	};
	
	function getRenderPass(context,renderPath) {
		let Factory = null;
			switch (renderPath) {
				case bg.render.RenderPath.FORWARD:
					Factory = bg.render.ForwardRenderPass;
					break;
				case bg.render.RenderPath.DEFERRED:
					if (bg.render.DeferredRenderPass.IsSupported()) {
						Factory = bg.render.DeferredRenderPass;
					}
					else {
						bg.log("WARNING: Deferred renderer is not supported on this browser");
						Factory = bg.render.ForwardRenderPass;
					}
					break;
			}
			
			return Factory && new Factory(context);
	}

	// This is a foward declaration of raytracer quality settings
	bg.render.RaytracerQuality = {
		low : { maxSamples: 20, rayIncrement: 0.05 },
		mid: { maxSamples: 50, rayIncrement: 0.025 },
		high: { maxSamples: 100, rayIncrement: 0.0125 },
		extreme: { maxSamples: 200, rayIncrement: 0.0062 }
	};

	bg.render.ShadowType = {
		HARD: bg.base.ShadowType.HARD,
		SOFT: bg.base.ShadowType.SOFT
	};

	bg.render.ShadowMapQuality = {
		low: 512,
		mid: 1024,
		high: 2048,
		extreme: 4096
	};

	let renderSettings = {
		debug: {
			enabled: false
		},
		ambientOcclusion: {
			enabled: true,
			sampleRadius: 0.4,
			kernelSize: 16,
			blur: 2,
			maxDistance: 300,
			scale: 1.0
		},
		raytracer: {
			enabled: true,
			quality: bg.render.RaytracerQuality.mid,
			scale: 0.5
		},
		antialiasing: {
			enabled: false
		},
		shadows: {
			quality: bg.render.ShadowMapQuality.mid,
			type: bg.render.ShadowType.SOFT
		},
		colorCorrection: {
			gamma: 2,
			saturation: 1,
			brightness: 1,
			contrast: 1
		}		
	}
	
	class Renderer extends bg.app.ContextObject {
		static Create(context,renderPath) {
			let result = null;
			if (renderPath==bg.render.RenderPath.DEFERRED) {
				result = new bg.render.DeferredRenderer(context);
			}

			if (renderPath==bg.render.RenderPath.FORWARD ||
				(result && !result.isSupported))
			{
				result = new bg.render.ForwardRenderer(context);
			}

			if (renderPath==bg.render.RenderPath.PBR) {
				result = new bg.render.PBRForwardRenderer(context);
			}

			if (renderPath==bg.render.RenderPath.PBR_DEFERRED) {
				bg.log("WARNING: PBR deferred renderer is not implemented. Using PBR forward renderer");
				result = new bg.render.PBRForwardRenderer(context);
			}

			if (result.isSupported) {
				result.create();
			}
			else {
				throw new Error("No suitable renderer found.");
			}
			return result;
		}

		constructor(context) {
			super(context);
			
			this._frameVisitor = new bg.scene.FrameVisitor();

			this._settings = renderSettings;

			this._clearColor = bg.Color.Black();
		}

		get isSupported() { return false; }
		create() { console.log("ERROR: Error creating renderer. The renderer class must implemente the create() method."); }

		get clearColor() { return this._clearColor; }
		set clearColor(c) { this._clearColor = c; }

		frame(sceneRoot,delta) {
			this._frameVisitor.delta = delta;
			sceneRoot.accept(this._frameVisitor);
		}
		
		display(sceneRoot,camera) {
			this.draw(sceneRoot,camera);
		}

		get settings() {
			return this._settings;
		}
	}
	
	bg.render.Renderer = Renderer;
	
})();