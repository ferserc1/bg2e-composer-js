(function() {

    class RigidBody extends bg.physics.SimulationObject {
        constructor() {
            super();

            this._mass = NaN;
            this._isKinematic = false;
            this._linearFactor = new bg.Vector3(1,1,1);
            this._angularFactor = new bg.Vector3(1,1,1);

            // this values will be updated during simulation
            this._linearVelocity = new bg.Vector3();
            this._angularVelocity = new bg.Vector3();

            this._restoreTransform = null;
        }

        set restoreTransform(trx) { this._restoreTransform = trx; }
        get restoreTransform() { return this._restoreTransform; }

        clone() {
            let result = new RigidBody();
            result._mass = this._mass;
            result._isKinematic = this._isKinematic;
            result._linearFactor = new bg.Vector3(this._linearFactor);
            result._angularFactor = new bg.Vector3(this._angularFactor);
            
            return result;
        }

        beginSimulation(engineData) {
            this._impl = engineData;

            if (engineData.node.transform) {
                this._restoreTransform = new bg.Matrix4(engineData.node.transform.matrix);
            }
        }

        endSimulation() {
            this._impl = null;
        }

        serialize(jsonData) {
            jsonData.mass = this._mass;
            jsonData.linearFactor = this._linearFactor;
            jsonData.angularFactor = this._angularFactor;
            jsonData.isKinematic = this._isKinematic;
        }

        deserialize(jsonData) {
            this.mass = jsonData.mass;
            this.linearFactor = jsonData.linearFactor;
            this.angularFactor = jsonData.angularFactor;
            this.isKinematic = jsonData.isKinematic;
        }

        get mass() { return this._mass; }
        set mass(m) { this._mass = m; }
        get isKinematic() { return this._isKinematic; }
        set isKinematic(k) { this._isKinematic = k; }

        get linearVelocity() { return this._linearVelocity; }
        set linearVelocity(vel) {
            // TODO: Implement
        }

        get angularVelocity() { return this._angularVelocity; }
        set angularVelocity(vel) {
            // TODO: implement this
        }

        get linearFactor() { return this._linearFactor; }
        set linearFactor(f) {
            // TODO: implement
        }
        get angularFactor() { return this._angularFactor; }
        set angularFactor(f) {
            // TODO: implement
        }

        applyForce(force, relativePos) {
            // TODO: implement
        }

        applyTorque(torque) {
            // TODO: implement
        }

        applyImpulse(impulse, relativePos) {
            // TODO: implement
        }

        applyCentralForce(force) {
            // TODO: implement
        }

        applyTorqueImpulse(torque) {
            // TODO: implement
        }

        applyCentralImpulse(impulse) {
            // TODO: implement
        }

        setTranform(trx) {
            // TODO: implement
        }

        addLinearVelocity(vel) {
            // TODO: implement
        }

        addAngularVelocity(vel) {
            // TODO: implement
        }


    }

    bg.physics.RigidBody = RigidBody;

})();