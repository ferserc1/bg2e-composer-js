
const exec = require('child_process').exec;
const path = require('path');

module.exports = function(app,angularApp,bg) {

    function assertLighmapUVs() {
        let drawables = getSteadyDrawables(app.render.Scene.Get().root);
        let errors = 0;
        drawables.forEach((drawable) => {
            drawable.forEach((pl) => {
                if (pl.texCoord1.length==0) {
                    console.error(`Drawable ${ drawable.name }, PolyList ${ pl.name }: No lightmap defined`);
                    errors++;
                }
            });
        });
        if (errors) {
            let errorMsg = "Could not generate lightmap. Missing secondary UV map channel on some elements.";
            console.error(errorMsg);
            alert(errorMsg);
            return false;
        }
        return true;
    }

    function getSteadyDrawables(sceneRoot) {
        let findDrawables = new bg.scene.FindComponentVisitor("bg.scene.Drawable");
        sceneRoot.accept(findDrawables);
        let steadyDrawables = [];
        findDrawables.result.forEach((node) => {
            if (node.steady) {
                steadyDrawables.push(node.drawable);
            }
        });
        return steadyDrawables;
    }
    
    angularApp.directive("raytracerPluginSettings", function() {
        return {
            restrict: 'E',
            templateUrl:__dirname + '/../templates/raytracer-ui-settings.html',
            controller: ['$scope',function($scope) {
                $scope.commitChanges = function() {
                    app.raytracer.draftQuality.width = $scope.sizeDraft[0];
                    app.raytracer.draftQuality.height = $scope.sizeDraft[1];
                    app.raytracer.draftQuality.samples = $scope.samplesDraft;
                    app.raytracer.draftQuality.blur = $scope.blurDraft;

                    app.raytracer.midQuality.width = $scope.sizeMid[0];
                    app.raytracer.midQuality.height = $scope.sizeMid[1];
                    app.raytracer.midQuality.samples = $scope.samplesMid;
                    app.raytracer.midQuality.blur = $scope.blurDraft;

                    app.raytracer.highQuality.width = $scope.sizeHigh[0];
                    app.raytracer.highQuality.height = $scope.sizeHigh[1];
                    app.raytracer.highQuality.samples = $scope.samplesHigh;
                    app.raytracer.highQuality.blur = $scope.blurHigh;

                    app.settings.set("raytracer.widthDraft",app.raytracer.draftQuality.width);
                    app.settings.set("raytracer.heightDraft",app.raytracer.draftQuality.height);
                    app.settings.set("raytracer.samplesDraft",app.raytracer.draftQuality.samples);
                    app.settings.set("raytracer.blurDraft",app.raytracer.draftQuality.blurDraft);

                    app.settings.set("raytracer.widthMid",app.raytracer.midQuality.width);
                    app.settings.set("raytracer.heightMid",app.raytracer.midQuality.height);
                    app.settings.set("raytracer.samplesMid",app.raytracer.midQuality.samples);
                    app.settings.set("raytracer.blurMid",app.raytracer.midQuality.blurDraft);

                    app.settings.set("raytracer.widthHigh",app.raytracer.highQuality.width);
                    app.settings.set("raytracer.heightHigh",app.raytracer.highQuality.height);
                    app.settings.set("raytracer.samplesHigh",app.raytracer.highQuality.samples);
                    app.settings.set("raytracer.blurHigh",app.raytracer.highQuality.blurDraft);
                };

                function updateUI() {
                    $scope.sizeDraft = [app.raytracer.draftQuality.width,app.raytracer.draftQuality.height];
                    $scope.samplesDraft = app.raytracer.draftQuality.samples;
                    $scope.blurDraft = app.raytracer.draftQuality.blur;
    
                    $scope.sizeMid = [app.raytracer.midQuality.width,app.raytracer.midQuality.height];
                    $scope.samplesMid = app.raytracer.midQuality.samples;
                    $scope.blurMid = app.raytracer.midQuality.blur;

                    $scope.sizeHigh = [app.raytracer.highQuality.width,app.raytracer.highQuality.height];
                    $scope.samplesHigh = app.raytracer.highQuality.samples;
                    $scope.blurHigh = app.raytracer.highQuality.blur;
                }

                updateUI();
            }]
        }
    });


    function buildRenderCallbacks(scene,steadyDrawables,quality) {
        let callbacks = [];
        let fileCommandHandler = app.CommandHandler.Get('FileCommandHandler');
        let scenePath = fileCommandHandler.currentScenePath;
        let projectDir = scenePath.split('/');
        projectDir.pop();
        projectDir = projectDir.join('/');
        let cancel = false;

        steadyDrawables.forEach((drawable) => {
            callbacks.push((function(drw) {
                return (printFn) => {
                    return new Promise((resolve,reject) => {
                        if (cancel) {
                            reject(new Error("Cancelled by user"));
                            return;
                        }

                        let cmd = app.raytracer.commandPath;
                        if (!drw.name) {
                            drw.name = bg.utils.generateUUID();
                        }
                        let objName = drw.name;
                        let imgName = path.join(projectDir, drw.name + "_lm.jpg");
                        imgName = imgName.replace(/\//ig,path.sep);
                        let command = `${ cmd } ${ objName } --scene "${ scenePath }" --out "${ imgName }" --width ${ quality.width } --height ${ quality.height } --samples ${ quality.samples } --blur ${ quality.blur }`;
                        printFn("Render lightmap for object " + drw.name);
                        printFn("Executing command:");
                        printFn(command);

                        let raytracerCmd = exec(command);

                        raytracerCmd.stdout.on('data', function(data) {
                            printFn(data,false);
                        });

                        raytracerCmd.stderr.on('data', function(data) {
                            printFn("ERROR: " + data);
                        });

                        app.on('app:cancel_render','raytracerPlugin',() => {
                            cancel = true;
                            raytracerCmd.kill();
                            reject(new Error("Cancelled by user"));
                        });

                        raytracerCmd.on('exit', function(code) {
                            if (cancel) return;
                            printFn("Object " + drw.name + ": lightmap render done.");
                            let gl = app.ComposerWindowController.Get().gl;
                            let cache = bg.base.TextureCache.Get(gl);
                            if (cache.find(imgName)) {
                                console.log("Refreshing cache for texture " + imgName);
                                cache.unregister(imgName);
                            }

                            bg.base.Loader.Load(gl,imgName)
                                .then((resultImage) => {
                                    drw.forEach((plist,mat) => {
                                        mat.lightmap = resultImage;
                                        mat.lightEmission = 0.05;
                                    });
                                    app.render.Scene.Get().notifySceneChanged();
                                    resolve();
                                })

                                .catch((err) => {
                                    reject(new Error("ERROR: " + err.message));
                                })
                            
                        });
                    })
                }
            })(drawable));
        })

        return callbacks;
    }


    class LightmapRenderer {
        constructor(printFn) {
            this._printFn = printFn;
        }

        beginRender(qualityId) {
            return new Promise((resolve,reject) => {
                let sceneRoot = app.render.Scene.Get().root;

                // Find steady drawables in the scene
                let steadyDrawables = getSteadyDrawables(sceneRoot);
                if (steadyDrawables.length==0) {
                    reject(new Error("No steady nodes with drawable components found in the scene"));
                }

                let quality = app.raytracer[qualityId];
                if (!quality) {
                    reject(new Error("Invalid quality: " + quality));
                }

                let callbacks = buildRenderCallbacks(sceneRoot,steadyDrawables,quality);
                let completedCallbacks = 0;

                let processNextCallback = () => {
                    if (completedCallbacks==callbacks.length) {
                        resolve();
                    }
                    else {
                        callbacks[completedCallbacks](this._printFn)
                            .then(() => {
                                completedCallbacks++;
                                processNextCallback();
                            })
                            .catch(() => {
                                completedCallbacks++;
                                processNextCallback();
                            });
                    }
                }

                this._printFn("Begining lightmap render. Quality: " + qualityId);
                processNextCallback();
            });
        }
    }


    angularApp.directive("raytracerUi", function() {
        return {
            restrict: 'E',
            templateUrl:__dirname + '/../templates/raytracer-ui.html',
            controller: ['$scope',function($scope) {
                $scope.qualityOptions = [
                    { id:0, label:'Draft', settingId:'draftQuality' },
                    { id:1, label:'Medium', settingId:'midQuality' },
                    { id:2, label:'High', settingId:'highQuality' }
                ];
                $scope.quality = $scope.qualityOptions[0];
                $scope.outBuffer = "";

                $scope.beginRender = function() {
                    $scope.rendering = true;

                    let lightmapRenderer = new LightmapRenderer((text,newLine=true) => {
                        console.log(text);
                        setTimeout(() => {
                            $scope.outBuffer += text + (newLine ? "\n":"");
                            $scope.$apply();
                        },50);
                    });

                    lightmapRenderer.beginRender($scope.quality.settingId)
                        .then(() => {
                            $scope.renderingDone = true;
                            $scope.$apply();
                        })

                        .catch((err) => {
                            setTimeout(() => {
                                console.error(err.message);
                                $scope.outBuffer += "ERROR: " + err.message + "\n";
                                $scope.rendering = false;
                                $scope.$apply();

                                let textarea = document.getElementById('raytracerOutputData');
                                textarea.scrollTop = textarea.scrollHeight;
                            },50);
                        });
                };
                $scope.cancel = function() {
                    app.trigger("app:cancel_render");
                    app.ui.DialogView.Close();
                };
                $scope.rendering = false;
                $scope.renderingDone = false;
            }]
        }
    })


    function showRenderLightmapDialog(scenePath) {
        return new Promise((resolve,reject) => {
            app.ui.DialogView.Show({
                templateUrl:__dirname + '/../templates/raytracer-ui-view.html',
                title:"Add Component",
                showClose: false,
                type: 'modal-full'
            })
                .then((comp) => {
                    resolve(comp);
                })
                .catch((err) => {
                    if (err) {
                        reject(err);
                    }
                    // Else: canceled by user
                });
        });
    }

    app.raytracer.renderLightmaps = function() {
        return new Promise((resolve,reject) => {
            let fileCommandHandler = app.CommandHandler.Get('FileCommandHandler');
            let promise = null;
            if (assertLighmapUVs()) {
                fileCommandHandler.saveScene()
                    .then((status) => {
                        if (!status) {  // Canceled by user
                            throw new Error("The scene must be saved before generate lightmaps.");
                        }
                        return showRenderLightmapDialog(fileCommandHandler.currentScenePath);
                    })
                    .then(() => resolve())
                    .catch((err) => {
                        alert(err.message);
                    });
            }
            else {
                reject(new Error("Missing uv maps for lightmap"));
            }
        })
     }

     return {
         menu: {
             label: 'Plugins',
             menu: [
                 { 
                    label:"Render Global Ilumination", click: function(item, focusedWindow) {
                        focusedWindow.webContents.send('triggerMenu', { msg:'renderGlobalIlumination' })
                    }
                }
             ]
         }
     };
}