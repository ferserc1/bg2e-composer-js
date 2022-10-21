(function() {
    bg.physics = bg.physics || {};

    let s_colliderRegistry = {};

    bg.physics.registerCollider = function(componentClass) {
        let result = /function (.+)\(/.exec(componentClass.toString());
		if (!result) {
			result = /class ([a-zA-Z0-9_]+) /.exec(componentClass.toString());
		}
		let funcName = (result && result.length>1) ? result[1] : "";
		
		bg.physics[funcName] = componentClass;
        componentClass.prototype._typeId = funcName;
        
        s_colliderRegistry[funcName] = componentClass;
    };

    class ColliderShape extends bg.physics.SimulationObject {
        static Factory(jsonData, path) {
            return new Promise((resolve) => {
                let Constructor = s_colliderRegistry[jsonData.shape];
                if (Constructor) {
                    let instance = new Constructor();
                    instance.deserialize(jsonData,path)
                        .then(() => {
                            resolve(instance);
                        });
                }
                else {
                    resolve(null);
                }
            });
            
        }

        constructor() {
            super();
        }
        
        clone() {
            return new ColliderShape();
        }

        deserialize(jsonData,path) {
            return Promise.reject(new Error("Collider deserialize() function not implemented"));
        }

        serialize(jsonData,path) {
            return Promise.reject(new Error("Collider serialize() function not implemented"));
        }

        get dirtyGizmo() {
            throw new Error("ColliderShape: get dirtyGizmo() accessor not implemented by child class");
        }

        getGizmoVertexArray() {
            throw new Error("ColliderShape: getGizmoVertexArray() not implemented by child class");
        }
    }

    bg.physics.ColliderShape = ColliderShape;

})();