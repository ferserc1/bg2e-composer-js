(function() {

    let s_captureViews = [
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3( 1, 0, 0), new bg.Vector3(0,-1, 0)),
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3(-1, 0, 0), new bg.Vector3(0,-1, 0)),
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3( 0, 1, 0), new bg.Vector3(0, 0, 1)),
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3( 0,-1, 0), new bg.Vector3(0, 0,-1)),
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3( 0, 0, 1), new bg.Vector3(0,-1, 0)),
        bg.Matrix4.LookAt(new bg.Vector3(0,0,0), new bg.Vector3( 0, 0,-1), new bg.Vector3(0,-1, 0))
    ];

    let s_captureProjection = bg.Matrix4.Perspective(90,1,0.1,1000.0);

    class CubemapCaptureImpl extends bg.base.CubemapCaptureImpl {
        createCaptureBuffers(gl,size) {
            let captureBuffers = {
                fbo: gl.createFramebuffer(),
                rbo: gl.createRenderbuffer(),
                texture: null,
                size:size
            };

            gl.bindFramebuffer(gl.FRAMEBUFFER, captureBuffers.fbo);
            gl.bindRenderbuffer(gl.RENDERBUFFER, captureBuffers.rbo);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, captureBuffers.rbo);

            captureBuffers.texture = new bg.base.Texture(gl);
            captureBuffers.texture.target = bg.base.TextureTarget.CUBE_MAP;
            captureBuffers.texture.create();
            captureBuffers.texture.bind();
            for (let i=0; i<6; ++i) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
            }
            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
            captureBuffers.texture.unbind();
            captureBuffers.texture._size = new bg.Vector2(size);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            
            return captureBuffers;
		}

		beginRender(gl,captureBuffers) {
            captureBuffers._currentViewport = bg.base.Pipeline.Current() ? bg.base.Pipeline.Current().viewport : new bg.Viewport(0,0,512,512);
            //gl.viewport(0,0,captureBuffers.size,captureBuffers.size);
            gl.bindFramebuffer(gl.FRAMEBUFFER,captureBuffers.fbo);
        }
        
        beginRenderFace(gl,face,captureBuffers,viewMatrix) {
            let textureImpl = captureBuffers.texture.texture;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, textureImpl, 0);

            // TODO: Debug framebuffer
            gl.clearColor(0,0,0,1);
            gl.viewport(0,0,captureBuffers.size,captureBuffers.size);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.CULL_FACE);

            let captureView = new bg.Matrix4(s_captureViews[face]);
            captureView.mult(viewMatrix);

            return {
                view:captureView,
                projection: s_captureProjection
            };
        }

        endRenderFace(context,face,captureBuffers) {
        }

		endRender(gl,captureBuffers) {
            gl.viewport(
                captureBuffers._currentViewport.x,
                captureBuffers._currentViewport.y,
                captureBuffers._currentViewport.width,
                captureBuffers._currentViewport.height
            );
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.enable(gl.CULL_FACE);
		}

        getTexture(context,captureBuffers) {
            return captureBuffers.texture;
        }
        
        destroy(context,captureBuffers) {
            // TODO: implement this
        }
    }


    bg.webgl1.CubemapCaptureImpl = CubemapCaptureImpl;

})();