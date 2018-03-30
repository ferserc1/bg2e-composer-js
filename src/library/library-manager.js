
app.addSource(() => {
    app.library = app.library || {};
    let g_manager = null;
    const path = requrie('path');


    class Manager {
        static Get() {
            if (!g_manager) {
                g_manager = new Manager();
            }
            return g_manager;
        }

        constructor() {
            this._currentLibrary = new app.library.Library(this.defaultLibraryPath);
            this._observers = {};
        }

        get current() { return this._currentLibrary; }

        get defaultLibraryPath() { return path.join(app.paths.documents,"composer/library.json"); }

        newLibrary(path) {

        }

        open(path) {

        }

        save() {
            
        }

        saveAs(path) {

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