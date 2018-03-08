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

        play() {
            app.CommandManager.Get().locked = true;
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO;
            executeDynamics((dyn) => dyn.play());
        }

        pause() {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
            executeDynamics((dyn) => dyn.pause());
        }

        stop() {
            app.CommandManager.Get().locked = false;
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
            executeDynamics((dyn) => {
                dyn.stop();
                dyn.restore();
            });
        }
    }

    new PhysicsCommandHandler();
});