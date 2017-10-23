var app = app || {};
var GLOBAL_APP_NAME = "";

(function() {
    let fs = require("fs");
    let path = require("path");

    let g_appDefines = [];
    let g_appSource = [];
    let g_workspaces = [];

    app.angular = {
        deps: [
            "ngRoute"
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
        head.appendChild(script);
    }

    function requireSources(folderPath) {
        let srcDir = fs.readdirSync(folderPath);
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
    
    requireSources(__dirname + '/src');
    requireStylesheets();

    setTimeout(() => loadApp(), 100);

    const {ipcRenderer} = require('electron');
    ipcRenderer.on('triggerMenu', (event,arg) => {
        app.CommandHandler.Trigger(arg.msg,arg);
    });
    
})();