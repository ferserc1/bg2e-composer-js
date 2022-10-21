(function() {
	
	let s_r = 0;
	let s_g = 0;
	let s_b = 0;
	let s_a = 0;
	
	function incrementIdentifier() {
		if (s_r==255) {
			s_r = 0;
			incG();
		}
		else {
			++s_r;
		}
	}
	
	function incG() {
		if (s_g==255) {
			s_g = 0;
			incB();
		}
		else {
			++s_g;
		}
	}
	
	function incB() {
		if (s_b==255) {
			s_b = 0;
			incA();
		}
		else {
			++s_b;
		}
	}
	
	function incA() {
		if (s_a==255) {
			s_a = 0;
			bg.log("WARNING: Maximum number of picker identifier reached.");
		}
		else {
			++s_a;
		}
	}
	
	function getIdentifier() {
		incrementIdentifier();
		return { r:s_r, g:s_g, b:s_g, a:s_a };
	}
	
	let s_selectMode = false;
	
	bg.manipulation.SelectableType = {
		PLIST:1,
		GIZMO:2,
		GIZMO_ICON:3
	};

	let s_selectionIconPlist = null;
	function selectionIconPlist() {
		if (!s_selectionIconPlist) {
			s_selectionIconPlist = bg.scene.PrimitiveFactory.SpherePolyList(this.node.context,0.5);
		}
		return s_selectionIconPlist;
	}

	let g_selectableIcons = [
		"bg.scene.Camera",
		"bg.scene.Light",
		"bg.scene.Transform",
		"bg.scene.TextRect"
	];

	
	class Selectable extends bg.scene.Component {
		static SetSelectableIcons(sel) {
			g_selectableIcons = sel;
		}

		static AddSelectableIcon(sel) {
			if (g_selectableIcons.indexOf(sel)==-1) {
				g_selectableIcons.push(sel);
			}
		}

		static RemoveSelectableIcon(sel) {
			let index = g_selectableIcons.indexOf(sel);
			if (index>=0) {
				g_selectableIcons.splice(index,1);
			}
		}

		static SetSelectMode(m) { s_selectMode = m; }
		
		static GetIdentifier() { return getIdentifier(); }
		
		constructor() {
			super();
			this._initialized = false;
			this._selectablePlist = [];
		}
		
		clone() {
			return new Selectable();
		}
		
		buildIdentifier() {
			this._initialized = false;
			this._selectablePlist = [];
		}
		
		findId(id) {
			let result = null;
			this._selectablePlist.some((item) => {
				if (item.id.r==id.r && item.id.g==id.g && item.id.b==id.b && item.id.a==id.a) {
					result = item;
					return true;
				}
			});
			return result;
		}
		
		frame(delta) {
			if (!this._initialized && this.drawable) {
				this.drawable.forEach((plist,material) => {
					let id = getIdentifier();
					this._selectablePlist.push({
						id:id,
						type:bg.manipulation.SelectableType.PLIST,
						plist:plist,
						material:material,
						drawable:this.drawable,
						node:this.node
					});
				});
				this._initialized = true;
			}
			else if (!this._initialized) {
				// Use icon to pick item
				let id = getIdentifier();
				this._selectablePlist.push({
					id:id,
					type:bg.manipulation.SelectableType.GIZMO_ICON,
					plist:null,
					material:null,
					drawable:null,
					node:this.node
				});
				this._initialized = true;
			}
		}
		
		display(pipeline,matrixState) {
			if (pipeline.effect instanceof bg.manipulation.ColorPickEffect &&
				pipeline.opacityLayer & bg.base.OpacityLayer.SELECTION)
			{
				let selectableByIcon = g_selectableIcons.some((componentType) => {
					return this.node.component(componentType)!=null;
				});
				this._selectablePlist.forEach((item) => {
					let pickId = new bg.Color(item.id.a/255,item.id.b/255,item.id.g/255,item.id.r/255);
					if (item.plist && item.plist.visible) {
						// The RGBA values are inverted because the alpha channel must be major than zero to
						// produce any output in the framebuffer
						pipeline.effect.pickId = pickId;
						pipeline.draw(item.plist);
					}
					else if (!item.plist && selectableByIcon) {
						let s = matrixState.cameraDistanceScale * 0.1;
						pipeline.effect.pickId = pickId;
						matrixState.modelMatrixStack.push();
						matrixState.modelMatrixStack.scale(s,s,s);
						pipeline.draw(selectionIconPlist.apply(this));
						matrixState.modelMatrixStack.pop();
					}
				});
			}
		}
	}
	
	bg.scene.registerComponent(bg.manipulation,Selectable,"bg.manipulation.Selectable");
})();