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
                this._camera.recalculateGizmo();
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._camera.projectionStrategy = this._prevStrategy;
                this._camera.recalculateGizmo();
                resolve();
            });
        }
    }

    app.cameraCommands.SetProjectionStrategy = SetProjectionStrategy;

    class SavePerspective extends app.Command {
        constructor(camera,fov,near,far) {
            super();
            this._camera = camera;
            this._fov = fov;
            this._near = near;
            this._far = far;

            let strategy = camera.projectionStrategy;
            if (strategy instanceof bg.scene.PerspectiveProjectionStrategy) {
                this._prevFov = strategy.fov;
                this._prevNear = strategy.near;
                this._prevFar = strategy.far;
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._prevFov===undefined) {
                    reject(new Error("Error executing SavePerspective command: the target camera is not configured with a PerspectiveProjectionStrategy"));
                }
                this._camera.projectionStrategy.fov = this._fov;
                this._camera.projectionStrategy.near = this._near;
                this._camera.projectionStrategy.far = this._far;
                this._camera.recalculateGizmo();
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                if (this._prevFov===undefined) {
                    reject(new Error("Error executing SavePerspective command: the target camera is not configured with a PerspectiveProjectionStrategy"));
                }
                this._camera.projectionStrategy.fov = this._prevFov;
                this._camera.projectionStrategy.near = this._prevNear;
                this._camera.projectionStrategy.far = this._prevFar;
                this._camera.recalculateGizmo();
                resolve();
            });
        }
    }

    app.cameraCommands.SavePerspective = SavePerspective;

    class SaveLens extends app.Command {
        constructor(camera,focalLength,frameSize,near,far) {
            super();
            this._camera = camera;
            this._focalLength = focalLength;
            this._frameSize = frameSize;
            this._near = near;
            this._far = far;

            let strategy = camera.projectionStrategy;
            if (strategy instanceof bg.scene.OpticalProjectionStrategy) {
                this._prevFocalLength = strategy.focalLength;
                this._prevFrameSize = strategy.frameSize;
                this._prevNear = strategy.near;
                this._prevFar = strategy.far;
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._prevFrameSize===undefined) {
                    reject(new Error("Error executing SaveLens command: the target camera is not configured with a OpticalProjectionStrategy"));
                }
                this._camera.projectionStrategy.focalLength = this._focalLength;
                this._camera.projectionStrategy.frameSize = this._frameSize;
                this._camera.projectionStrategy.near = this._near;
                this._camera.projectionStrategy.far = this._far;
                this._camera.recalculateGizmo();
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                if (this._prevFrameSize===undefined) {
                    reject(new Error("Error executing SaveLens command: the target camera is not configured with a OpticalProjectionStrategy"));
                }
                this._camera.projectionStrategy.focalLength = this._prevFocalLength;
                this._camera.projectionStrategy.frameSize = this._prevFrameSize;
                this._camera.projectionStrategy.near = this._prevNear;
                this._camera.projectionStrategy.far = this._prevFar;
                this._camera.recalculateGizmo();
                resolve();
            });
        }
    }

    app.cameraCommands.SaveLens = SaveLens;



    class SaveOrthographic extends app.Command {
        constructor(camera,viewWidth,far) {
            super();
            this._camera = camera;
            this._viewWidth = viewWidth;
            this._far = far;

            let strategy = camera.projectionStrategy;
            if (strategy instanceof bg.scene.OrthographicProjectionStrategy) {
                this._prevViewWidth = strategy.viewWidth;
                this._prevFar = strategy.far;
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (this._prevViewWidth===undefined) {
                    reject(new Error("Error executing SavePerspective command: the target camera is not configured with a OrthographicProjectionStrategy"));
                }
                this._camera.projectionStrategy.viewWidth = this._viewWidth;
                this._camera.projectionStrategy.far = this._far;
                this._camera.recalculateGizmo();
                resolve();
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                if (this._prevViewWidth===undefined) {
                    reject(new Error("Error executing SavePerspective command: the target camera is not configured with a OrthographicProjectionStrategy"));
                }
                this._camera.projectionStrategy.viewWidth = this._prevViewWidth;
                this._camera.projectionStrategy.far = this._prevFar;
                this._camera.recalculateGizmo();
                resolve();
            });
        }
    }

    app.cameraCommands.SaveOrthographic = SaveOrthographic;




    class SetMain extends app.Command {
        constructor(camera) {
            super();
            this._camera = camera;
            this._prevMain = app.render.Scene.Get().camera;
        }

        execute() {
            return new Promise((resolve) => {
                app.render.Scene.Get().camera = this._camera;
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                app.render.Scene.Get().camera = this._prevMain;
                resolve();
            })
        }
    }

    app.cameraCommands.SetMain = SetMain;
})