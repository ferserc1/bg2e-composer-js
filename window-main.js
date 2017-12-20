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
        composerPluginsPath = path.resolve(path.join(app.appPath,"../composer-plugins"));
    }

    app.plugins = {
        paths:[
            path.join(app.appPath, '/plugins'),
            composerPluginsPath,
            __dirname + '/plugins',
            path.resolve(path.join(__dirname,'../composer-plugins'))
        ]
    };

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
    let g_evtObservers = {};

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

    
    app.addDefinitions = function(callback) {
        g_appDefines.push(callback);
    };
    
    app.addSource = function(callback) {
        g_appSource.push(callback);
    };

    app.addWorkspace = function(callback) {
        g_workspaces.push(callback);
    };

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
    
    function loadApp() {
        let ng = angular.module(GLOBAL_APP_NAME, app.angular.deps);

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
 
    if (BG2E_COMPOSER_DEBUG) {
        // Debug mode: require scripts
        requireSources(__dirname + '/src');
    }
    requireStylesheets();

    setTimeout(() => loadApp(), 100);

    const {ipcRenderer} = require('electron');
    ipcRenderer.on('triggerMenu', (event,arg) => {
        app.CommandHandler.Trigger(arg.msg,arg);
    });
    
})();