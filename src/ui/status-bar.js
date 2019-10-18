app.addDefinitions(() => {
    app.ui = app.ui || {};

    let g_statusBar = null;

    let selectedTriangles = (s) => {
        let count = 0;
        s.selection.forEach((selItem) => {
            if (selItem.plist) {
                count += selItem.plist.index.length / 3;
            }
        })
        return count;
    }

    class StatusBar {
        static Get() {
            if (!g_statusBar) {
                g_statusBar = new StatusBar();
            }
            return g_statusBar;
        }

        constructor() {
            this._observers = {};

            this._selection = "nothing selected";
            this._emptySelection = true;
            this._logMessage = "";
            this._logInfo = "";
            this._logWarning = "";
            this._logError = "";

            this._lastMessageType = "info"; // info, warning or error
        }

        get selection() { return this._selection; }

        get emptySelection() { return this._emptySelection; }

        get logMessage() { return app.ui.Log.Get().lastMessage; }
        get lastMessageType() { return app.ui.Log.Get().lastLevel; }
        get logMessages() { return app.ui.Log.Get().messages; }

        // This function register the required observers to show the
        // selection data
        init() {
            let printSelection = (s) => {
                if (s.selection.length==0) {
                    this._selection = "nothing selected";
                    this._emptySelection = true;
                }
                else if (s.selection.length==1) {
                    this._selection = "1 item selected";
                    this._emptySelection = false; 
                }
                else {
                    this._selection = s.selection.length + " items selected";
                    this._emptySelection = false;
                }
                let count = selectedTriangles(s);
                if (count) {
                    this._selection += `,    ${ count } triangles selected.`;
                }
            }

            app.render.Scene.Get().selectionManager.selectionChanged("statusBar",(s) => {
                printSelection(s);
                this.notifyStatusChanged();
            });

            app.render.Scene.Get().sceneChanged("statusBar",() => {
                printSelection(app.render.Scene.Get().selectionManager);
                this.notifyStatusChanged();
            });

            app.render.Scene.Get().selectionController.gizmoUpdated("statusBar",() => {
                printSelection(app.render.Scene.Get().selectionManager);
                this.notifyStatusChanged();
            });

            app.ui.Log.Get().logChanged("statusBar",() => {
                this.notifyStatusChanged();
            });
        }

        getSelectionDetails() {
            return new Promise((resolve,reject) => {
                setTimeout(() => {
                    let s = app.render.Scene.Get().selectionManager;

                    let details = [];
                    s.selection.forEach((item) => {
                        let node = item.node;
                        let drawable = node && node.drawable;
                        let transform = node && node.transform && node.transform.matrix;
                        if (drawable) {
                            let bbox = new bg.tools.BoundingBox(drawable,transform);
                            let x = Math.round(bbox.size.x * 1000) / 1000;
                            let y = Math.round(bbox.size.y * 1000) / 1000;
                            let z = Math.round(bbox.size.z * 1000) / 1000;
                            let triangles = 0;
                            drawable.forEach((plist) => {
                                triangles += plist.index.length / 3;
                            });
                            let trianglesString = triangles == 1 ? "triangle" : "triangles";
                            let polygonString = triangles / 2 == 1 ? "polygon" : "polygons";
                            details.push({ text: `Object ${ details.length + 1 } - width:${ x }, height:${ y }, depth:${ z }. ${ triangles } ${ trianglesString }, ${ triangles / 2} ${ polygonString }.` });
                        }
                    });
                    if (details.length == 0) {
                        details.push({ text: `Select a drawable node to view the size` });
                    }
                    resolve(details);
                },50);
            });  
        }

        statusChanged(observer,callback) {
            this._observers[observer] = callback;
        }

        notifyStatusChanged() {
            for (let key in this._observers) {
                this._observers[key]();
            }
        }
    }

    app.ui.StatusBar = StatusBar;

    function initStatusBar() {
        if (app.render.Scene.Get()) {
            app.ui.StatusBar.Get().init();
        }
        else {
            setTimeout(() => initStatusBar(), 500);
        }
    }
    initStatusBar();
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("StatusBarController", ['$scope',function($scope) {
        $scope.selectionText = "";
        $scope.emptySelection = true;
        $scope.lastMessage = "";
        $scope.lastMessageType = "";
        $scope.logMessages = [];
        $scope.gridSize = app.render.Scene.Get().grid.gridSize;
        $scope.gridPlane = app.render.Scene.Get().grid.planeSize;

        $scope.logWindowVisible = false;
        $scope.statsViewVisible = false;
        $scope.stats = [];

        function updateUI() {
            $scope.selectionText = app.ui.StatusBar.Get().selection;
            $scope.emptySelection = app.ui.StatusBar.Get().emptySelection;
            $scope.lastMessage = app.ui.StatusBar.Get().logMessage;
            $scope.lastMessageType = app.ui.StatusBar.Get().lastMessageType;
            $scope.logMessages = app.ui.StatusBar.Get().logMessages;
            
            $scope.logWindowVisible = false;
            $scope.statsViewVisible = false;
            $scope.stats = [];
        }

        updateUI();

        app.ui.StatusBar.Get().statusChanged("statusBar",() => {
            setTimeout(() => updateUI(), 10);
            setTimeout(() => $scope.$apply(), 30);
        });

        app.render.Scene.Get().sceneChanged("statusBarGrid",() => {
            $scope.gridSize = app.render.Scene.Get().grid.gridSize;
            $scope.gridPlane = app.render.Scene.Get().grid.planeSize;
            $scope.gridHidden = app.render.Scene.Get().grid.hidden;
            $scope.$apply();
        });

        $scope.showStats = function() {
            $scope.statsViewVisible = true;
            $scope.stats = [
                { text: "Loading scene statistics..." }
                
            ];
            app.ui.StatusBar.Get().getSelectionDetails()
                .then((data) => {
                    $scope.stats = data;
                    $scope.$apply();
                })
        }

        $scope.openLog = function() {
            $scope.logWindowVisible = true;
        }

        $scope.closeLog = function() {
            $scope.logWindowVisible = false;
        }

        $scope.switchGrid = function() {
            $scope.switchGridVisible = !$scope.switchGridVisible;
            if ($scope.switchGridVisible) {
                $scope.showGrid();
            }
        }

        $scope.showGrid = function() {
            app.render.Scene.Get().grid.show();
            $scope.gridHidden = false;
            app.ComposerWindowController.Get().updateView();
        }

        $scope.hideGrid = function() {
            $scope.switchGridVisible = false;
            app.render.Scene.Get().grid.hide();
            $scope.gridHidden = true;
            app.ComposerWindowController.Get().updateView();
        }

        $scope.$watch('gridSize',() => {
            if ($scope.gridSize!=app.render.Scene.Get().grid.gridSize) {
                app.render.Scene.Get().grid.gridSize = $scope.gridSize;
                app.ComposerWindowController.Get().updateView();
            }
        });
        
        $scope.$watch('gridPlane',() => {
            if (app.render.Scene.Get().grid.planeSize!=$scope.gridPlane) {
                app.render.Scene.Get().grid.planeSize = $scope.gridPlane
                app.ComposerWindowController.Get().updateView();
            }
        });
    }]);

    angularApp.directive("statusBar", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/status-bar.html`,
            compile: app.workspaceElementCompile(),
            controller: 'StatusBarController'
        };
    });
});
