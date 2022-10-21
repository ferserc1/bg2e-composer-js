(function() {
    bg.physics = bg.physics || {};

    class World extends bg.physics.SimulationObject {
        constructor() {
            super();
            this._gravity = new bg.Vector3();
            this._isRunning = false;
            this._minFramerate = 12;
            this._targetFramerate = 60;

            // This value is set by the bg.scene.Dynamics component
            this._dynamics = null;

            let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            let overlappingPairCache = new Ammo.btDbvtBroadphase();
            let solver = new Ammo.btSequentialImpulseConstraintSolver();
            let dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
            dynamicsWorld.setGravity(new Ammo.btVector3(this._gravity.x, this._gravity.y, this._gravity.z));

            this._engine = {
                collisionConfiguration: collisionConfiguration,
                dispatcher: dispatcher,
                overlappingPairCache: overlappingPairCache,
                solver: solver,
                dynamicsWorld: dynamicsWorld,
                bodies: []
            }
        }

        clone() {
            let result = new World();
            result.gravity = new bg.Vector3(this._gravity);
            return result;
        }

        destroy() {
            this.endSimulation();

            this._engine.bodies = [];
            Ammo.destroy(this._engine.dynamicsWorld);
            Ammo.destroy(this._engine.solver);
            Ammo.destroy(this._engine.overlappingPairCache);
            Ammo.destroy(this._engine.dispatcher);
            Ammo.destroy(this._engine.collisionConfiguration);
        }

        set minFramerate(fr) { this._minFramerate = fr; }
        get minFramerate() { return this._minFramerate; }
        set targetFramerate(fr) { this._targetFramerate = fr; }
        get targetFramerate() { return this._targetFramerate; }

        get sceneComponent() { return this._dynamics }

        set gravity(g) {
            this._gravity = g;
            this._engine.dynamicsWorld.setGravity(new Ammo.btVector3(g.x, g.y, g.z));
        }
        get gravity() { return this._gravity; }

        get isRunning() { return this._isRunning; }

        beginSimulation(node) {
            let sim = node && node.dynamics;

            if (!this.isRunning && sim && this.sceneComponent) {
                this.sceneComponent.eachShape((node, collider, rigidBody) => {
                    this.addNode(node);
                });
                this._isRunning = true;
            }
        }

        simulationStep(delta) {
            if (this._isRunning && this.sceneComponent) {
                let minT = 1 / this._minFramerate;
                let simT = 1 / this._targetFramerate;
                let steps = Math.ceil(minT/simT);

                let deltaMs = delta / 1000;
                this._engine.dynamicsWorld.stepSimulation(1/60,10);
                let btTrx = new Ammo.btTransform();
                this._engine.bodies.forEach((bodyData) => {
                    // bodyData: { btBody, node }
                    bodyData.btBody.getMotionState().getWorldTransform(btTrx);
                    let origin = btTrx.getOrigin();
                    let rotation = btTrx.getRotation();
                    if (bodyData.node.transform) {
                        bodyData.node.transform.matrix.identity();
                        bodyData.node.transform.matrix.translate(origin.x(),origin.y(),origin.z());
                        let axis = rotation.getAxis();
                        bodyData.node.transform.matrix.rotate(rotation.getAngle(),axis.x(), axis.y(),axis.z());
                    }
                });
            }
        }

        endSimulation() {
            if (this._isRunning) {
                
                // TODO: Remove all bodies from the list
                let b = [];
                this._engine.bodies.forEach((bodyData) => b.push(bodyData));
                b.forEach((bodyData) => this.removeNode(bodyData.node));

                this._isRunning = false;
            }
        }

        // Use the following functions to add or remove node to the world
        // during the simulation loop
        removeNode(node) {
            let i = -1;
            this._engine.bodies.some((bodyData,index) => {
                if (bodyData.node==node) {
                    this._engine.dynamicsWorld.removeRigidBody(bodyData.btBody);
                    node.collider.shape.endSimulation();
                    if (node.rigidBody) {
                        node.rigidBody.body.endSimulation();
                    }
                    i = index;
                    return true;
                }
            });

            if (i!=-1) {
                this._engine.bodies.splice(i,1);
            }
        }

        // You can use this function during simulation. When the simulation starts, all the
        // children of this node that contains a collision will be added automatically
        // Do not add nodes that not belong to the dynamics node
        addNode(node) {
            let parent = node.parent;
            let collider = node.collider;
            let transform = node.transform;
            let rigidBodyComponent = node.rigidBody;
            let dynamics = parent && parent.dynamics;
            
            if (this.sceneComponent==dynamics && collider) {
                // Common: transform
                let btTrx = new Ammo.btTransform();
                btTrx.setIdentity();
                if (transform) {
                    btTrx.setFromOpenGLMatrix(transform.matrix.toArray());
                }

                // Shape
                let shape = collider.shape.beginSimulation();

                // Body
                let mass = rigidBodyComponent && rigidBodyComponent.body.mass || 0;
                let btBody = null;
                let localInertia = new Ammo.btVector3(0,0,0);
                let motionState = new Ammo.btDefaultMotionState(btTrx);
                if (mass!=0) {
                    shape.calculateLocalInertia(mass, localInertia);
                }
                btBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia));
                
                if (rigidBodyComponent) {
                    rigidBodyComponent.body.beginSimulation({
                        dynamics: this._engine.dynamicsWorld,
                        body: btBody,
                        node: node
                    });
                }

                this._engine.dynamicsWorld.addRigidBody(btBody);
                this._engine.bodies.push({
                    btBody: btBody,
                    node: node
                });                
            }
        }

        rayTest(ray) {
            let result;
            let start = new Ammo.btVector3(ray.start.x, ray.start.y, ray.start.z);
            let end = new Ammo.btVector3(ray.end.x, ray.end.y, ray.end.z);
            /*
            TODO: Implement this
            btCollisionWorld::ClosestRayResultCallback rayCallback(start,end);
            
            bt::world(this)->rayTest(start, end, rayCallback);
            if (rayCallback.hasHit()) {
                const btCollisionObject * obj = rayCallback.m_collisionObject;
                btVector3 point = rayCallback.m_hitPointWorld;
                btVector3 normal = rayCallback.m_hitNormalWorld;
                size_t bodyKey = reinterpret_cast<size_t>(btRigidBody::upcast(obj));
                bg::scene::Node * node = _colliderMap[bodyKey].getPtr();
                result = new bg::physics::RayCastResult(node,
                                                        bg::math::Vector3(point.x(), point.y(), point.z()),
                                                        bg::math::Vector3(normal.x(), normal.y(), normal.z()));
            }
            
            return result.release();
            */
            return null;
        }

        serialize(jsonData) {
            jsonData.gravity = this._gravity.toArray();
        }

        deserialize(jsonData) {
            this.gravity = new bg.Vector3(jsonData.gravity || [0,0,0]);
        }
    }

    bg.physics.World = World;


})();