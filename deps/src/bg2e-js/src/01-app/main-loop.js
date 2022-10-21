(function() {
	let s_mainLoop = null;
	let s_mouseStatus = {
		leftButton:false,
		middleButton:false,
		rightButton:false,
		pos: {
			x:-1,
			y:-1
		}	
	}
	Object.defineProperty(s_mouseStatus, "anyButton", {
		get: function() {
			return this.leftButton || this.middleButton || this.rightButton;
		}
	});
	let s_delta = -1;
	
	class Mouse {
		static LeftButton() { return s_mouseStatus.leftButton; }
		static MiddleButton() { return s_mouseStatus.middleButton; }
		static RightButton() { return s_mouseStatus.rightButton; }
		static Position() { return s_mouseStatus.pos; }
	}
	
	bg.app.Mouse = Mouse;
	
	bg.app.FrameUpdate = {
		AUTO: 0,
		MANUAL: 1
	};
	
	class MainLoop {
		constructor() {
			this._canvas = null;
			this._windowController = null;
			this._updateMode = bg.app.FrameUpdate.AUTO;
			this._redisplayFrames = 1;
			bg.bindImageLoadEvent(() => {
				this.postRedisplay();
			});
		}
		
		get canvas() { return this._canvas; }
		set canvas(c) {
			this._canvas = new bg.app.Canvas(c);
		}
		get windowController() { return this._windowController; }
		get updateMode() { return this._updateMode; }
		set updateMode(m) {
			this._updateMode = m;
			if (this._updateMode==bg.app.FrameUpdate.AUTO) {
				this._redisplayFrames = 1;
			}
		}
		get redisplay() { return this._redisplayFrames>0; }
		get mouseButtonStatus() { return s_mouseStatus; }
		
		run(windowController,preventEvents=[]) {
			this._windowController = windowController;
			g_preventEvents = preventEvents;
			this.postRedisplay();
			this.windowController.init();
			initEvents();
			animationLoop();
		}
		
		// 4 frames to ensure that the reflections are fully updated
		postRedisplay(frames=4) {
			this._redisplayFrames = frames;
		}
		
		postReshape() {
			onResize();
		}
	}
	
	let lastTime = 0;
	function animationLoop(totalTime) {
		totalTime = totalTime || 0;
		requestAnimFrame(animationLoop);
		let elapsed = totalTime - lastTime;
		lastTime = totalTime;
		onUpdate(elapsed);
	}

	let g_preventEvents = [];
	function initEvents() {
		onResize();
		
		window.addEventListener("resize", function(evt) { onResize(); });
		
		if (s_mainLoop.canvas) {
			let c = s_mainLoop.canvas.domElement;
			if (g_preventEvents.indexOf("mousedown")==-1) {
				c.addEventListener("mousedown", function(evt) {
					if (!onMouseDown(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("mousemove")==-1) {
				c.addEventListener("mousemove", function(evt) {
					if (!onMouseMove(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("mouseout")==-1) {
				c.addEventListener("mouseout", function(evt) {
					if (!onMouseOut(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("mouseover")==-1) {
				c.addEventListener("mouseover", function(evt) {
					if (!onMouseOver(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("mouseup")==-1) {
				c.addEventListener("mouseup", function(evt) {
					if (!onMouseUp(evt).executeDefault) { 
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("touchstart")==-1) {
				c.addEventListener("touchstart", function(evt) {
					if (!onTouchStart(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("touchmove")==-1) {
				c.addEventListener("touchmove", function(evt) {
					if (!onTouchMove(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			if (g_preventEvents.indexOf("touchend")==-1) {
				c.addEventListener("touchend", function(evt) {
					if (!onTouchEnd(evt).executeDefault) { 
						evt.preventDefault();
						return false;
					}
				});
			}
			
			if (g_preventEvents.indexOf("mousewheel")==-1) {
				var mouseWheelEvt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
				c.addEventListener(mouseWheelEvt, function(evt) {
					if (!onMouseWheel(evt).executeDefault) {
						evt.preventDefault();
						return false;
					}
				});
			}
			
			if (g_preventEvents.indexOf("keydown")==-1) {
				window.addEventListener("keydown", function(evt) { onKeyDown(evt); });
			}
			if (g_preventEvents.indexOf("keyup")==-1) {
				window.addEventListener("keyup", function(evt) { onKeyUp(evt); });
			}
			
			c.oncontextmenu = function(e) { return false; };
		}
		else {
			throw new Error("Configuration error in MainLoop: no canvas defined");
		}
	}
	
	function onResize() {
		if (s_mainLoop.canvas && s_mainLoop.windowController) {
			let multisample = s_mainLoop.canvas.multisample;
			s_mainLoop.canvas.domElement.width = s_mainLoop.canvas.width * multisample;
			s_mainLoop.canvas.domElement.height = s_mainLoop.canvas.height * multisample; 
			s_mainLoop.windowController.reshape(s_mainLoop.canvas.width * multisample, s_mainLoop.canvas.height * multisample);
		}
	}
	
	function onUpdate(elapsedTime) {
		if (s_mainLoop.redisplay) {
			//if (s_delta==-1) s_delta = Date.now();
			//s_mainLoop.windowController.frame((Date.now() - s_delta) * 2);
			//s_delta = Date.now();
			s_mainLoop.windowController.frame(elapsedTime);
			if (s_mainLoop.updateMode==bg.app.FrameUpdate.AUTO) {
				s_mainLoop._redisplayFrames = 1;
			}
			else {
				s_mainLoop._redisplayFrames--;
			}
			s_mainLoop.windowController.display();
		}
	}
	
	function onMouseDown(event) {
		let offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
		let multisample = s_mainLoop.canvas.multisample;
		s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
		s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
		switch (event.button) {
			case bg.app.MouseButton.LEFT:
				s_mouseStatus.leftButton = true;
				break;
			case bg.app.MouseButton.MIDDLE:
				s_mouseStatus.middleButton = true;
				break;
			case bg.app.MouseButton.RIGHT:
				s_mouseStatus.rightButton = true;
				break;
		}

		let bgEvent = new bg.app.MouseEvent(event.button,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,event);
		s_mainLoop.windowController.mouseDown(bgEvent);
		return bgEvent;
	}
	
	function onMouseMove(event) {
		let offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
		let multisample = s_mainLoop.canvas.multisample;
		s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
		s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
		let evt = new bg.app.MouseEvent(bg.app.MouseButton.NONE,
										s_mouseStatus.pos.x,
										s_mouseStatus.pos.y,
										0,
										event);
		s_mainLoop.windowController.mouseMove(evt);
		if (s_mouseStatus.anyButton) {
			s_mainLoop.windowController.mouseDrag(evt);
		}
		return evt;
	}
	
	function onMouseOut() {
		let bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.NONE,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,{});
		s_mainLoop.windowController.mouseOut(bgEvt);
		if (s_mouseStatus.leftButton) {
			s_mouseStatus.leftButton = false;
			bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.LEFT,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,{});
			s_mainLoop.windowController.mouseUp(bgEvt);
		}
		if (s_mouseStatus.middleButton) {
			s_mouseStatus.middleButton = false;
			bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.MIDDLE,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,{});
			s_mainLoop.windowController.mouseUp(bgEvt);
		}
		if (s_mouseStatus.rightButton) {
			bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.RIGHT,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,{});
			s_mainLoop.windowController.mouseUp(bgEvt);
			s_mouseStatus.rightButton = false;
		}
		return bgEvt;
	}
	
	function onMouseOver(event) {
		return onMouseMove(event);
	}
	
	function onMouseUp(event) {
		switch (event.button) {
			case bg.app.MouseButton.LEFT:
				s_mouseStatus.leftButton = false;
				break;
			case bg.app.MouseButton.MIDDLE:
				s_mouseStatus.middleButton = false;
				break;
			case bg.app.MouseButton.RIGHT:
				s_mouseStatus.rightButton = false;
				break;
		}
		let offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
		let multisample = s_mainLoop.canvas.multisample;
		s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
		s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
		let bgEvt = new bg.app.MouseEvent(event.button,s_mouseStatus.pos.x,s_mouseStatus.pos.y,0,event)
		s_mainLoop.windowController.mouseUp(bgEvt);
		return bgEvt;
	}
	
	function onMouseWheel(event) {
		let offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
		let multisample = s_mainLoop.canvas.multisample;
		s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
		s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
		let delta = event.wheelDelta ? event.wheelDelta * -1:event.detail * 10;
		let bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.NONE,s_mouseStatus.pos.x,s_mouseStatus.pos.y,delta,event)
		s_mainLoop.windowController.mouseWheel(bgEvt);
		return bgEvt;
	}
	
    function getTouchEvent(event) {
        let offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
        let touches = [];
        for (let i=0; i<event.touches.length; ++i) {
            let touch = event.touches[i];
            touches.push({
                identifier: touch.identifier,
                x: touch.clientX - offset.left,
                y: touch.clientY - offset.top,
                force: touch.force,
                rotationAngle: touch.rotationAngle,
                radiusX: touch.radiusX,
                radiusY: touch.radiusY
            });
        }
        return new bg.app.TouchEvent(touches,event);
    }
    
	function onTouchStart(event) {
		let bgEvt = getTouchEvent(event)
        s_mainLoop.windowController.touchStart(bgEvt);
		return bgEvt;
	}
	
	function onTouchMove(event) {
		let bgEvt = getTouchEvent(event)
		s_mainLoop.windowController.touchMove(bgEvt);
		return bgEvt;
	}
	
	function onTouchEnd(event) {
		let bgEvt = getTouchEvent(event)
		s_mainLoop.windowController.touchEnd(bgEvt);
		return bgEvt;
	}
	
	function onKeyDown(event) {
		let code = bg.app.KeyboardEvent.IsSpecialKey(event) ? 	event.keyCode:
																event.code;
		s_mainLoop.windowController.keyDown(new bg.app.KeyboardEvent(code,event));
	}
	
	function onKeyUp(event) {
		let code = bg.app.KeyboardEvent.IsSpecialKey(event) ? 	event.keyCode:
																event.code;
		s_mainLoop.windowController.keyUp(new bg.app.KeyboardEvent(code,event));
	}
	
	bg.app.MainLoop = {};
	
	Object.defineProperty(bg.app.MainLoop,"singleton",{
		get: function() {
			if (!s_mainLoop) {
				s_mainLoop = new MainLoop();
			}
			return s_mainLoop;
		}
	});

})();
