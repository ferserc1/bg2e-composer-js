(function() {
	let s_preventImageDump = [];
	let s_preventVideoDump = [];

	class ResourceProvider {
		constructor() {
			this._disableCache = false;
		}

		get disableCache() { return this._disableCache; }
		set disableCache(e) { this._disableCache = e; }

		getRequest(url,onSuccess,onFail,onProgress) {}
		loadImage(url,onSucces,onFail) {}
		loadVideo(url,onSuccess,onFail) {}
	}

	let g_videoLoaders = {};
	g_videoLoaders["mp4"] = function(url,onSuccess,onFail) {
		var video = document.createElement('video');
		s_preventVideoDump.push(video);
		video.crossOrigin = "";
		video.autoplay = true;
		video.setAttribute("playsinline",null);
		video.addEventListener('canplay',(evt) => {
			let videoIndex = s_preventVideoDump.indexOf(evt.target);
			if (videoIndex!=-1) {
				s_preventVideoDump.splice(videoIndex,1);
			}
			onSuccess(event.target);
		});
		video.addEventListener("error",(evt) => {
			onFail(new Error(`Error loading video: ${url}`));
		});
		video.addEventListener("abort",(evt) => {
			onFail(new Error(`Error loading video: ${url}`));
		});
		video.src = url;
	}
	g_videoLoaders["m4v"] = g_videoLoaders["mp4"];

	class HTTPResourceProvider extends ResourceProvider {
		constructor() {
			super();
		}

		static AddVideoLoader(type,callback) {
			g_videoLoaders[type] = callback;
		}

		static GetVideoLoaderForType(type) {
			return g_videoLoaders[type];
		}

		static GetCompatibleVideoFormats() {
			return Object.keys(g_videoLoaders);
		}

		static IsVideoCompatible(videoUrl) {
			let ext = Resource.GetExtension(videoUrl);
			return bg.utils.HTTPResourceProvider.GetCompatibleVideoFormats().indexOf(ext)!=-1;
		}

		getRequest(url,onSuccess,onFail,onProgress) {
			var req = new XMLHttpRequest();
			if (!onProgress) {
				onProgress = function(progress) {
					console.log(`Loading ${ progress.file }: ${ progress.loaded / progress.total * 100 } %`);
				}
			}
			req.open("GET",url,true);
			req.addEventListener("load", function() {
				if (req.status===200) {
					onSuccess(req);
				}
				else {
					onFail(new Error(`Error receiving data: ${req.status}, url: ${url}`));
				}
			}, false);
			req.addEventListener("error", function() {
				onFail(new Error(`Cannot make AJAX request. Url: ${url}`));
			}, false);
			req.addEventListener("progress", function(evt) {
				onProgress({ file:url, loaded:evt.loaded, total:evt.total });
			}, false);
			return req;
		}

		loadImage(url,onSuccess,onFail) {
			var img = new Image();
			s_preventImageDump.push(img);
			img.crossOrigin = "";
			img.addEventListener("load",function(event) {
				let imageIndex = s_preventImageDump.indexOf(event.target);
				if (imageIndex!=-1) {
					s_preventImageDump.splice(imageIndex,1);
				}
				onSuccess(event.target);
			});
			img.addEventListener("error",function(event) {
				onFail(new Error(`Error loading image: ${url}`));
			});
			img.addEventListener("abort",function(event) {
				onFail(new Error(`Image load aborted: ${url}`));
			});

			if (this.disableCache) {
				url += '?' + bg.utils.generateUUID();
			}
			img.src = url;
		}

		loadVideo(url,onSuccess,onFail) {
			let ext = Resource.GetExtension(url);
			let loader = bg.utils.HTTPResourceProvider.GetVideoLoaderForType(ext);
			if (loader) {
				loader.apply(this,[url,onSuccess,onFail]);
			}
			else {
				onFail(new Error(`Could not find video loader for resource: ${ url }`));
			}
		}
	}

	bg.utils.ResourceProvider = ResourceProvider;
	bg.utils.HTTPResourceProvider = HTTPResourceProvider;
	
	let g_resourceProvider = new HTTPResourceProvider();

	class Resource {
		static SetResourceProvider(provider) {
			g_resourceProvider = provider;
		}

		static GetResourceProvider() {
			return g_resourceProvider;
		}

		static GetExtension(url) {
			let match = /\.([a-z0-9-_]*)(\?.*)?(\#.*)?$/i.exec(url);
			return (match && match[1].toLowerCase()) || "";
		}
		
		static JoinUrl(url,path) {
			if (url.length==0) return path;
			if (path.length==0) return url;
			return /\/$/.test(url) ? url + path : url + "/" + path;
		}
		
		static IsFormat(url,formats) {
			return formats.find(function(fmt) {
					return fmt==this;
				},Resource.GetExtension(url))!=null;
		}
		
		static IsImage(url) {
			return Resource.IsFormat(url,["jpg","jpeg","gif","png"]);
		}
		
		static IsBinary(url,binaryFormats = ["vwglb","bg2"]) {
			return Resource.IsFormat(url,binaryFormats);
		}

		static IsVideo(url,videoFormats = ["mp4","m4v","ogg","ogv","m3u8","webm"]) {
			return Resource.IsFormat(url,videoFormats);
		}
		
		static LoadMultiple(urlArray,onProgress) {
			let progressFiles = {}

			let progressFunc = function(progress) {
				progressFiles[progress.file] = progress;
				let total = 0;
				let loaded = 0;
				for (let key in progressFiles) {
					let file = progressFiles[key];
					total += file.total;
					loaded += file.loaded;
				}
				if (onProgress) {
					onProgress({ fileList:urlArray, total:total, loaded:loaded });
				}
				else {
					console.log(`Loading ${ Object.keys(progressFiles).length } files: ${ loaded / total * 100}% completed`);
				}
			}

			let resources = [];
			urlArray.forEach(function(url) {
				resources.push(Resource.Load(url,progressFunc));
			});

			let resolvingPromises = resources.map(function(promise) {
				return new Promise(function(resolve) {
					let payload = new Array(2);
					promise.then(function(result) {
						payload[0] = result;
					})
					.catch(function(error) {
						payload[1] = error;
					})
					.then(function() {
						resolve(payload);
					});
				});
			});

			let errors = [];
			let results = [];

			return Promise.all(resolvingPromises)
				.then(function(loadedData) {
					let result = {};
					urlArray.forEach(function(url,index) {
						let pl = loadedData[index];
						result[url] = pl[1] ? null : pl[0];
					});
					return result;
				});
		}
		
		static Load(url,onProgress) {
			let loader = null;
			switch (true) {
				case url.constructor===Array:
					loader = Resource.LoadMultiple;
					break;
				case Resource.IsImage(url):
					loader = Resource.LoadImage;
					break;
				case Resource.IsBinary(url):
					loader = Resource.LoadBinary;
					break;
				case Resource.IsVideo(url):
					loader = Resource.LoadVideo;
					break;
				case Resource.GetExtension(url)=='json':
					loader = Resource.LoadJson;
					break;
				default:
					loader = Resource.LoadText;
			}
			return loader(url,onProgress);
		}
		
		static LoadText(url,onProgress) {
			return new Promise(function(resolve,reject) {
				g_resourceProvider.getRequest(url,
					function(req) {
						resolve(req.responseText);
					},
					function(error) {
						reject(error);
					},onProgress).send();
			});
		}

		static LoadVideo(url,onProgress) {
			return new Promise(function(resolve,reject) {
				g_resourceProvider.loadVideo(
					url,
					(target) => {
						resolve(target);
						bg.emitImageLoadEvent(target);
					},
					(err) => {
						reject(err);
					}
				);
			});
		}
		
		static LoadBinary(url,onProgress) {
			return new Promise(function(resolve,reject) {
				var req = g_resourceProvider.getRequest(url,
						function(req) {
							resolve(req.response);
						},
						function(error) {
							reject(error);
						},onProgress);
				req.responseType = "arraybuffer";
				req.send();
			});
		}
		
		static LoadImage(url) {
			return new Promise(function(resolve,reject) {
				g_resourceProvider.loadImage(
					url,
					(target) => {
						resolve(target);
						bg.emitImageLoadEvent(target);
					},
					(err) => {
						reject(err);
					}
				);
			});
		}
		
		static LoadJson(url) {
			return new Promise(function(resolve,reject) {
				g_resourceProvider.getRequest(url,
					function(req) {
						try {
							resolve(JSON.parse(req.responseText));
						}
						catch(e) {
							reject(new Error("Error parsing JSON data"));
						}
					},
					function(error) {
						reject(error);
					}).send();
			});
		}
	}
	
	bg.utils.Resource = Resource;

	bg.utils.requireGlobal = function(src) {
		let s = document.createElement('script');
		s.src = src;
		s.type = "text/javascript";
		s.async = false;
		document.getElementsByTagName('head')[0].appendChild(s);
	}

})();