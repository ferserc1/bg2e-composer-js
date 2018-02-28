
const path = require('path');
const fs = require('fs');


const Plugins = require(__dirname + '/plugins').Plugins;

class AppClass {
    get electronApp() {
        if (this.isRenderer) {
            const remote = require('electron').remote;
            return remote.app;
        }
        else {
            return require('electron').app;
        }
    }

    get isRenderer() {
        return process && process.type=='renderer';
    }

    get isMain() {
        return !this.isRenderer;
    }

    get appPath() {
        if (!this._appPath) {
            this._appPath = this.electronApp.getAppPath().split(path.sep);
            this._appPath.pop();
            this._appPath = this._appPath.join(path.sep);
        }
        return this._appPath; 
    }

    get paths() {
        if (!this._paths) {
            this._paths = {
                home: this.electronApp.getPath('home'),
                userData: this.electronApp.getPath('userData'),
                temp: path.join(this.electronApp.getPath('temp'),'composer'),
                desktop: this.electronApp.getPath('desktop'),
                documents: this.electronApp.getPath('documents'),
                downloads: this.electronApp.getPath('downloads')
            }

            if (!fs.existsSync(this._paths.temp)) {
                fs.mkdir(this._paths.temp);
            }
        }
        return this._paths;
    }

    get plugins() {
        if (!this._plugins) {
            this._plugins = new Plugins(this);
        }
        return this._plugins;
    }

    get resourcesDir() {
        if (!this._resourcesDir) {
            this._resourcesDir = path.resolve(path.join(__dirname, `..${ path.sep }..${ path.sep }data`));
        }
        return this._resourcesDir;
    }
}


module.exports = new AppClass();
