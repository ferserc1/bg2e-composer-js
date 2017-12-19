app.addSource(() => {
    app.orbitCameraCommands = {};

    class SetConstraints extends app.Command {
        constructor(ctrl,minD,maxD,minP,maxP,minX,maxX,minY,maxY,minZ,maxZ) {
            super();
            this._ctrl = ctrl;
            this._restore = {
                minPitch: ctrl.minPitch,
                maxPitch: ctrl.maxPitch,
                minDistance: ctrl.minDistance,
                maxDistance: ctrl.maxDistance,
                minX: ctrl.minX,
                maxX: ctrl.maxX,
                minY: ctrl.minY,
                maxY: ctrl.maxY,
                minZ: ctrl.minZ,
                maxZ: ctrl.maxZ,
            };
            this._minD = minD;
            this._maxD = maxD;
            this._minP = minP;
            this._maxP = maxP;
            this._minX = minX;
            this._maxX = maxX;
            this._minY = minY;
            this._maxY = maxY;
            this._minZ = minZ;
            this._maxZ = maxZ;
        }

        execute() {
            return new Promise((resolve) => {
                this._ctrl.minPitch = this._minP;
                this._ctrl.maxPitch = this._maxP;
                this._ctrl.minDistance = this._minD;
                this._ctrl.maxDistance = this._maxD;
                this._ctrl.minX = this._minX;
                this._ctrl.maxX = this._maxX;
                this._ctrl.minY = this._minY;
                this._ctrl.maxY = this._maxY;
                this._ctrl.minZ = this._minZ;
                this._ctrl.maxZ = this._maxZ;
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._ctrl.minPitch = this._restore.minPitch;
                this._ctrl.maxPitch = this._restore.maxPitch;
                this._ctrl.minDistance = this._restore.minDistance;
                this._ctrl.maxDistance = this._restore.maxDistance;
                this._ctrl.minX = this._restore.minX;
                this._ctrl.maxX = this._restore.maxX;
                this._ctrl.minY = this._restore.minY;
                this._ctrl.maxY = this._restore.maxY;
                this._ctrl.minZ = this._restore.minZ;
                this._ctrl.maxZ = this._restore.maxZ;
                resolve();
            })
        }
    }
    app.orbitCameraCommands.SetConstraints = SetConstraints;
    
})