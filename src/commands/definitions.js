app.addDefinitions(() => {
    class Command {
        constructor() {
            this._undoable = true;
            this._clearCommandHistory = false;
        }

        execute() {
            return Promise.resolve();
        }

        undo() {
            return Promise.resolve();
        }

        get undoable() { return this._undoable; }
        get clearCommandHistory() { return this._clearCommandHistory; }
    }

    class ContextCommand extends Command {
        constructor(gl) {
            super();
            this.gl = gl;
        }
    }

    let g_commandManager = null;
    function callObservers(observers) {
        for (let key in observers) {
            observers[key]();
        }
    }

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

            this._doObservers = {};
            this._undoObservers = {};
            this._redoObservers = {};
        }

        get sceneChanged() {
            return this._undoStack.length>0;
        }

        clear() {
            this._undoStack = [];
            this._redoStack = [];
        }

        onDoCommand(observerName,callback) {
            this._doObservers[observerName] = callback;
        }

        onUndo(observerName,callback) {
            this._undoObservers[observerName] = callback;
        }

        onRedo(observerName,callback) {
            this._redoObservers[observerName] = callback;
        }

        doCommand(cmd) {
            return new Promise((resolve,reject) => {
                if (this._redoStack.length) {
                    this._redoStack = [];
                }
                cmd.execute()
                    .then(() => {
                        if (cmd.undoable) {
                            this._undoStack.push(cmd);
                        }
                        if (cmd.clearCommandHistory) {
                            this._undoStack = [];
                            this._redoStack = [];
                        }
                        callObservers(this._doObservers);
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
                            callObservers(this._undoObservers);
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
            return new Promise((resolve,reject) => {
                let cmd = this._redoStack.pop();
                if (cmd) {
                    cmd.execute()
                        .then(() => {
                            this._undoStack.push(cmd);
                            callObservers(this._redoObservers);
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
