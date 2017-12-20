app.addDefinitions(() => {
    app.fbxPlugin = app.fbxPlugin || {};

    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");

    let commandPath = path.resolve(path.join(__dirname,"fbx2json"));

    if (/darwin/i.test(process.platform)) {
        // macOS
        commandPath = path.join(commandPath,"macOS");
        if (fs.existsSync(commandPath)) {
            app.fbxPlugin.available = true;
            app.fbxPlugin.path = path.join(commandPath,"fbx2json");
        }
    }
    else if (/win/i.test(process.platform)) {
        // Windows
        commandPath = path.join(process.platform);
        if (fs.existsSync(commandPath)) {
            app.fbxPlugin.available = true;
            app.fbxPlugin.path = path.join(commandPath,"fbx2json.exe");
        }
    }

    app.fbxPlugin.loadFbxJson = function(filePath) {
        return new Promise((resolve,reject) => {
            exec(`${ app.fbxPlugin.path } ${filePath}`, (err,stdout,stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(stdout));
                }
            });
        });
    }
})