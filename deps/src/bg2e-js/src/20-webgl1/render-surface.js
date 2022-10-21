(function() {
	
	let ext = null;
	
	function getMaxColorAttachments() {
		if (ext.drawBuffers) {
			return	ext.drawBuffers.MAX_COLOR_ATTACHMENTS ||
					ext.drawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL;
		}
		return 1;
	}
	
	// type: RGBA, format: UNSIGNED_BYTE => regular RGBA texture
	// type: RGBA, format: FLOAT => float texture attachment
	// type: DEPTH, format: RENDERBUFFER => regular depth renderbuffer
	// type: DEPTH, format: UNSIGNED_SHORT => depth texture
	// every one else: error, unsupported combination
	function checkValid(attachment) {
		switch (true) {
			case attachment.type==bg.base.RenderSurfaceType.RGBA && attachment.format==bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
				return true;
			case attachment.type==bg.base.RenderSurfaceType.RGBA && attachment.format==bg.base.RenderSurfaceFormat.FLOAT:
				return true;
			case attachment.type==bg.base.RenderSurfaceType.DEPTH && attachment.format==bg.base.RenderSurfaceFormat.RENDERBUFFER:
				return true;
			case attachment.type==bg.base.RenderSurfaceType.DEPTH && attachment.format==bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
				return true;
			// TODO: Cubemaps
			default:
				return false;
		}
	}
	
	function getTypeString(type) {
		switch (type) {
			case bg.base.RenderSurfaceType.RGBA:
				return "RGBA";
			case bg.base.RenderSurfaceType.DEPTH:
				return "DEPTH";
			default:
				return "unknown";
		}
	}
	
	function getFormatString(format) {
		switch (format) {
			case bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
				return "UNSIGNED_BYTE";
			case bg.base.RenderSurfaceFormat.FLOAT:
				return "FLOAT";
			case bg.base.RenderSurfaceFormat.RENDERBUFFER:
				return "RENDERBUFFER";
			case bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
				return "UNSIGNED_SHORT";
			default:
				return "unknown";
		}
	}
	
	function checkCompatibility(attachments) {
		let colorAttachments = 0;
		let maxColorAttachments = getMaxColorAttachments();
		let error = null;
		
		attachments.every(function(att,index) {
			if (!checkValid(att)) {
				error = `Error in attachment ${index}: Invalid combination of type and format (${getTypeString(att.type)} is incompatible with ${getFormatString(att.format)}).`;
				return false;
			}
			
			if (att.type==bg.base.RenderSurfaceType.DEPTH &&
				index!=attachments.length-1
			) {
				error = `Error in attachment ${index}: Depth attachment must be specified as the last attachment. Specified at index ${index} of ${attachments.length - 1}`;
				return false;
			}
			
			if (att.type==bg.base.RenderSurfaceType.RGBA) {
				++colorAttachments;
			}
			
			if (att.format==bg.base.RenderSurfaceFormat.FLOAT && !ext.textureFloat) {
				error = `Error in attachment ${index}: Floating point render surface requested, but the required extension is not present: OES_texture_float.`;
				return false;
			}
			if (att.type==bg.base.RenderSurfaceType.DEPTH &&
				att.format!=bg.base.RenderSurfaceFormat.RENDERBUFFER &&
				!ext.depthTexture
			) {
				error = `Error in attachment ${index}: Depth texture attachment requested, but the requiered extension is not present: WEBGL_depth_texture.`;
				return false;
			}
			if (colorAttachments>maxColorAttachments) {
				error = `Error in attachment ${index}: Maximum number of ${maxColorAttachments} color attachment exceeded.`;
				return false;
			}
			
			return true;
		});
		
		return error;
	}
	
	function addAttachment(gl,size,attachment,index) {
		if (attachment.format==bg.base.RenderSurfaceFormat.RENDERBUFFER) {
			let renderbuffer = gl.createRenderbuffer();
			
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size.width,size.height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER,null);
			
			return { _renderbuffer: renderbuffer };
		}
		else {
			let texture = new bg.base.Texture(gl);
			let format = attachment.format;
			let type = attachment.type;
			
			texture.create();
			texture.bind();
			texture.minFilter = bg.base.TextureFilter.LINEAR;
			texture.magFilter = bg.base.TextureFilter.LINEAR;
			texture.wrapX = bg.base.TextureWrap.CLAMP;
			texture.wrapY = bg.base.TextureWrap.CLAMP;
			texture.setImageRaw(size.width,size.height,null,type,format);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture._texture, 0);
			texture.unbind();

			return texture;		
		}
	}
	
	function resizeAttachment(gl,size,att,index) {
		if (att.texture) {
			att.texture.bind();
			att.texture.setImageRaw(size.width,size.height,null,att.type,att.format);
			att.texture.unbind();
		}
		if (att.renderbuffer) {
			let rb = att.renderbuffer._renderbuffer;
			gl.bindRenderbuffer(gl.RENDERBUFFER,rb);
			gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16, size.width, size.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER,null);
		}
	}
	
	
	class WebGLRenderSurfaceImpl extends bg.base.RenderSurfaceBufferImpl {
		initFlags(gl) {
			bg.base.RenderSurfaceType.RGBA = gl.RGBA;
			bg.base.RenderSurfaceType.DEPTH = gl.DEPTH_COMPONENT;
			
			bg.base.RenderSurfaceFormat.UNSIGNED_BYTE = gl.UNSIGNED_BYTE;
			bg.base.RenderSurfaceFormat.UNSIGNED_SHORT = gl.UNSIGNED_SHORT;
			bg.base.RenderSurfaceFormat.FLOAT = gl.FLOAT;
			// This is not a format. This will create a renderbuffer instead a texture
			bg.base.RenderSurfaceFormat.RENDERBUFFER = gl.RENDERBUFFER;
			
			ext = bg.webgl1.Extensions.Get();
		}
		
		supportType(type) {
			switch (type) {
				case bg.base.RenderSurfaceType.RGBA:
					return true;
				case bg.base.RenderSurfaceType.DEPTH:
					return ext.depthTexture!=null;
				default:
					return false;
			}
		}
		
		supportFormat(format) {
			switch (format) {
				case bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
				case bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
					return true;
				case bg.base.RenderSurfaceFormat.FLOAT:
					return ext.textureFloat!=null;
				default:
					return false;
			}
		}
		
		get maxColorAttachments() {
			return getMaxColorAttachments();
		}
	}
	
	class ColorRenderSurfaceImpl extends WebGLRenderSurfaceImpl {
		create(gl) {
			return {};
		}
		setActive(gl,renderSurface,attachments) {
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		}
		resize(gl,renderSurface,size) {}
		destroy(gl,renderSurface) {}

		readBuffer(gl,renderSurface,rectangle,viewportSize) {
			let pixels = new Uint8Array(rectangle.width * rectangle.height * 4);
			// Note that the webgl texture is flipped vertically, so we need to convert the Y coord
			gl.readPixels(rectangle.x, rectangle.y, rectangle.width, rectangle.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			return pixels;
		}
	}
	
	bg.webgl1.ColorRenderSurfaceImpl = ColorRenderSurfaceImpl;
	
	class TextureRenderSurfaceImpl extends WebGLRenderSurfaceImpl {
		initFlags(gl) {}	// Flags initialized in ColorRenderSurfaceImpl
				
		create(gl,attachments) {
			// If this function returns no error, the browser is compatible with
			// the specified attachments.
			let error = checkCompatibility(attachments);
			if (error) {
				throw new Error(error);
			}
			// Initial size of 256. The actual size will be defined in resize() function
			let size = new bg.Vector2(256);
			let surfaceData = {
				fbo: gl.createFramebuffer(),
				size: size,
				attachments: []
			};
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, surfaceData.fbo);
			
			let colorAttachments = [];
			attachments.forEach((att,i) => {
				// This will return a bg.base.Texture or a renderbuffer
				let result = addAttachment(gl,size,att,i);
				if (result instanceof bg.base.Texture) {
					colorAttachments.push(ext.drawBuffers ? ext.drawBuffers.COLOR_ATTACHMENT0_WEBGL + i : gl.COLOR_ATTACHMENT0);
				}
				surfaceData.attachments.push({
					texture: result instanceof bg.base.Texture ? result:null,
					renderbuffer: result instanceof bg.base.Texture ? null:result,
					format:att.format,
					type:att.type
				});
			});
			if (colorAttachments.length>1) {
				ext.drawBuffers.drawBuffersWEBGL(colorAttachments);
			}
			
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
			return surfaceData;
		}
		
		setActive(gl,renderSurface) {
			gl.bindFramebuffer(gl.FRAMEBUFFER,renderSurface.fbo);
		}
		
		readBuffer(gl,renderSurface,rectangle,viewportSize) {
			let pixels = new Uint8Array(rectangle.width * rectangle.height * 4);
			// Note that the webgl texture is flipped vertically, so we need to convert the Y coord
			gl.readPixels(rectangle.x, viewportSize.height - rectangle.y, rectangle.width, rectangle.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			return pixels;
		}
		
		resize(gl,renderSurface,size) {
			renderSurface.size.width = size.width;
			renderSurface.size.height = size.height;
			renderSurface.attachments.forEach((att,index) => {
				resizeAttachment(gl,size,att,index);
			});
		}
		
		destroy(gl,renderSurface) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			let attachments = renderSurface && renderSurface.attachments;
			if (renderSurface.fbo) {
				gl.deleteFramebuffer(renderSurface.fbo);
			}
			if (attachments) {
				attachments.forEach((attachment) => {
					if (attachment.texture) {
						attachment.texture.destroy();
					}
					else if (attachment.renderbuffer) {
						gl.deleteRenderbuffer(attachment.renderbuffer._renderbuffer);
					}
				});
			}
			renderSurface.fbo = null;
			renderSurface.size = null;
			renderSurface.attachments = null;
		}
	}
	
	bg.webgl1.TextureRenderSurfaceImpl = TextureRenderSurfaceImpl;
})();