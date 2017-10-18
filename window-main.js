var app = app || {};
var GLOBAL_APP_NAME = "";

(function() {
    let fs = require("fs");
    let path = require("path");

    let g_appDefines = [];
    let g_appSource = [];

    app.angular = {
        deps: [
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

    
    app.addDefinitions = function(callback) {
        g_appDefines.push(callback);
    };
    
    app.addSource = function(callback) {
        g_appSource.push(callback);
    };
    
    function loadApp() {
        angular.module(GLOBAL_APP_NAME, app.angular.deps);

        g_appDefines.forEach((cb) => cb());
        g_appSource.forEach((cb) => cb());

        angular.bootstrap(document, [ GLOBAL_APP_NAME ]);
    };
    
    requireSources(__dirname + '/src');

    setTimeout(() => loadApp(), 100);

    const {ipcRenderer} = require('electron');
    ipcRenderer.on('triggerMenu', (event,arg) => {
        app.CommandHandler.Trigger(arg.msg,arg);
    });
    
})();