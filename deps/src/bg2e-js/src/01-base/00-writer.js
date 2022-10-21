(function() {
    // NOTE: All the writer functions and classes are intended to be used
    // only in an Electron.js application
    if (!bg.isElectronApp) {
        return false;
    }

    class WriterPlugin {
        acceptType(url,data) { return false; }
        write(url,data) {}
    }

    bg.base.WriterPlugin = WriterPlugin;

    let s_writerPlugins = [];

    class Writer {
        static RegisterPlugin(p) { s_writerPlugins.push(p); }

        static Write(url,data) {
            return new Promise((resolve,reject) => {
                let selectedPlugin = null;
                s_writerPlugins.some((plugin) => {
                    if (plugin.acceptType(url,data)) {
                        selectedPlugin = plugin;
                        return true;
                    }
                });

                if (selectedPlugin) {
                    resolve(selectedPlugin.write(url,data));
                }
                else {
                    reject(new Error("No suitable plugin found for write " + url));
                }
            })
        }

        static PrepareDirectory(dir) {
            let targetDir = Writer.ToSystemPath(dir);
            const fs = require('fs');
            const path = require('path');
            const sep = path.sep;
            const initDir = path.isAbsolute(targetDir) ? sep : '';
            targetDir.split(sep).reduce((parentDir,childDir) => {
                const curDir = path.resolve(parentDir, childDir);
                if (!fs.existsSync(curDir)) {
                    fs.mkdirSync(curDir);
                }
                return curDir;
            }, initDir);
        }

        static StandarizePath(inPath) {
            return inPath.replace(/\\/g,'/');
        }

        static ToSystemPath(inPath) {
            const path = require('path');
            const sep = path.sep;
            return inPath.replace(/\\/g,sep).replace(/\//g,sep);
        }

        static CopyFile(source,target) {
            return new Promise((resolve,reject) => {
                const fs = require("fs");
                const path = require("path");
                let cbCalled = false;

                source = Writer.StandarizePath(path.resolve(source));
                target = Writer.StandarizePath(path.resolve(target));
                
                if (source==target) {
                    resolve();
                }
                else {
                    let rd = fs.createReadStream(source);
                    rd.on("error", function(err) {
                        done(err);
                    });
                    let wr = fs.createWriteStream(target);
                    wr.on("error", function(err) {
                        done(err);
                    });
                    wr.on("close", function(ex) {
                        done();
                    });
                    rd.pipe(wr);
                
                    function done(err) {
                        if (!cbCalled) {
                            err ? reject(err) : resolve();
                            cbCalled = true;
                        }
                    }
                }
            })
        }
    }

    bg.base.Writer = Writer;
})();