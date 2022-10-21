(function() {
	function createBuffer(context,array,itemSize,drawMode) {
		let result = null;
		if (array.length) {
			result = context.createBuffer();
			context.bindBuffer(context.ARRAY_BUFFER,result);
			context.bufferData(context.ARRAY_BUFFER, new Float32Array(array), drawMode);
					result.itemSize = itemSize;
					result.numItems = array.length/itemSize;
		}
		return result;
	}
	
	function deleteBuffer(context,buffer) {
		if (buffer) {
			context.deleteBuffer(buffer);
		}
		return null;
	}

	let s_uintElements = false;
	
	class PolyListImpl extends bg.base.PolyListImpl {
		initFlags(context) {
			bg.base.DrawMode.TRIANGLES = context.TRIANGLES;
			bg.base.DrawMode.TRIANGLE_FAN = context.TRIANGLE_FAN;
			bg.base.DrawMode.TRIANGLE_STRIP = context.TRIANGLE_STRIP;
			bg.base.DrawMode.LINES = context.LINES;
			bg.base.DrawMode.LINE_STRIP = context.LINE_STRIP;

			s_uintElements = context.getExtension("OES_element_index_uint");
		}
		
		create(context) {
			return {
				vertexBuffer:null,
				normalBuffer:null,
				tex0Buffer:null,
				tex1Buffer:null,
				tex2Buffer:null,
				colorBuffer:null,
				tangentBuffer:null,
				indexBuffer:null
			}
		}
		
		build(context,plist,vert,norm,t0,t1,t2,col,tan,index) {
			plist.vertexBuffer = createBuffer(context,vert,3,context.STATIC_DRAW);
			plist.normalBuffer = createBuffer(context,norm,3,context.STATIC_DRAW);
			plist.tex0Buffer = createBuffer(context,t0,2,context.STATIC_DRAW);
			plist.tex1Buffer = createBuffer(context,t1,2,context.STATIC_DRAW);
			plist.tex2Buffer = createBuffer(context,t2,2,context.STATIC_DRAW);
			plist.colorBuffer = createBuffer(context,col,4,context.STATIC_DRAW);
			plist.tangentBuffer = createBuffer(context,tan,3,context.STATIC_DRAW);
		
			if (index.length>0 && s_uintElements) {
				plist.indexBuffer = context.createBuffer();
				context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
				context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint32Array(index),context.STATIC_DRAW);
				plist.indexBuffer.itemSize = 3;
				plist.indexBuffer.numItems = index.length;
			}
			else {
				plist.indexBuffer = context.createBuffer();
				context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
				context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(index),context.STATIC_DRAW);
				plist.indexBuffer.itemSize = 3;
				plist.indexBuffer.numItems = index.length;
			}
			
			return plist.vertexBuffer && plist.indexBuffer;
		}
		
		draw(context,plist,drawMode,numberOfIndex) {
			context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
			if (s_uintElements) {
				context.drawElements(drawMode, numberOfIndex, context.UNSIGNED_INT, 0);
			}
			else {
				context.drawElements(drawMode, numberOfIndex, context.UNSIGNED_SHORT, 0);
			}
		}
		
		destroy(context,plist) {
			context.bindBuffer(context.ARRAY_BUFFER, null);
			context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, null);

			plist.vertexBuffer = deleteBuffer(context,plist.vertexBuffer);
			plist.normalBuffer = deleteBuffer(context,plist.normalBuffer);
			plist.tex0Buffer = deleteBuffer(context,plist.tex0Buffer);
			plist.tex1Buffer = deleteBuffer(context,plist.tex1Buffer);
			plist.tex2Buffer = deleteBuffer(context,plist.tex2Buffer);
			plist.colorBuffer = deleteBuffer(context,plist.colorBuffer);
			plist.tangentBuffer = deleteBuffer(context,plist.tangentBuffer);
			plist.indexBuffer = deleteBuffer(context,plist.indexBuffer);
		}

		update(context,plist,bufferType,newData) {
			if (bufferType==bg.base.BufferType.INDEX) {
				if (s_uintElements) {
					context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
					context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint32Array(index),context.STATIC_DRAW);
				}
				else {
					context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
					context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(index),context.STATIC_DRAW);
				}
				context.bindBuffer(context.ELEMENT_ARRAY_BUFFER,null);
			}
			else {
				switch (bufferType) {
				case bg.base.BufferType.VERTEX:
					context.bindBuffer(context.ARRAY_BUFFER, plist.vertexBuffer);
					break;
				case bg.base.BufferType.NORMAL:
					context.bindBuffer(context.ARRAY_BUFFER, plist.normalBuffer);
					break;
				case bg.base.BufferType.TEX_COORD_0:
					context.bindBuffer(context.ARRAY_BUFFER, plist.tex0Buffer);
					break;
				case bg.base.BufferType.TEX_COORD_1:
					context.bindBuffer(context.ARRAY_BUFFER, plist.tex1Buffer);
					break;
				case bg.base.BufferType.TEX_COORD_2:
					context.bindBuffer(context.ARRAY_BUFFER, plist.tex2Buffer);
					break;
				case bg.base.BufferType.COLOR:
					context.bindBuffer(context.ARRAY_BUFFER, plist.colorBuffer);
					break;
				case bg.base.BufferType.TANGENT:
					context.bindBuffer(context.ARRAY_BUFFER, plist.tangentBuffer);
					break;
				}
				context.bufferData(context.ARRAY_BUFFER, new Float32Array(newData), context.STATIC_DRAW);
				context.bindBuffer(context.ARRAY_BUFFER,null);
			}
		}
	}
	
	bg.webgl1.PolyListImpl = PolyListImpl;
})();
