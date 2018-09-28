
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

            // There are problems in Windows platform, when the user have OneDrive configured
            // as the document folder, so in Windows, the documents folder is userData folder
            if (process.platform=='win32') {
                this._paths.documents = this.electronApp.getPath('userData');
            }

            if (!fs.existsSync(this._paths.temp)) {
                fs.mkdir(this._paths.temp,() => {
                    
                });
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
            if (BG2E_COMPOSER_DEBUG) {
                this._resourcesDir = path.join(__dirname,"data");
            }
            else {
                this._resourcesDir = path.resolve(path.join(__dirname, `..${ path.sep }..${ path.sep }data`));
            }
        }
        return this._resourcesDir;
    }

    get config() {
        return require(__dirname + "/config.json");
    }

    requireHeaderScript(file) {
        if (!this.isRenderer) {
            throw new Error("App::requireHeaderScript() can only be called from the renderer process.");
        }

        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.src = file;
        script.type = "text/javascript";
        script.async = false;
        head.appendChild(script);
    }

    requireSources(folderPath) {
        if (!this.isRenderer) {
            throw new Error("App::requireSources() can only be called from the renderer process.");
        }

        let srcDir = fs.readdirSync(folderPath);
        srcDir.sort((a,b) => {
            if (a<b) return -1;
            else return 1;
        });
        srcDir.forEach((sourceFile) => {
            let filePath = path.join(folderPath,sourceFile);
            if (sourceFile.split(".").pop()=='js') {
                this.requireHeaderScript(filePath);
            }
            else if (fs.statSync(filePath).isDirectory()) {
                this.requireSources(filePath);
            }
        });
    }

    requireStylesheets() {
        if (!this.isRenderer) {
            throw new Error("App::requireStylesheets() can only be called from the renderer process.");
        }

        let templatePath = __dirname + '/templates/' + this.config.templateName + '/styles';
        let dirContents = fs.readdirSync(templatePath);
        let head = document.getElementsByTagName('head')[0];
        dirContents.forEach((fileName) => {
            let filePath = path.join(templatePath, fileName);
            if (filePath.split('.').pop()=='css') {
                let link = document.createElement('link');
                link.rel = "stylesheet";
                link.href = filePath;
                head.appendChild(link);
            }
        })
    }
}


module.exports = new AppClass();
