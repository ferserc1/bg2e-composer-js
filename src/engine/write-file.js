app.addDefinitions(() => {

    let g_plugins = [];

    class WriteFile {

        static RegisterPlugin(plugin) {
            g_plugins.push(plugin);
        }

        static Save(path,data) {
            let plugin = null;
            let ext = path.split(".").pop();
            g_plugins.some((p) => {
                if (p.supportFileType(ext)) {
                    plugin = p;
                }
                return plugin!=null;
            });
            return plugin && plugin.writeFile(path,data) || Promise.reject(new Error("Could not find suitable plugin to write file"));
        }
    }

    bg.WriteFile = WriteFile;

    class WriteFilePlugin {
        supportFileType(ext) {
            return false;
        }

        writeFile(path,data) {
            return Promise.reject("Not implemented");
        }
    }

    bg.WriteFilePlugin = WriteFilePlugin; 
});