(function() {
    let fs = require("fs");
    let path = require("path");

    function importFile(file) {
        let script = document.createElement("script");
        script.src = file;
        script.type = "text/javascript";
        script.async = false;
        document.head.appendChild(script);
    }

    function importFolder(src) {
        let sortFn = (a,b) => {
            if (a<b) return -1;
            else return 1;
        };

        let stat = fs.statSync(src);
        if (stat.isDirectory()) {
            let dirContents = fs.readdirSync(src);
            dirContents.sort(sortFn);
            dirContents.forEach((fileName) => importFolder(path.join(src,fileName)));
        }
        else if (src.split(".").pop()=="js") {
            importFile(src);
        }
    }

    let enginePath = path.resolve(path.join(__dirname,"../bg2e-js/"));
    let physicsPath = path.resolve(path.join(__dirname,"../bg2e-js-physics/"))

    let engineSource = path.join(enginePath,"src");
    let physicsSource = path.join(physicsPath,"src");
    let importFileList = [];

    importFolder(engineSource);
    importFolder(physicsSource);
})()