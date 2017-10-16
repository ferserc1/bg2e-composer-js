app.addDefinitions(() => {
    class Command {
        execute() {

        }

        undo() {

        }
    }

    class ContextCommand extends Command {
        constructor(gl) {
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

        }

        undo() {

        }

        redo() {

        }
    }

    app.Command = Command;
    app.ContextCommand = ContextCommand;
    app.CommandManager = CommandManager;
})