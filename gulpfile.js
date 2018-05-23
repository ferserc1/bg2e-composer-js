const gulp = require("gulp");
const concat = require("gulp-concat");
const fs = require("fs");
const path = require("path");

let fbxPluginPath = {
    win64: `${ __dirname }/../fbx2json-dist/win64`,
    macOS: `${ __dirname }/../fbx2json-dist/osx`
};

let raytracerPluginPath = {
    win64: `${ __dirname }/../bg2e-raytracer-dist/win64`,
    macOS: `${ __dirname }/../bg2e-raytracer-dist/osx`
};

let vitscnImportPath = {
    win64: `${ __dirname }/../bg2e-scene-pkg/win64`,
    macOS: `${ __dirname }/../bg2e-scene-pkg/macOS`
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

gulp.task("vitscnImport", function() {
    return Promise.all([
        gulp.src([
            `${ vitscnImportPath.win64 }/bg2e.dll`,
            `${ vitscnImportPath.win64 }/concrt140.dll`,
            `${ vitscnImportPath.win64 }/msvcp140.dll`,
            `${ vitscnImportPath.win64 }/OpenAL32.dll`,
            `${ vitscnImportPath.win64 }/scene-pkg.exe`,
            `${ vitscnImportPath.win64 }/vccorlib140.dll`,
            `${ vitscnImportPath.win64 }/vcruntime140.dll`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/vitscn-import/win64')),
    
        gulp.src([
            `${ vitscnImportPath.macOS }/libbg2e.dylib`,
            `${ vitscnImportPath.macOS }/scene-pkg`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/vitscn-import/macos')),
        
        gulp.src([
            "vitscnPlugin/plugin/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/vitscn-import/plugin')),
        
        gulp.src([
            "vitscnPlugin/src/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/vitscn-import/src'))
        
    ]);
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
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/macos')),

        gulp.src([
            "fbxPlugin/plugin/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/plugin')),

        gulp.src([
            "fbxPlugin/src/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/fbx2json/src')),

        gulp.src([
            `${ raytracerPluginPath.win64 }/raytracer.exe`,
            `${ raytracerPluginPath.win64 }/concrt140.dll`,
            `${ raytracerPluginPath.win64 }/msvcp140.dll`,
            `${ raytracerPluginPath.win64 }/vccorlib140.dll`,
            `${ raytracerPluginPath.win64 }/vcruntime140.dll`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer/win64')),

        gulp.src([
            `${ raytracerPluginPath.macOS }/raytracer`
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer/macos')),

        gulp.src([
            "raytracerPlugin/plugin/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer/plugin')),

        gulp.src([
            "raytracerPlugin/src/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer/src')),

        gulp.src([
            "raytracerPlugin/templates/*"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer/templates')),
        
        gulp.src([
            "raytracerPlugin/menu.js"
        ])
            .pipe(gulp.dest(__dirname + '/../composer-plugins/raytracer'))
    ])
});

gulp.task("default",["compile","fbxPlugin"]);
