(function() {

    class RigidBody extends bg.scene.Component {
        constructor(rigidBody) {
            super();
            this._rigidBody = rigidBody || new bg.physics.RigidBody();
        }

        clone() {
            return new RigidBody(this._rigidBody.clone());
        }

        get body() { return this._rigidBody; }

        serialize(componentData,promises,url) {
            if (!bg.isElectronApp) {
                return;
            }
            super.serialize(componentData,promises,url);
            this._rigidBody.serialize(componentData);
        }

        deserialize(context,sceneData,url) {
            return new Promise((resolve,reject) => {
                this._rigidBody.deserialize(sceneData);
                resolve();
            });
        }

        // When the simulation is stopped, the following function restores the object
        // transform
        restore() {
            if (!this.body.isSimulationRunning && this.transform && this.body.restoreTransform) {
                this.transform.matrix
                    .identity()
                    .mult(this.body.restoreTransform);
            }
        }

        // When the simulation is stopped, the following function consolidate the 
        // changes in the transform node
        commit() {
            if (!this.body.isSimulationRunning && this.transform) {
                this.body.restoreTransform = null;
            }
        }
    }

    bg.scene.registerComponent(bg.scene,RigidBody,"bg.scene.RigidBody");

    // Add rigidBody to SceneObject and Component prototypes
    Object.defineProperty(bg.scene.SceneObject.prototype,"rigidBody", { get: function() { return this.component("bg.scene.RigidBody"); }});
    Object.defineProperty(bg.scene.Component.prototype,"rigidBody", { get: function() { return this.component("bg.scene.RigidBody"); }});

})();