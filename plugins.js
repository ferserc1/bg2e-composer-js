
const path = require('path');
const fs = require('fs');

class Plugins {
    constructor(app) {
        let composerPluginsPath = "";
        if (/darwin/i.test(process.platform)) {
            composerPluginsPath = path.resolve(path.join(app.appPath,"../../composer-plugins"));
        }
        else if (/win/i.test(process.platform)) {
            composerPluginsPath = path.resolve(path.join(app.appPath,"..\\composer-plugins"));
        }
        this._paths = [
            path.join(app.appPath,'plugins'),
            composerPluginsPath,
            path.join(__dirname, 'plugins'),
            path.resolve(path.join(__dirname,`..${ path.sep }composer-plugins`))
        ];

        if (app.isRenderer) {
            this._modules = [];
        }
    }

    get paths() {
        return this._paths;
    }

    get modules() {
        return this._modules;
    }

    find(pluginFolder) {
        let result = null;
        this._paths.some((item) => {
            let fullPath = path.join(item,pluginFolder);
            if (fs.existsSync(fullPath)) {
                result = fullPath;
            }
            return result;
        });
    }
}

module.exports = {
    Plugins: Plugins
}
