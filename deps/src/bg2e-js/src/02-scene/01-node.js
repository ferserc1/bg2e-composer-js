(function() {
	
	function isNodeAncient(node, ancient) {
		if (!node || !ancient) {
			return false;
		}
		else if (node._parent==ancient) {
			return true;
		}
		else {
			return isNodeAncient(node._parent, ancient);
		}
	}

	function cleanupNode(sceneNode) {
        let components = [];
        let children = [];
        sceneNode.forEachComponent((c) => components.push(c));
        sceneNode.children.forEach((child) => children.push(child));
        components.forEach((c) => sceneNode.removeComponent(c));
        children.forEach((child) => {
            sceneNode.removeChild(child);
            cleanupNode(child);
        });
    }
	
	class Node extends bg.scene.SceneObject {
		// IMPORTANT: call this function to clean all the resources of
		// a node if you don't want to use it anymore.
		static CleanupNode(node) {
			cleanupNode(node);
		}

		constructor(context,name="") {
			super(context,name);
			
			this._children = [];
			this._parent = null;
		}

		toString() {
			return super.toString() + " (" + this._children.length + " children and " + Object.keys(this._components).length + " components)";
		}
		
		addChild(child) {
			if (child && !this.isAncientOf(child) && child!=this) {
				if (child.parent) {
					child.parent.removeChild(child);
				}
				this._children.push(child);
				child._parent = this;
			}
		}
		
		removeChild(node) {
			let index = this._children.indexOf(node);
			if (index>=0) {
				this._children.splice(index,1);
			}
		}
		
		get children() { return this._children; }
		
		get parent() { return this._parent; }
		
		get sceneRoot() {
			if (this._parent) {
				return this._parent.sceneRoot;
			}
			return this;
		}
		
		haveChild(node) {
			return this._children.indexOf(node)!=-1;
		}
		
		isAncientOf(node) {
			isNodeAncient(this,node);
		}
		
		accept(nodeVisitor) {
			if (!nodeVisitor.ignoreDisabled || this.enabled) {
				nodeVisitor.visit(this);
				this._children.forEach((child) => {
					child.accept(nodeVisitor);
				});
				nodeVisitor.didVisit(this);
			}
		}
		
		acceptReverse(nodeVisitor) {
			if (!nodeVisitor.ignoreDisabled || this.enabled) {
				if (this._parent) {
					this._parent.acceptReverse(nodeVisitor);
				}
				nodeVisitor.visit(this);
			}
		}
		
		destroy() {
			super.destroy();
			this._children.forEach((child) => {
				child.destroy();
			});
			this._children = [];
		}
		
	}
	
	bg.scene.Node = Node;
	
	class NodeVisitor {
		constructor() {
			this._ignoreDisabled = true;
		}

		get ignoreDisabled() { return this._ignoreDisabled; }

		set ignoreDisabled(v) { this._ignoreDisabled = v; }

		visit(node) {}
		didVisit(node) {}
	}
	
	bg.scene.NodeVisitor = NodeVisitor;
})();