
app.addDefinitions(() => {
    let s_handlers = {};

    class CommandHandler {
        static RegisterHandler(handler) {
            handler.getMessages().forEach((msg) => {
                s_handlers[msg] = handler;
            });
        }

        static Trigger(message,params) {
            if (s_handlers) {
                s_handlers[message].execute(message,params);
            }
        }

        constructor() {
            CommandHandler.RegisterHandler(this);
        }

        getMessages() { return []; }
        execute(message, params) {}
    }

    app.CommandHandler = CommandHandler;
})