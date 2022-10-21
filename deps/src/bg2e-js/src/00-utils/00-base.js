
const bg = {};
bg.version = "@version@";
bg.utils = {};

// Export for webpack and similar utilities
try {
	module.exports = bg;
} catch(e) {}

Reflect.defineProperty = Reflect.defineProperty || Object.defineProperty;

(function(win) {
	win.requestAnimFrame = (function() {
	return	window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback,element) { window.setTimeout(callback,1000/60); };
	})();

	bg.utils.initWebGLContext = function(canvas) {
			let context = {
				gl:null,
				supported:false,
				experimental:false
			}
			try {
				context.gl = canvas.getContext("webgl",{ preserveDrawingBuffer:true });
				context.supported = context.gl!=null;
			}
			catch (e) {
				context.supported = false;
			}
			
			if (!context.supported) {
				try {
					context.gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true });
					context.supported = context.gl!=null;
					context.experimental = true;
				}
				catch(e) {
				}
			}
			
			if (context) {
				context.gl.uuid = Symbol(context.gl);
			}
			return context;
		};

	bg.utils.isBigEndian = function() {
			let arr32 = new Uint32Array(1);
			var arr8 = new Uint8Array(arr32.buffer);
			arr32[0] = 255;
			return arr32[3]==255;
		};
	
	bg.utils.isLittleEndian = function() {
			let arr32 = new Uint32Array(1);
			var arr8 = new Uint8Array(arr32.buffer);
			arr32[0] = 255;
			return arr32[0]==255;
		};
	
	class UserAgent {
	
		constructor(userAgentString) {
			this.system = {};
			this.browser = {};
			
			if (!userAgentString) {
				userAgentString = navigator.userAgent;
			}
			this.parseOperatingSystem(userAgentString);
			this.parseBrowser(userAgentString);
		}

		parseOperatingSystem(userAgentString) {
			this.system.OSX = /Macintosh/.test(userAgentString);
			this.system.Windows = /Windows/.test(userAgentString);
			this.system.iPhone = /iPhone/.test(userAgentString);
			this.system.iPodTouch = /iPod/.test(userAgentString);
			this.system.iPad = /iPad/.test(userAgentString);
			this.system.iOS = this.system.iPhone || this.system.iPad || this.system.iPodTouch;
			this.system.Android = /Android/.test(userAgentString);
			this.system.Linux = (this.system.Android) ? false:/Linux/.test(userAgentString);

			if (this.system.OSX) {
				this.system.OSName = "OS X";
				this.parseOSXVersion(userAgentString);
			}
			else if (this.system.Windows) {
				this.system.OSName = "Windows";
				this.parseWindowsVersion(userAgentString);
			}
			else if (this.system.Linux) {
				this.system.OSName = "Linux";
				this.parseLinuxVersion(userAgentString);
			}
			else if (this.system.iOS) {
				this.system.OSName = "iOS";
				this.parseIOSVersion(userAgentString);
			}
			else if (this.system.Android) {
				this.system.OSName = "Android";
				this.parseAndroidVersion(userAgentString);
			}
		}

		parseBrowser(userAgentString) {
			// Safari: Version/X.X.X Safari/XXX
			// Chrome: Chrome/XX.X.XX.XX Safari/XXX
			// Opera: Opera/X.XX
			// Firefox: Gecko/XXXXXX Firefox/XX.XX.XX
			// Explorer: MSIE X.X
			this.browser.Version = {};
			this.browser.Safari = /Version\/([\d\.]+) Safari\//.test(userAgentString);
			if (this.browser.Safari) {
				this.browser.Name = "Safari";
				this.browser.Vendor = "Apple";
				this.browser.Version.versionString = RegExp.$1;
			}

			this.browser.Chrome = /Chrome\/([\d\.]+) Safari\//.test(userAgentString);
			if (this.browser.Chrome) {
				this.browser.Name = "Chrome";
				this.browser.Vendor = "Google";
				this.browser.Version.versionString = RegExp.$1;
			}

			this.browser.Opera = /Opera\/[\d\.]+/.test(userAgentString);
			if (this.browser.Opera) {
				this.browser.Name = "Opera";
				this.browser.Vendor = "Opera Software";
				var versionString = /Version\/([\d\.]+)/.test(userAgentString);
				this.browser.Version.versionString = RegExp.$1;
			}

			this.browser.Firefox = /Gecko\/[\d\.]+ Firefox\/([\d\.]+)/.test(userAgentString);
			if (this.browser.Firefox) {
				this.browser.Name = "Firefox";
				this.browser.Vendor = "Mozilla Foundation";
				this.browser.Version.versionString = RegExp.$1;
			}

			this.browser.Edge = /Edge\/(.*)/.test(userAgentString);
			if (this.browser.Edge) {
				var result = /Edge\/(.*)/.exec(userAgentString);
				this.browser.Name = "Edge";
				this.browser.Chrome = false;
				this.browser.Vendor = "Microsoft";
				this.browser.Version.versionString = result[1];
			} 

			this.browser.Explorer = /MSIE ([\d\.]+)/.test(userAgentString);
			if (!this.browser.Explorer) {
				var re = /\Mozilla\/5.0 \(([^)]+)\) like Gecko/
				var matches = re.exec(userAgentString);
				if (matches) {
					re = /rv:(.*)/
					var version = re.exec(matches[1]);
					this.browser.Explorer = true;
					this.browser.Name = "Internet Explorer";
					this.browser.Vendor = "Microsoft";
					if (version) {
						this.browser.Version.versionString = version[1];
					}
					else {
						this.browser.Version.versionString = "unknown";
					}
				}
			}
			else {
				this.browser.Name = "Internet Explorer";
				this.browser.Vendor = "Microsoft";
				this.browser.Version.versionString = RegExp.$1;
			}

			if (this.system.iOS) {
				this.browser.IsMobileVersion = true;
				this.browser.MobileSafari = /Version\/([\d\.]+) Mobile/.test(userAgentString);
				if (this.browser.MobileSafari) {
					this.browser.Name = "Mobile Safari";
					this.browser.Vendor = "Apple";
					this.browser.Version.versionString = RegExp.$1;
				}
				this.browser.Android = false;
			}
			else if (this.system.Android) {
				this.browser.IsMobileVersion = true;
				this.browser.Android = /Version\/([\d\.]+) Mobile/.test(userAgentString);
				if (this.browser.MobileSafari) {
					this.browser.Name = "Android Browser";
					this.browser.Vendor = "Google";
					this.browser.Version.versionString = RegExp.$1;
				}
				else {
					this.browser.Chrome = /Chrome\/([\d\.]+)/.test(userAgentString);
					this.browser.Name = "Chrome";
					this.browser.Vendor = "Google";
					this.browser.Version.versionString = RegExp.$1;
				}

				this.browser.Safari = false;
			}
			else {
				this.browser.IsMobileVersion = false;
			}

			this.parseBrowserVersion(userAgentString);
		}

		parseBrowserVersion(userAgentString) {
			if (/([\d]+)\.([\d]+)\.*([\d]*)/.test(this.browser.Version.versionString)) {
				this.browser.Version.major = Number(RegExp.$1);
				this.browser.Version.minor = Number(RegExp.$2);
				this.browser.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
			}
		}

		parseOSXVersion(userAgentString) {
			var versionString = (/Mac OS X (\d+_\d+_*\d*)/.test(userAgentString)) ? RegExp.$1:'';
			this.system.Version = {};
			// Safari/Chrome
			if (versionString!='') {
				if (/(\d+)_(\d+)_*(\d*)/.test(versionString)) {
					this.system.Version.major = Number(RegExp.$1);
					this.system.Version.minor = Number(RegExp.$2);
					this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
				}
			}
			// Firefox/Opera
			else {
				versionString = (/Mac OS X (\d+\.\d+\.*\d*)/.test(userAgentString)) ? RegExp.$1:'Unknown';
				if (/(\d+)\.(\d+)\.*(\d*)/.test(versionString)) {
					this.system.Version.major = Number(RegExp.$1);
					this.system.Version.minor = Number(RegExp.$2);
					this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
				}
			}
			if (!this.system.Version.major) {
				this.system.Version.major = 0;
				this.system.Version.minor = 0;
				this.system.Version.revision = 0;
			}
			this.system.Version.stringValue = this.system.Version.major + '.' + this.system.Version.minor + '.' + this.system.Version.revision;
			switch (this.system.Version.minor) {
				case 0:
					this.system.Version.name = "Cheetah";
					break;
				case 1:
					this.system.Version.name = "Puma";
					break;
				case 2:
					this.system.Version.name = "Jaguar";
					break;
				case 3:
					this.system.Version.name = "Panther";
					break;
				case 4:
					this.system.Version.name = "Tiger";
					break;
				case 5:
					this.system.Version.name = "Leopard";
					break;
				case 6:
					this.system.Version.name = "Snow Leopard";
					break;
				case 7:
					this.system.Version.name = "Lion";
					break;
				case 8:
					this.system.Version.name = "Mountain Lion";
					break;
			}
		}

		parseWindowsVersion(userAgentString) {
			this.system.Version = {};
			if (/NT (\d+)\.(\d*)/.test(userAgentString)) {
				this.system.Version.major = Number(RegExp.$1);
				this.system.Version.minor = Number(RegExp.$2);
				this.system.Version.revision = 0;	// Solo por compatibilidad
				this.system.Version.stringValue = "NT " + this.system.Version.major + "." + this.system.Version.minor;
				var major = this.system.Version.major;
				var minor = this.system.Version.minor;
				var name = 'undefined';
				if (major==5) {
					if (minor==0) this.system.Version.name = '2000';
					else this.system.Version.name = 'XP';
				}
				else if (major==6) {
					if (minor==0) this.system.Version.name = 'Vista';
					else if (minor==1) this.system.Version.name = '7';
					else if (minor==2) this.system.Version.name = '8';
				}
			}
			else {
				this.system.Version.major = 0;
				this.system.Version.minor = 0;
				this.system.Version.name = "Unknown";
				this.system.Version.stringValue = "Unknown";
			}
		}

		parseLinuxVersion(userAgentString) {
			this.system.Version = {};
			this.system.Version.major = 0;
			this.system.Version.minor = 0;
			this.system.Version.revision = 0;
			this.system.Version.name = "";
			this.system.Version.stringValue = "Unknown distribution";
		}

		parseIOSVersion(userAgentString) {
			this.system.Version = {};
			if (/iPhone OS (\d+)_(\d+)_*(\d*)/i.test(userAgentString)) {
				this.system.Version.major = Number(RegExp.$1);
				this.system.Version.minor = Number(RegExp.$2);
				this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
				this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
				this.system.Version.name = "iOS";
			}
			else {
				this.system.Version.major = 0;
				this.system.Version.minor = 0;
				this.system.Version.name = "Unknown";
				this.system.Version.stringValue = "Unknown";
			}
		}

		parseAndroidVersion(userAgentString) {
			this.system.Version = {};
			if (/Android (\d+)\.(\d+)\.*(\d*)/.test(userAgentString)) {
				this.system.Version.major = Number(RegExp.$1);
				this.system.Version.minor = Number(RegExp.$2);
				this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3):0;
				this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
			}
			else {
				this.system.Version.major = 0;
				this.system.Version.minor = 0;
				this.system.Version.revision = 0;
			}
			if (/Build\/([a-zA-Z]+)/.test(userAgentString)) {
				this.system.Version.name = RegExp.$1;
			}
			else {
				this.system.Version.name = "Unknown version";
			}
			this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
		}

		getInfoString() {
			return navigator.userAgent;
		}
	}
	
	bg.utils.UserAgent = UserAgent;
	bg.utils.userAgent = new UserAgent();

	class Path {
		get sep() { return "/"; }

		join(a,b) {
			if (a.lastIndexOf(this.sep)!=a.length-1) {
				return a + this.sep + b;
			}
			else {
				return a + b;
			}
		}

		extension(path) {
			return path.split(".").pop();
		}

		fileName(path) {
			return path.split(this.sep).pop();
		}

		removeFileName(path) {
			let result = path.split(this.sep);
			result.pop();
			return result.join(this.sep);
		}
	}

	bg.utils.Path = Path;
	bg.utils.path = new Path();
})(window);
