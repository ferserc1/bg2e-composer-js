
const path = require('path');
const fs = require('fs');

let g_plugins = [];
let g_menus = [];

class Plugins {
    constructor(app) {
        this._app = app;
        let composerPluginsPath = "";
        if (/darwin/i.test(process.platform)) {
            composerPluginsPath = path.resolve(path.join(app.appPath,"../../../composer-plugins"));
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
        const settings = require('electron-settings');
        this._customPath = settings.get("customPluginPath");

        // customPluginPath may be a string if Composer is updated from
        // a previous version
        if (typeof(this._customPath) == "string") {
            this._paths.push(this._customPath);

            // Update plugin path settings to be an array
            this._customPath = [ this._customPath ];
            app.settings.set("customPluginPath",this._customPath);
        }
        else if (Array.isArray(this._customPath)) {
            this._customPath.forEach((p) => {
                this._paths.push(p);
            })
        }
        else if (!this._customPath) {
            this._customPath = [];
            app.settings.set("customPluginPath",this._customPath);
        }

        if (app.isRenderer) {
            this._modules = [];
        }

        this._pluginSources = [];

        // Remove duplicated paths
        let visitedPaths = [];
        this._paths = this._paths.filter((p) => {
            p = p.replace(/\\/g,"/");
            if (visitedPaths.indexOf(p) == -1) {
                visitedPaths.push(p);
                return true;
            }
            else {
                return false;
            }
        });

        this._paths.forEach((pluginPath) => {
            if (fs.existsSync(pluginPath)) {
                visitedPaths.push(pluginPath);
                fs.readdirSync(pluginPath).forEach((plugin) => {
                    try {
                        let fullPluginPath = path.join(pluginPath,plugin);
                        let stat = fs.statSync(fullPluginPath);
                        if (stat.isDirectory) {
                            let source = path.join(fullPluginPath,"src");
                            if (fs.existsSync(source)) {
                                stat = fs.statSync(source);
                                if (stat.isDirectory) {
                                    this._pluginSources.push(source);
                                }
                            }
        
                            let pluginSources = path.join(fullPluginPath,"plugin");
                            if (fs.existsSync(pluginSources)) {
                                stat = fs.statSync(pluginSources);
                                if (stat.isDirectory) {
                                    fs.readdirSync(pluginSources).forEach((pluginFile) => {
                                        if (pluginFile.split(".").pop()=="js") {
                                            g_plugins.push(path.join(pluginSources,pluginFile));
                                        }
                                    })
            
                                }
                            }

                            let menuPath = path.join(fullPluginPath,"menu.js");
                            if (fs.existsSync(menuPath)) {
                                g_menus.push(menuPath);
                            }
                        }
                    }
                    catch(e) {
                        console.warn(e.message);
                    }
                })
            }
        });
    }

    requireSources() {
        if (!this._app.isRenderer) {
            throw new Error("Plugin::requireSources() can only be called from the renderer process");
        }

        // TODO: requireSources from this._pluginSources
        this._pluginSources.forEach((src) => {
            this._app.requireSources(src);
        })
    }

    get paths() {
        return this._paths;
    }

    get customPaths() {
        return this._customPath;
    }

    addCustomPath(p) {
        if (!Array.isArray(this._customPath)) {
            // This should never happen
            this._customPath = [ p ];
        }
        else if (this._customPath.indexOf(p) == -1) {
            this._customPath.push(p);
        }
        app.settings.set("customPluginPath",this._customPath);
    }

    removeCustomPath(p) {
        if (!Array.isArray(this._customPath)) {
            // This should never happen
            console.warn("Unexpected configuration error: outdated plugin search path format.");
        }
        else {
            let i = this._customPath.indexOf(p);
            if (i != -1) {
                this._customPath.splice(i, 1);
                app.settings.set("customPluginPath",this._customPath);
                return true;
            }
            else {
                return false;
            }
        }
    }

    get modules() {
        return this._modules;
    }

    get menus() {
        let fullMenu = [];
        g_menus.forEach((menuModulePath) => {
            let module = require(menuModulePath);
            if (module.getMenu) {
                let menu = module.getMenu();
                fullMenu.push(menu);
            }
        });
        return fullMenu;
    }

    find(pluginFolder) {
        let result = null;
        this._paths.some((item) => {
            let fullPath = path.join(item,pluginFolder);
            if (fs.existsSync(fullPath)) {
                result = fullPath;
            }
            return result!=null;
        });
        return result;
    }

    requirePlugins(app,angular,bg) {
        if (!this._app.isRenderer) {
            throw new Error("requirePlugins() function can only be called from the renderer process.");
        }

        let angularApp = angular.module(GLOBAL_APP_NAME);
        g_plugins.forEach((filePath) => {
            let templates = filePath.replace(/\\/g,'/');            
            templates = templates.split('/');
            templates.pop();
            templates.pop();
            templates.push("templates");
            templates = templates.join("/");
            let pluginModule = require(filePath)(app,angularApp,bg,templates);
            this._modules.push(pluginModule);
        });
    }

    buildMenus() {
        if (this._app.isRenderer) {
            throw new Error("buildMenus() function can only be called from the main process.");
        }

        
    }



    /*
       function requirePlugins() {
        const { remote } = require('electron');
        const { Menu, MenuItem } = remote;

        function findMenuItem(label) {
            let item = null;
            Menu.getApplicationMenu().items.some((i) => {
                item = i.label==label ? i : null;
                return item!=null;
            })
            return item;
        }

        let angularApp = angular.module(GLOBAL_APP_NAME);
        let mainMenu = Menu.getApplicationMenu();
        g_plugins.forEach((filePath) => {
            let pluginModule = require(filePath)(app,angularApp,bg);
            app.plugins.modules.push(pluginModule);

            if (pluginModule.menu) {
                let menu = pluginModule.menu;
                let parentMenu = findMenuItem(menu.label);
                if (!parentMenu) {
                    parentMenu = new MenuItem({ label:menu.label, submenu:[] });
                    mainMenu.insertSubMenu(mainMenu.items.length - 1, parentMenu);
                }

                if (parentMenu) {
                    menu.menu.forEach((menuItemData) => {
                        let menuItem = new MenuItem(menuItemData);
                        parentMenu.submenu.append(menuItem);    
                    });
                }
                //console.log('add menu');
            }
            
        })
    }
    */
}

module.exports = {
    Plugins: Plugins
}
