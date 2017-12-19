app.addDefinitions(() => {
    app.fbxPlugin = app.fbxPlugin || {};

    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");

    const commandPath = path.resolve(path.join(__dirname,"fbx2json"));

    if (fs.existsSync(commandPath)) {
        app.fbxPlugin.available = true;
    }

    app.fbxPlugin.loadFbxJson = function(filePath) {
        return new Promise((resolve,reject) => {
            let fbx2jsonCmd = path.resolve(path.join(commandPath,"fbx2json"));
            exec(`${ fbx2jsonCmd } ${filePath}`, (err,stdout,stderr) => {
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