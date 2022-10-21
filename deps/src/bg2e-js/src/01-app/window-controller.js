(function() {
	class WindowController extends bg.LifeCycle {
		// Functions from LifeCycle:
		// init()
		// frame(delta)
		// display()
		// reshape(width,height)
		// keyDown(evt)
		// keyUp(evt)
		// mouseUp(evt)
		// mouseDown(evt)
		// mouseMove(evt)
		// mouseOut(evt)
		// mouseDrag(evt)
		// mouseWheel(evt)
		// touchStart(evt)
		// touchMove(evt)
		// touchEnd(evt)
		
		// 4 frames to ensure that the reflections are fully updated
		postRedisplay(frames=4) {
			bg.app.MainLoop.singleton.postRedisplay(frames);
		}
		
		postReshape() {
			bg.app.MainLoop.singleton.postReshape();
		}
		
		get canvas() {
			return bg.app.MainLoop.singleton.canvas;
		}
		
		get context() {
			return bg.app.MainLoop.singleton.canvas.context;
		}
		
		get gl() {
			return bg.app.MainLoop.singleton.canvas.context.gl;
		}
	}
	
	bg.app.WindowController = WindowController;
})();