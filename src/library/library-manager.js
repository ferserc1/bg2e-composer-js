
app.addSource(() => {
    app.library = app.library || {};
    let g_manager = {};
    const path = require('path');


    class Manager {
        static Get(mode) {
            if (!mode) {
                throw new Error("Error getting library manager: no mode specified")
            }
            if (!g_manager[mode]) {
                g_manager[mode] = new Manager();
            }
            return g_manager[mode];
        }

        constructor() {
            this._currentLibrary = new app.library.Library(this.defaultLibraryPath);
            this._observers = {};
        }

        get current() { return this._currentLibrary; }

        get defaultLibraryPath() { return path.join(app.paths.documents,"composer/library.json"); }

        newLibrary(path) {
            this._currentLibrary = new app.library.Library(path);
            this.notifyLibraryChanged();
            return Promise.resolve(true);
        }

        open(path) {
            this._currentLibrary = new app.library.Library(path);
            this.notifyLibraryChanged();
            return Promise.resolve(true);
        }

        reload() {
            return this.open(this._currentLibrary.filePath);
        }

        libraryChanged(observerId,callback) {
            this._observers[observerId] = callback;
        }

        notifyLibraryChanged() {
            for (let key in this._observers) {
                this._observers[key](this.current);
            }
        }
    }

    app.library.Manager = Manager;
})