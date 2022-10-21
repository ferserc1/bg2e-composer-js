bg.scene = {};

(function() {
	
	let s_componentRegister = {};
	
	class Component extends bg.LifeCycle {
		static Factory(context,componentData,node,url) {
			let Constructor = s_componentRegister[componentData.type];
			if (Constructor) {
				let instance = new Constructor();
				node.addComponent(instance);
				return instance.deserialize(context,componentData,url);
			}
			else {
				return Promise.resolve();
			}
			
		}
		
		constructor() {
			super();
			
			this._node = null;

			this._drawGizmo = true;
		}
		
		clone() {
			bg.log(`WARNING: Component with typeid ${this.typeId} does not implmement the clone() method.`);
			return null;
		}

		destroy() {
			
		}
		
		get node() { return this._node; }
		
		get typeId() { return this._typeId; }

		get draw3DGizmo() { return this._drawGizmo; }
		set draw3DGizmo(d) { this._drawGizmo = d; }
		
		removedFromNode(node) {}
		addedToNode(node) {}
		
		// Override this to prevent serialize this component
		get shouldSerialize() { return true; }
		
		deserialize(context,sceneData,url) {
			return Promise.resolve(this);
		}

		// componentData: the current json object corresponding to the parent node
		// promises: array of promises. If the component needs to execute asynchronous
		//			 actions, it can push one or more promises into this array
		// url: the destination scene url, composed by:
		//	{
		//		path: "scene path, using / as separator even on Windows",
		//		fileName: "scene file name" 
		//	}
		serialize(componentData,promises,url) {
			componentData.type = this.typeId.split(".").pop();
		}
		
		// The following functions are implemented in the SceneComponent class, in the C++ API
		component(typeId) { return this._node && this._node.component(typeId); }
		
		get camera() { return this.component("bg.scene.Camera"); }
		get chain() { return this.component("bg.scene.Chain"); }
		get drawable() { return this.component("bg.scene.Drawable"); }
		get inputChainJoint() { return this.component("bg.scene.InputChainJoint"); }
		get outputChainJoint() { return this.component("bg.scene.OutputChainJoint"); }
		get light() { return this.component("bg.scene.Light"); }
		get transform() { return this.component("bg.scene.Transform"); }
		get anchorJoint() { return this.component("bg.scene.AnchorJoint"); }
	}
	
	bg.scene.Component = Component;
	
	bg.scene.registerComponent = function(namespace,componentClass,identifier) {
		let result = /function (.+)\(/.exec(componentClass.toString());
		if (!result) {
			result = /class ([a-zA-Z0-9_]+) /.exec(componentClass.toString());
		}
		let funcName = (result && result.length>1) ? result[1] : "";
		
		namespace[funcName] = componentClass;
		componentClass.prototype._typeId = identifier || funcName;

		bg.scene.Node.prototype;
		
		
		s_componentRegister[funcName] = componentClass;
	}
	
})();