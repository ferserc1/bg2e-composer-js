app.addSource(() => {
    app.gizmoConstraintsCommands = {};

    class SetBounds extends app.Command {
        constructor(component, newBounds) {
            super();
            this._component = component;
            this._newBounds = new bg.Vector3(newBounds);
            this._prevBounds = new bg.Vector3(component.bounds);
        }

        execute() {
            return new Promise((resolve) => {
                this._component.bounds = new bg.Vector3(this._newBounds);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._component.bounds = new bg.Vector3(this._prevBounds);
                resolve();
            })
        }
    }

    app.gizmoConstraintsCommands.SetBounds = SetBounds;
});