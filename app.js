
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

    get skinsDir() {
        if (!this._skinsDir) {
            if (BG2E_COMPOSER_DEBUG) {
                this._skinsDir = path.join(__dirname,"skins");
            }
            else {
                this._skinsDir = path.resolve(path.join(__dirname, `..${ path.sep }..${ path.sep }skins`));
            }
        }
        return this._skinsDir;
    }

    get skins() {
        let skins = fs.readdirSync(this.skinsDir);
        let result = [];
        if (skins) {
            skins.forEach((skin) => {
                let fullPath = path.join(this.skinsDir, skin);
                let parsedPath = path.parse(fullPath);
                if (parsedPath.ext==".css") {
                    result.push({
                        name: parsedPath.name,
                        path: path.join(fullPath)
                    });
                }
            });
        }
        return result;
    }

    get currentSkin() {
        let skins = this.skins;
        if (!this._currentSkin) {
            this._currentSkin = 0;
        }
        return this._currentSkin<skins.length ? this.skins[this._currentSkin] : null;
    }

    set currentSkin(skin) {
        try {
            let skinIndex = -1;
            let skins = this.skins;
            let name = "";
            switch (typeof(skin)) {
            case "string":
                name = skin;
                break;
            case "object":
                name = skin.name;
                break;
            case "number":
                skinIndex = skin;
                break;
            }
            if (skinIndex == -1) {
                skins.some((s,i) => {
                    if (s.name==name) {
                        skinIndex = i;
                        return true;
                    }
                });
            }
    
            if (skinIndex!=-1) {
                skin = skins[skinIndex];
                this._currentSkin = skinIndex;
                if (this._styleLinkTag) {
                    document.head.removeChild(this._styleLinkTag);
                }
                this._styleLinkTag = document.createElement('link')
                this._styleLinkTag.rel = "stylesheet";
                this._styleLinkTag.href = skin.path;
                document.head.appendChild(this._styleLinkTag);
                app.settings.set("ui.skin",skin.name);
            }
        }
        catch(err) {
            console.error("Could not set default skin. Maybe the skin is missing?");
            console.error("No such skin at path " + this.skinsDir);
        }
    }

    restoreSkin() {
        this.currentSkin = app.settings.get("ui.skin") || "dark";
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
