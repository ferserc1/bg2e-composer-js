app.addDefinitions(() => {
    app.ui = app.ui || {};

    let g_statusBar = null;
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
            this._logMessage = "";
            this._logInfo = "";
            this._logWarning = "";
            this._logError = "";

            this._lastMessageType = "info"; // info, warning or error
        }

        get selection() { return this._selection; }

        get logMessage() { return app.ui.Log.Get().lastMessage; }
        get lastMessageType() { return app.ui.Log.Get().lastLevel; }
        get logMessages() { return app.ui.Log.Get().messages; }

        // This function register the required observers to show the
        // selection data
        init() {
            let selectedTriangles = (s) => {
                let count = 0;
                s.selection.forEach((selItem) => {
                    if (selItem.plist) {
                        count += selItem.plist.index.length / 3;
                    }
                })
                return count;
            }

            let printSelection = (s) => {
                if (s.selection.length==0) {
                    this._selection = "nothing selected";
                }
                else if (s.selection.length==1) {
                    this._selection = "1 item selected";
                    let node = s.selection[0].node;
                    let drawable = node && node.drawable;
                    let transform = node && node.transform && node.transform.matrix;
                    if (drawable) {
                        let bbox = new bg.tools.BoundingBox(drawable,transform);
                        let x = Math.round(bbox.size.x * 1000) / 1000;
                        let y = Math.round(bbox.size.y * 1000) / 1000;
                        let z = Math.round(bbox.size.z * 1000) / 1000;
                        this._selection += `, width:${ x }, height:${ y }, depth:${ z }`;
                    }
                    else {
                        this._selection += " (select a drawable node to view size)";
                    }   
                }
                else {
                    this._selection = s.selection.length + " items selected (select single node to view size)";
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

    setTimeout(() => {
        app.ui.StatusBar.Get().init();
    }, 1000);

});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("StatusBarController", ['$scope',function($scope) {
        $scope.selectionText = "";
        $scope.lastMessage = "";
        $scope.lastMessageType = "";
        $scope.logMessages = [];
        $scope.gridSize = app.render.Scene.Get().grid.gridSize;
        $scope.gridPlane = app.render.Scene.Get().grid.planeSize;

        $scope.logWindowVisible = false;

        function updateUI() {
            $scope.selectionText = app.ui.StatusBar.Get().selection;
            $scope.lastMessage = app.ui.StatusBar.Get().logMessage;
            $scope.lastMessageType = app.ui.StatusBar.Get().lastMessageType;
            $scope.logMessages = app.ui.StatusBar.Get().logMessages;
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
