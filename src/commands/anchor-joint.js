app.addSource(() => {

    app.anchorJointCommands = {};

    class AddAnchors extends app.Command {
        /*
         *  anchors = [ { x:Number, y:Number, z:Number, r:Number } ]
         */
        constructor(anchorJoint,anchors) {
            super();
            this._anchorJoint = anchorJoint;
            this._anchors = anchors;
        }

        execute() {
            return new Promise((resolve) => {
                this._restoreAnchors = [];
                this._anchorJoint.anchors.forEach((a) => {
                    this._restoreAnchors.push({
                        x: a.offset.x,
                        y: a.offset.y,
                        z: a.offset.z,
                        r: a.radius
                    });
                });
                this._anchors.forEach((a) => {
                    this._anchorJoint.addPoint(a.x, a.y, a.z, a.r);
                })
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._anchorJoint.anchors.splice(0,this._anchorJoint.anchors.length);
                this._restoreAnchors.forEach((a) => {
                    this._anchorJoint.addPoint(a.x, a.y, a.z, a.r);
                });
                resolve();
            })
        }
    }

    app.anchorJointCommands.AddAnchors = AddAnchors;

    class RemoveAnchor extends app.Command {
        constructor(anchorJoint,anchorIndex) {
            super();
            this._anchorJoint = anchorJoint;
            this._anchorIndex = anchorIndex;
        }

        execute() {
            return new Promise((resolve) => {
                this._restoreAnchors = [];
                this._anchorJoint.anchors.forEach((a) => {
                    this._restoreAnchors.push({
                        x: a.offset.x,
                        y: a.offset.y,
                        z: a.offset.z,
                        r: a.radius
                    });
                });
                this._anchorJoint.anchors.splice(this._anchorIndex, 1);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._anchorJoint.anchors.splice(0,this._anchorJoint.anchors.length);
                this._restoreAnchors.forEach((a) => {
                    this._anchorJoint.addPoint(a.x, a.y, a.z, a.r);
                });
                resolve();
            })
        }
    }

    app.anchorJointCommands.RemoveAnchor = RemoveAnchor;

    class UpdateAnchor extends app.Command {
        constructor(anchorPoint, offset, radius) {
            super();
            this._anchorPoint = anchorPoint;
            this._offset = offset;
            this._radius = radius;
            this._restoreData = {
                offset: new bg.Vector3(anchorPoint.offset),
                radius: anchorPoint.radius
            };
        }

        execute() {
            return new Promise((resolve) => {
                this._anchorPoint.offset = new bg.Vector3(this._offset);
                this._anchorPoint.radius = this._radius;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._anchorPoint.offset = new bg.Vector3(this._restoreData.offset);
                this._anchorPoint.radius = this._restoreData.radius;
                resolve();
            });
        }
    }

    app.anchorJointCommands.UpdateAnchor = UpdateAnchor;
});