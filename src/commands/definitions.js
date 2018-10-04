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

    let g_lockedMessage = "You can't change the scene during physics simulation.";
    function showLockedMessage() {
        console.error(g_lockedMessage);
        alert(g_lockedMessage);
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

            this._locked = false;
        }

        get locked() { return this._locked; }

        set locked(l) {
            this._locked = l;
            app.trigger('commandLockChanged', { locked: l });
        }

        get sceneChanged() {
            return this._undoStack.length>0;
        }

        clear() {
            if (this.locked) {
                showLockedMessage();
            }
            else {
                this._undoStack = [];
                this._redoStack = [];
            }
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
            if (this.locked) {
                showLockedMessage();
                
                return Promise.reject(new Error(g_lockedMessage));
            }

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
                        console.error(err.message);
                        reject(err);
                    });
            });
        }

        undo() {
            if (this.locked) {
                showLockedMessage();
                return Promise.reject(new Error(g_lockedMessage));
            }

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
                            console.error(err.message);
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
            if (this.locked) {
                showLockedMessage();
                return Promise.reject(new Error(g_lockedMessage));
            }

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
                            console.error(err.message);
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


    let g_shorcutManager = null;
    class ShortcutManager {
        static Get() {
            if (!g_shorcutManager) {
                g_shorcutManager = new ShortcutManager();
            }
            return g_shorcutManager;
        }

        constructor() {
            this._shortcuts = {};
        }

        addShortcut(shortcut) {
            if (this._shortcuts[shortcut.key]) {
                console.warn(`Mapping shortcut twice: key ${ shortcut.key } is used to execute the command ${ this._shortcuts[shortcut.key].name }`)
            }
            this._shortcuts[shortcut.key] = shortcut;
        }

        processKey(keyboardEvent) {
            let shortcut = this._shortcuts[keyboardEvent.key];
            if (shortcut) {
                shortcut.execute();
                return true;
            }
            else {
                return false;
            }
        }
    }

    class Shortcut {
        constructor(name, key, fn) {
            this._name = name;
            this._key = key;
            this._fn = fn;
        }

        get name() { return this._name; }
        get key() { return this._key; }
        get fn() { return this._fn; }

        execute() {
            this._fn();
        }
    }

    app.Command = Command;
    app.ContextCommand = ContextCommand;
    app.CommandManager = CommandManager;
    app.ShortcutManager = ShortcutManager;
    app.Shortcut = Shortcut;
});

app.addDefinitions(() => {
    let s_handlers = {};
    let s_allHandlers = [];

    class CommandHandler {
        static RegisterHandler(handler) {
            s_allHandlers.push(handler);
            handler.getMessages().forEach((msg) => {
                s_handlers[msg] = handler;
            });
        }

        static Trigger(message,params) {
            if (s_handlers) {
                s_handlers[message].execute(message,params);
            }
        }

        static Get(className) {
            let result = null;
            s_allHandlers.some((ch) => {
                if (ch.constructor.name==className) {
                    result = ch;
                }
                return result!=null;
            });
            return result;
        }

        constructor() {
            CommandHandler.RegisterHandler(this);
        }

        getMessages() { return []; }
        execute(message, params) {}
    }

    app.CommandHandler = CommandHandler;
});

app.addDefinitions(() => {
    let g_consoleCommands = {};

    class Console {
        registerCommand(commandName, commandClass) {
            g_consoleCommands[commandName] = commandClass;
        }

        exec(commandText) {
            let commandTokens = commandText.split(" ");
            let command = commandTokens[0];
            let params = commandTokens.length>1 ? commandTokens.slice(1,commandTokens.length) : [];
            params = params.join(",");
            let commandClass = g_consoleCommands[command];
            let execString = `
                app.CommandManager.Get().doCommand(
                    new ${ commandClass }(${ params })
                )
                .then(() => app.ComposerWindowController.Get().updateView());
            `;

            try {
                eval(execString);
            }
            catch(err) {
                console.error(err.message);
            }

        }
    }

    app.console = new Console();

})
