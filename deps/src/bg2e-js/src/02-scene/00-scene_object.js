(function() {
	class SceneObjectLifeCycle extends bg.LifeCycle {
		// This class reimplements the bg.app.ContextObject due to the lack
		// in JavaScript of multiple ihneritance
		
		constructor(context) {
			super(context);
			
			this._context = context;
		}
		
		get context() { return this._context; }
		set context(c) { this._context = c; }
	}
	
	function updateComponentsArray() {
		this._componentsArray = [];
		for (let key in this._components) {
			this._components[key] && this._componentsArray.push(this._components[key]);
		}
	}

	class SceneObject extends SceneObjectLifeCycle {
		
		constructor(context,name="") {
			super(context);
			
			this._name = name;
			this._enabled = true;
			this._steady = false;
			
			this._components = {};
			this._componentsArray = [];
		}

		toString() {
			return " scene object: " + this._name;
		}
		
		// Create a new instance of this node, with a copy of all it's components
		cloneComponents() {
			let newNode = new bg.scene.Node(this.context,this.name ? `copy of ${this.name}`:"");
			newNode.enabled = this.enabled;
			this.forEachComponent((comp) => {
				newNode.addComponent(comp.clone());
			});
			return newNode;
		}
		
		get name() { return this._name; }
		set name(n) { this._name = n; }
		
		get enabled() { return this._enabled; }
		set enabled(e) { this._enabled = e; }

		get steady() { return this._steady; }
		set steady(s) { this._steady = s; }
		
		addComponent(c) {
			if (c._node) {
				c._node.removeComponent(c);
			}
			c._node = this;
			this._components[c.typeId] = c;
			c.addedToNode(this);
			updateComponentsArray.apply(this);
		}
		
		// It's possible to remove a component by typeId or by the specific object.
		//	- typeId: if the scene object contains a component of this type, will be removed
		// 	- specific object: if the scene object contains the specified object, will be removed
		removeComponent(findComponent) {
			let typeId = "";
			let comp = null;
			if (typeof(findComponent)=="string") {
				typeId = findComponent
				comp = this.component(findComponent);
			}
			else if (findComponent instanceof bg.scene.Component) {
				comp = findComponent;
				typeId = findComponent.typeId;
			}
			
			let status = false;
			if (this._components[typeId]==comp && comp!=null) {
				delete this._components[typeId];
				comp.removedFromNode(this);
				status = true;
			}

			updateComponentsArray.apply(this);
			return status;
		}
		
		component(typeId) {
			return this._components[typeId];
		}
		
		// Most common components
		get camera() { return this.component("bg.scene.Camera"); }
		get chain() { return this.component("bg.scene.Chain"); }
		get drawable() { return this.component("bg.scene.Drawable"); }
		get inputJoint() { return this.component("bg.scene.InputJoint"); }
		get outputJoint() { return this.component("bg.scene.OutputJoint"); }
		get light() { return this.component("bg.scene.Light"); }
		get transform() { return this.component("bg.scene.Transform"); }
		get anchorJoint() { return this.component("bg.scene.AnchorJoint"); }
		
		forEachComponent(callback) {
			this._componentsArray.forEach(callback);
		}
		
		someComponent(callback) {
			return this._componentsArray.some(callback);
		}
		
		everyComponent(callback) {
			return this._componentsArray.every(callback);
		}
		
		destroy() {
			this.forEachComponent((comp) => {
				comp.removedFromNode(this);
			});
			
			this._components = {};
			this._componentsArray = [];
		}
		
		init() {
			this._componentsArray.forEach((comp) => {
				comp.init();
			});
		}
		
		frame(delta) {
			this._componentsArray.forEach((comp) => {
				if (!comp._initialized_) {
					comp.init();
					comp._initialized_ = true;
				}
				comp.frame(delta);
			});
		}
		
		displayGizmo(pipeline,matrixState) {
			this._componentsArray.forEach((comp) => {
				if (comp.draw3DGizmo) comp.displayGizmo(pipeline,matrixState);
			});
		}

		/////// Direct rendering methods: will be deprecated soon
		willDisplay(pipeline,matrixState) {
			this._componentsArray.forEach((comp) => {
				comp.willDisplay(pipeline,matrixState);
			});
		}
		
		display(pipeline,matrixState,forceDraw=false) {
			this._componentsArray.forEach((comp) => {
				comp.display(pipeline,matrixState,forceDraw);
			});
		}

		
		didDisplay(pipeline,matrixState) {
			this._componentsArray.forEach((comp) => {
				comp.didDisplay(pipeline,matrixState);
			});
		}
		//////// End direct rendering methods


		////// Render queue methods
		willUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			this._componentsArray.forEach((comp) => {
				comp.willUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack);
			});
		}

		draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			this._componentsArray.forEach((comp) => {
				comp.draw(renderQueue,modelMatrixStack,viewMatrixStack,projectionMatrixStack);
			});
		}

		didUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack) {
			this._componentsArray.forEach((comp) => {
				comp.didUpdate(modelMatrixStack,viewMatrixStack,projectionMatrixStack);
			});
		}
		////// End render queue methods

		
		reshape(pipeline,matrixState,width,height) {
			this._componentsArray.forEach((comp) => {
				comp.reshape(width,height);
			});
		}
		
		keyDown(evt) {
			this._componentsArray.forEach((comp) => {
				comp.keyDown(evt);
			});
		}
		
		keyUp(evt) {
			this._componentsArray.forEach((comp) => {
				comp.keyUp(evt);
			});
		}
		
		mouseUp(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseUp(evt);
			});
		}
		
		mouseDown(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseDown(evt);
			});
		}
		
		mouseMove(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseMove(evt);
			});
		}
		
		mouseOut(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseOut(evt);
			});
		}
		
		mouseDrag(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseDrag(evt);
			});
		}
		
		mouseWheel(evt) {
			this._componentsArray.forEach((comp) => {
				comp.mouseWheel(evt);
			});
		}
		
		touchStart(evt) {
			this._componentsArray.forEach((comp) => {
				comp.touchStart(evt);
			});
		}
		
		touchMove(evt) {
			this._componentsArray.forEach((comp) => {
				comp.touchMove(evt);
			});
		}
		
		touchEnd(evt) {
			this._componentsArray.forEach((comp) => {
				comp.touchEnd(evt);
			});
		}
	}
	
	bg.scene.SceneObject = SceneObject;
	
})();