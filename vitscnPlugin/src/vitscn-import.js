
app.addSource(() => {
    app.vitscnPlugin = app.vitscnPlugin || {};
    const path = require('path');
    const fs = require('fs');
    const { exec } = require('child_process');

    let commandPath = app.plugins.find("vitscn-import");

    if (commandPath && /darwin/i.test(process.platform)) {
        // macOS
        commandPath = path.join(commandPath,"macos");
        if (fs.existsSync(commandPath)) {
            app.vitscnPlugin.available = true;
            app.vitscnPlugin.path = path.join(commandPath,"scene-pkg");
        }
    }
    else if (commandPath && /win/i.test(process.platform)) {
        // Windows
        commandPath = path.join(commandPath,"win64");
        if (fs.existsSync(commandPath)) {
            app.vitscnPlugin.available = true;
            app.vitscnPlugin.path = path.join(commandPath,"scene-pkg.exe");
        }
    }

    app.vitscnPlugin.extract = function(file) {
        return new Promise((resolve,reject) => {
            let extractFileLocation = app.paths.temp;

            exec(`"${ app.vitscnPlugin.path }" "${ file }" "${ extractFileLocation }"`, (err,stdout,stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    try {
                        let pathParsed = path.parse(file);
                        let vitscnjFilePath = path.join(extractFileLocation,pathParsed.name);
                        vitscnjFilePath = path.join(vitscnjFilePath,"scene.vitscnj");
                        let vitscnjFileContents = fs.readFileSync(vitscnjFilePath,"utf-8");
                        resolve({ scenePath:vitscnjFilePath, fileContents:vitscnjFileContents });
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            })
        });
    }
});