(function() {
	
	class LifeCycle {
		init() {}
		frame(delta) {}

		displayGizmo(pipeline,matrixState) {}
		
		////// Direct rendering methods: will be deprecated soon
		willDisplay(pipeline,matrixState) {}
		display(pipeline,matrixState,forceDraw=false) {}
		didDisplay(pipeline,matrixState) {}
		////// End direct rendering methods

		////// Render queue methods
		willUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {}
		draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack) {}
		didUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {}
		////// End render queue methods

		reshape(pipeline,matrixState,width,height) {}
		keyDown(evt) {}
		keyUp(evt) {}
		mouseUp(evt) {}
		mouseDown(evt) {}
		mouseMove(evt) {}
		mouseOut(evt) {}
		mouseDrag(evt) {}
		mouseWheel(evt) {}
		touchStart(evt) {}
		touchMove(evt) {}
		touchEnd(evt) {}

		// Utility functions: do not override
		// 4 frames to ensure that the reflections are fully updated
		postRedisplay(frames=4) {
			bg.app.MainLoop.singleton.postRedisplay(frames);
		}

		postReshape() {
			bg.app.MainLoop.singleton.postReshape();
		}
	}
	
	bg.LifeCycle = LifeCycle;
	
})();