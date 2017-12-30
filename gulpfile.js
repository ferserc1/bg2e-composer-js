const gulp = require("gulp");
const concat = require("gulp-concat");
const fs = require("fs");
const path = require("path");

let fbxPluginPath = {
    win64: `${ __dirname }/../fbx2json/build/win64/release`,
    macOS: `${ __dirname }/../fbx2json/build/macOS`
};

gulp.task("compile", function() {
    let sources = [];

    function requireSources(folderPath) {
        let srcDir = fs.readdirSync(folderPath);
        srcDir.sort((a,b) => {
            if (a<b) return -1;
            else return 1;
        });
        srcDir.forEach((sourceFile) => {
            let filePath = path.join(folderPath,sourceFile);
            if (sourceFile.split(".").pop()=='js') {
                sources.push(filePath);
            }
            else if (fs.statSync(filePath).isDirectory()) {
                requireSources(filePath);
            }
        });
    }

    sources.push(__dirname + '/release.js');
    sources.push(__dirname + "/window-main.js");
    requireSources(__dirname + "/src");

    return gulp.src(sources)
        .pipe(concat("window-main-compiled.js"))
        .pipe(gulp.dest(__dirname));
});

gulp.task("fbxPlugin", function() {
   return Promise.all([
        gulp.src([
            `${ fbxPluginPath.win64 }/concrt140.dll`,
            `${ fbxPluginPath.win64 }/libfbxsdk.dll`,
            `${ fbxPluginPath.win64 }/msvcp140.dll`,
            `${ fbxPluginPath.win64 }/vccorlib140.dll`,
            `${ fbxPluginPath.win64 }/vcruntime140.dll`,
            `${ fbxPluginPath.win64 }/fbx2json.exe`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/win64')),
        
        gulp.src([
            `${ fbxPluginPath.macOS }/libfbxsdk.dylib`,
            `${ fbxPluginPath.macOS }/fbx2json`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/win64')),

        gulp.src([
            "fbxPlugin/plugin/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/plugin')),

        gulp.src([
            "fbxPlugin/src/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/src'))
    ])
});

gulp.task("default",["compile","fbxPlugin"]);
