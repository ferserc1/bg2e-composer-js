app.addSource(() => {

    function executeDynamics(cb) {
        let findDynamics = new bg.scene.FindComponentVisitor("bg.scene.Dynamics")
        app.render.Scene.Get().root.accept(findDynamics);
        findDynamics.result.forEach((dyn) => {
            cb(dyn.dynamics);
        });
    }

    class PhysicsCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                "play",
                "pause",
                "stop"
            ];
        }

        execute(message,params) {
            switch (message) {
            case 'play':
                this.play();
                break;
            case 'pause':
                this.pause();
                break;
            case 'stop':
                this.stop();
                break;
            }
        }

        // TODO: Lock UI: lock the user interface to prevent changes in scene during the 
        // physics playbac.
        // Create a "Lock" mode in CommandHandler that returns an error if a command is executed
        // while the command handler is locked
        play() {
            // TODO: Lock scene
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO;
            executeDynamics((dyn) => dyn.play());
        }

        pause() {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
            executeDynamics((dyn) => dyn.pause());
        }

        stop() {
            // TODO: Unlock scene
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
            executeDynamics((dyn) => {
                dyn.stop();
                dyn.restore();
            });
        }
    }

    new PhysicsCommandHandler();
});