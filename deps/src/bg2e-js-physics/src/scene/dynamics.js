(function() {

    class Dynamics extends bg.scene.Component {
        constructor(world) {
            super();
            this._world = world || new bg.physics.World();
            this._simulationState = Dynamics.SimulationState.STOPPED;

            if (this._world) {
                this._world._dynamics = this;
            }
        }

        clone() {
            return new Dynamics((this._world && this._world.clone()) || null);
        }

        get world() { return this._world; }
        
        frame(delta) {
            if (this._simulationState == Dynamics.SimulationState.PLAYING) {
                this._world.simulationStep(delta);
            }
        }

        eachShape(fn) {
            if (this.node) {
                this.node.children.forEach((n) => {
                    let collider = n.collider;
                    if (collider) {
                        fn(n, collider, n.rigidBody);
                    }
                })
            }
        }

        play() {
            if (this._simulationState == Dynamics.SimulationState.PAUSED) {
                this._simulationState = Dynamics.SimulationState.PLAYING;
            }
            else if (this._simulationState == Dynamics.SimulationState.STOPPED) {
                this._simulationState = Dynamics.SimulationState.PLAYING;
                this._world.beginSimulation(this.node);
            }
        }

        pause() {
            if (this._simulationState == Dynamics.SimulationState.PLAYING) {
                this._simulationState = Dynamics.SimulationState.PAUSED;
            }
        }

        stop() {
            if (this._simulationState != Dynamics.SimulationState.STOPPED) {
                this._simulationState = Dynamics.SimulationState.STOPPED;
                this._world.endSimulation();
            }
        }

        restore() {
            this.eachShape((node,collider,rigidBody) => {
                if (rigidBody) {
                    rigidBody.restore();
                }
            });
        }

        commit() {
            this.eachShape((node,collider,rigidBody) => {
                if (rigidBody) {
                    rigidBody.commit();
                }
            });
        }

        get simulationState() {
            return this._simulationState;
        }

        serialize(componentData,promises,url) {
            if (!bg.isElectronApp) {
                return;
            }
            super.serialize(componentData,promises,url);
            if (this._world) {
                this._world.serialize(componentData);
            }
            else {
                componentData.gravity = [0,0,0];
            }
        }

        deserialize(context,sceneData,url) {
            if (!this._world) {
                this._world = new bg.physics.World();
                this._world._dynamics = this;
            }
            this._world.deserialize(sceneData);
        }
    }

    Dynamics.SimulationState = {
        STOPPED: 0,
        PLAYING: 1,
        PAUSED: 2
    }

    bg.scene.registerComponent(bg.scene,Dynamics,"bg.scene.Dynamics");

    // Add dynamics to SceneObject and Component prototypes
    Object.defineProperty(bg.scene.SceneObject.prototype,"dynamics", { get: function() { return this.component("bg.scene.Dynamics"); }});
    Object.defineProperty(bg.scene.Component.prototype,"dynamics", { get: function() { return this.component("bg.scene.Dynamics"); }});

    class DynamicsVisitor extends bg.scene.NodeVisitor {
        constructor() {
            super();
            this._result = [];
        }

        reset() { this._result = []; }

        get result() { return this._result; }

        play() {
            this._result.forEach((dyn) => {
                dyn.play();
            });
        }

        pause() {
            this._result.forEach((dyn) => {
                dyn.pause();
            });
        }

        stop() {
            this._result.forEach((dyn) => {
                dyn.stop();
            });
        }

        visit(node) {
            if (node.dynamics) {
                this._result.push(node.dynamics);
            }
        }
    }

    bg.scene.DynamicsVisitor = DynamicsVisitor;

    bg.scene.Node.prototype.findDynamics = function() {
        let visitor = new DynamicsVisitor();
        this.sceneRoot.accept(visitor);
        return visitor.result;
    };

})();