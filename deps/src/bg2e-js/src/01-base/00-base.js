bg.base = {}

bg.s_log = [];
bg.log = function(l) {
	if (console.log) console.log(l);
	bg.s_log.push(l);
};

bg.flushLog = function() {
	if (console.log) {
		bg.s_log.forEach(function(l) {
			console.log(l);
		});
	}
	bg.s_log = [];
};

bg.emitImageLoadEvent = function(img) {
	let event = new CustomEvent("bg2e:image-load", { image:img });
	document.dispatchEvent(event);
};

bg.bindImageLoadEvent = function(callback) {
	document.addEventListener("bg2e:image-load",callback);
};

bg.Axis = {
	NONE: 0,
	X: 1,
	Y: 2,
	Z: 3
};

Object.defineProperty(bg, "isElectronApp", {
	get: function() {
		try {
			return process && process.versions && process.versions["electron"] !== 'undefined';
		}
		catch(e) {
			return false;
		}
	}
});

