app.addSource(() => {
    app.jointCommands = {};

    class SetOffset extends app.Command {
        constructor(joint,x,y,z) {
            super();
            this._joint = joint;
            this._x = x;
            this._y = y;
            this._z = z;
            this._poffset = new bg.Vector3(joint.offset);
        }

        execute() {
            return new Promise((resolve) => {
                this._joint.offset = new bg.Vector3(this._x,this._y,this._z);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._joint.offset = new bg.Vector3(this._poffset);
                resolve();
            });
        }
    }

    app.jointCommands.SetOffset = SetOffset;

    class SetEulerRotation extends app.Command {
        constructor(joint,x,y,z) {
            super();
            this._joint = joint;
            this._x = x;
            this._y = y;
            this._z = z;
            this._prot = new bg.Vector3(joint.eulerRotation);
        }

        execute() {
            return new Promise((resolve) => {
                this._joint.eulerRotation = new bg.Vector3(this._x,this._y,this._z);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._joint.eulerRotation = new bg.Vector3(this._prot);
                resolve();
            });
        }
    }

    app.jointCommands.SetEulerRotation = SetEulerRotation;
})