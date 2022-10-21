(function() {
	bg.app.SpecialKey = {
		BACKSPACE: "Backspace",
		TAB: "Tab",
		ENTER: "Enter",
		SHIFT: "Shift",
		SHIFT_LEFT: "ShiftLeft",
		SHIFT_RIGHT: "ShiftRight",
		CTRL: "Control",
		CTRL_LEFT: "ControlLeft",
		CTRL_LEFT: "ControlRight",
		ALT: "Alt",
		ALT_LEFT: "AltLeft",
		ALT_RIGHT: "AltRight",
		PAUSE: "Pause",
		CAPS_LOCK: "CapsLock",
		ESCAPE: "Escape",
		PAGE_UP: "PageUp",
		PAGEDOWN: "PageDown",
		END: "End",
		HOME: "Home",
		LEFT_ARROW: "ArrowLeft",
		UP_ARROW: "ArrowUp",
		RIGHT_ARROW: "ArrowRight",
		DOWN_ARROW: "ArrowDown",
		INSERT: "Insert",
		DELETE: "Delete"
	};
	
	class EventBase {
		constructor() {
			this._executeDefault = false;
		}

		get executeDefault() { return this._executeDefault; }
		set executeDefault(d) { this._executeDefault = d; }
	}
	bg.app.EventBase = EventBase;

	class KeyboardEvent extends EventBase {
		static IsSpecialKey(event) {
			return bg.app.SpecialKey[event.code]!=null;
		}
		
		constructor(key,event) {
			super();
			this.key = key;
			this.event = event;
		}
		
		isSpecialKey() {
			return KeyboardEvent.IsSpecialKey(this.event);
		}
	}
	
	bg.app.KeyboardEvent = KeyboardEvent;
	
	bg.app.MouseButton = {
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2,
		NONE: -1
	};
	
	class MouseEvent extends EventBase {
		
		constructor(button = bg.app.MouseButton.NONE, x=-1, y=-1, delta=0,event=null) {
			super();

			this.button = button;
			this.x = x;
			this.y = y;
			this.delta = delta;
			this.event = event;
		}
	}
	
	bg.app.MouseEvent = MouseEvent;
	
	class TouchEvent extends EventBase  {
		constructor(touches,event) {
			super();
			this.touches = touches;
			this.event = event;
		}
	}
	
	bg.app.TouchEvent = TouchEvent;
	
})();