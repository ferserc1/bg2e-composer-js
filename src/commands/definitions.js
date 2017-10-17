app.addDefinitions(() => {
    class Command {
        execute() {
            return Promise.resolve();
        }

        undo() {
            return Promise.resolve();
        }
    }

    class ContextCommand extends Command {
        constructor(gl) {
            super();
            this.gl = gl;
        }
    }

    let g_commandManager = null;
    class CommandManager {
        static Get() {
            if (!g_commandManager) {
                g_commandManager = new CommandManager();
            }
            return g_commandManager;
        }

        constructor() {
            this._undoStack = [];
            this._redoStack = [];
        }

        doCommand(cmd) {
            return new Promise((resolve,reject) => {
                if (this._redoStack.length) {
                    this._redoStack = [];
                }
                cmd.execute()
                    .then(() => {
                        this._undoStack.push(cmd);
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }

        undo() {
            return new Promise((resolve,reject) => {
                let cmd = this._undoStack.pop();
                if (cmd) {
                    cmd.undo()
                        .then(() => {
                            this._redoStack.push(cmd);
                            resolve();
                        })

                        .catch((err) => {
                            this._redoStack = [];
                            reject(err);
                        });
                }
                else {
                    resolve();
                }
            })
        }

        redo() {
            // TODO: Implement rendo
            return new Promise((resolve,reject) => {
                let cmd = this._redoStack.pop();
                if (cmd) {
                    cmd.execute()
                        .then(() => {
                            this._undoStack.push(cmd);
                            resolve();
                        })
                        
                        .catch((err) => {
                            this._undoStack = [];
                            reject(err);
                        });
                }
                else {
                    resolve();
                }
            })
        }
    }

    app.Command = Command;
    app.ContextCommand = ContextCommand;
    app.CommandManager = CommandManager;
});

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
});
