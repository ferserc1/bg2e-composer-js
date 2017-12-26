var app = app || {};
var GLOBAL_APP_NAME = "";

var BG2E_COMPOSER_RELEASE = BG2E_COMPOSER_RELEASE || false;
var BG2E_COMPOSER_DEBUG = !BG2E_COMPOSER_RELEASE;

(function() {
    let fs = require("fs");
    let path = require("path");
    const settings = require('electron-settings');

    let remote = require("electron").remote;
    let electronApp = remote.app;
    
    app.appPath = electronApp.getAppPath().split(path.sep);
    app.appPath.pop();
    app.appPath = app.appPath.join(path.sep);
    app.appPath = path.resolve(path.join(app.appPath,'..'));
    
    let composerPluginsPath = "";
    if (/darwin/i.test(process.platform)) {
        // composer-plugins folder in the same folder as Composer.app bundle
        composerPluginsPath = path.resolve(path.join(app.appPath,"../../composer-plugins"));
    }
    else if (/win/i.test(process.platform)) {
        // composer-plugins folder in the same folder as composer application directory
        composerPluginsPath = path.resolve(path.join(app.appPath,"..\\composer-plugins"));
    }

    app.plugins = {
        paths:[
            path.join(app.appPath, 'plugins'),
            composerPluginsPath,
            path.join(__dirname, 'plugins'),
            path.resolve(path.join(__dirname,`..${ path.sep}composer-plugins`))
        ],
        modules:[]
    };
    app.resourcesDir = path.resolve(path.join(__dirname, `..${ path.sep }..${ path.sep }data`));

    app.plugins.find = function(pluginFolder) {
        let result = null;
        app.plugins.paths.some((item) => {
            let fullPath = path.join(item,pluginFolder);
            if (fs.existsSync(fullPath)) {
                result = fullPath;
            }
            return result!=null;
        });
        return result;
    };

    let g_appDefines = [];
    let g_appSource = [];
    let g_workspaces = [];
    let g_plugins = [];
    let g_evtObservers = {};
    let g_copyright = [];

    app.angular = {
        deps: [
            "ngRoute",
            "rzModule"
        ]
    };
    // Replace \ by / in Windows paths C:\ >>>> C:/
    app.standarizePath = function(path) {
        return path.replace(/\\/g,'/');
    };

    app.config = require(__dirname + "/config.json");
    GLOBAL_APP_NAME = app.config.appName;

    function requireHeadScript(file) {
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.src = file;
        script.type = "text/javascript";
        script.async = false;
        head.appendChild(script);
    }

    function requireSources(folderPath) {
        let srcDir = fs.readdirSync(folderPath);
        srcDir.sort((a,b) => {
            if (a<b) return -1;
            else return 1;
        });
        srcDir.forEach((sourceFile) => {
            let filePath = path.join(folderPath,sourceFile);
            if (sourceFile.split(".").pop()=='js') {
                requireHeadScript(filePath);
            }
            else if (fs.statSync(filePath).isDirectory()) {
                requireSources(filePath);
            }
        });
    }

    function requireStylesheets() {
        let templatePath = __dirname + '/templates/' + app.config.templateName + '/styles';
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

    function requirePlugins() {
        g_plugins.forEach((filePath) => {
            let pluginModule = require(filePath)(app,GLOBAL_APP_NAME,bg);
            app.plugins.modules.push(pluginModule);
        })
    }

    
    app.addDefinitions = function(callback) {
        g_appDefines.push(callback);
    };
    
    app.addSource = function(callback) {
        g_appSource.push(callback);
    };

    app.addWorkspace = function(callback) {
        g_workspaces.push(callback);
    };

    app.addCopyright = function(title,link,paragraphs) {
        if (typeof(paragraphs)=='string') {
            paragraphs = [paragraphs];
        }
        g_copyright.push(
            {
                title:title,
                link:link,
                paragraphs:paragraphs
            }
        )
    }

    app.configureWorkspaceElement = function(element) {
        element.attr('class','bg2-widget');
    };

    app.workspaceElementCompile = function() {
        return function(element) {
            app.configureWorkspaceElement(element);
        };
    };

    app.trigger = function(evt, params) {
        setTimeout(() => {
            for (var key in g_evtObservers[evt]) {
                g_evtObservers[evt][key](params);
            }
        },10);
    };

    app.on = function(event,observerId,callback) {
        g_evtObservers[event] = g_evtObservers[event] || {};
        g_evtObservers[event][observerId] = callback;
    };

    app.settings = {
        get: function(property) {
            return settings.get(property);
        },

        set: function(property,value) {
            settings.set(property,value);
        },

        has: function(property) {
            return settings.has(property);
        }
    };

    Object.defineProperty(app,'copyrightNotices', {
        get: function() { return g_copyright; }
    });

    loadLog();
    
    if (BG2E_COMPOSER_DEBUG) {
        // Debug mode: require scripts
        requireSources(__dirname + '/src');
    }
    requireStylesheets();

    console.log("Plugin folders:");
    app.plugins.paths.forEach((p) => {
        console.log("  " + p);
    });
    console.log("Data path: " + app.resourcesDir);

    app.plugins.paths.forEach((pluginPath) => {
        if (fs.existsSync(pluginPath)) {
            fs.readdirSync(pluginPath).forEach((plugin) => {
                let fullPluginPath = path.join(pluginPath,plugin);
                let stat = fs.statSync(fullPluginPath);
                if (stat.isDirectory) {
                    let source = path.join(fullPluginPath,"src");
                    if (fs.existsSync(source)) {
                        stat = fs.statSync(source);
                        if (stat.isDirectory) {
                            requireSources(source);
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
                }
            })
        }
    });

    setTimeout(() => loadApp(), 100);

    const {ipcRenderer} = require('electron');
    ipcRenderer.on('triggerMenu', (event,arg) => {
        app.CommandHandler.Trigger(arg.msg,arg);
    });
    

    ////// Functions
    function loadLog() {
        // The log class is defined here, because we need to capture all the console messages
        app.ui = app.ui || {};
        
        app.ui.LogLevel = {
            INFO:"info",
            WARNING:"warning",
            ERROR:"error"
        };
    
        let g_log = null;
        class Log {
            static Get() {
                if (!g_log) {
                    g_log = new Log();
                }
                return g_log;
            }
    
            constructor() {
                console.__log = console.log;
                console.__warn = console.warn;
                console.__error = console.error;
                this._messages = [];
                this._observers = {};
                console.log = function(message,showDialog) {
                    Log.Get().log(message,app.ui.LogLevel.INFO,showDialog);
                };
                console.warn = function(message,showDialog) {
                    Log.Get().log(message,app.ui.LogLevel.WARNING,showDialog);
                };
                console.error = function(message,showDialog) {
                    Log.Get().log(message,app.ui.LogLevel.ERROR,showDialog);
                };
            }
    
            get messages() {
                return this._messages;
            }
    
            get lastMessageData() {
                let l = this._messages.length;
                if (l) {
                    return this._messages[l-1];
                }
                else {
                    return {
                        text:"",
                        level:"info"
                    }
                }
            }
    
            get lastMessage() { return this.lastMessageData.text; }
            get lastLevel() { return this.lastMessageData.level; }
    
            log(message,level=app.ui.LogLevel.INFO,showDialog=false) {
                let dialogType = "";
                switch (level) {
                case app.ui.LogLevel.INFO:
                    if (console.__log) console.__log(message);
                    dialogType = 'info';
                    break;
                case app.ui.LogLevel.WARNING:
                    if (console.__warn) console.__warn(message);
                    dialogType = 'warning';
                    break;
                case app.ui.LogLevel.ERROR:
                    if (console.__error) console.__error(message);
                    dialogType = 'error';
                    break;
                }
                
                this._messages.push({
                    text:message,
                    level:level
                });
                this.notifyLogChanged();

                if (showDialog) {
                    let { dialog } = require('electron').remote;

                    dialog.showMessageBox({
                        type: dialogType,
                        buttons: ['Ok'],
                        title: 'bg2 Engine Composer',
                        message: message
                    }, function (response) {
                    });
                }
            }
    
            logChanged(observer,callback) {
                this._observers[observer] = callback;
            }
    
            notifyLogChanged() {
                for (let key in this._observers) {
                    this._observers[key]();
                }
            }
        }
    
        app.ui.Log = Log;
    
        // Initialize log
        Log.Get();
    }
    
    function loadApp() {
        let ng = angular.module(GLOBAL_APP_NAME, app.angular.deps);

        requirePlugins();
        
        g_appDefines.forEach((cb) => cb());
        g_appSource.forEach((cb) => cb());
        

        ng.config(['$routeProvider', function($routeProvider) {
            let defaultWorkspace = null;
            g_workspaces.forEach((cb) => {
                let workspaceData = cb();
                $routeProvider.when(workspaceData.endpoint, {
                    templateUrl: workspaceData.templateUrl,
                    controller: workspaceData.controller
                });
                if (workspaceData.isDefault) {
                    defaultWorkspace = workspaceData;
                }
            });
            if (defaultWorkspace) {
                $routeProvider.otherwise({
                    redirectTo: defaultWorkspace.endpoint
                });
            }
        }]);

        angular.bootstrap(document, [ GLOBAL_APP_NAME ]);
    };
})();