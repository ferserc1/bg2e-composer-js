app.addSource(() => {
    app.cameraCommands = {};

    class SetProjectionStrategy extends app.Command {
        constructor(camera,strategy) {
            super();
            this._camera = camera;
            this._strategy = strategy;
            this._prevStrategy = camera.projectionStrategy;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._camera.projectionStrategy = this._strategy;
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._camera.projectionStrategy = this._prevStrategy;
                resolve();
            });
        }
    }

    app.cameraCommands.SetProjectionStrategy = SetProjectionStrategy;
})