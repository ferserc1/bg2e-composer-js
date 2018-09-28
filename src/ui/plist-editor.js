app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("PlistEditorController",['$rootScope','$scope',function($rootScope,$scope) {
        function refresh() {
            app.render.Scene.Get().notifySceneChanged();
            updateUI();
        }

        function executeCommand(cmd) {
            return new Promise((resolve,reject) => {
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        refresh();
                        resolve()
                    })
                    .catch((err) => {
                        refresh();
                        reject()
                    });
            })
        }

        app.CommandManager.Get().onUndo("plistEditor", () => refresh());
        app.CommandManager.Get().onRedo("plistEditor", () => refresh());

        $scope.saveName = function() {
            if ($scope.selection.length==1) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.SetName(
                        $scope.selection[0],
                        $scope.name
                    ));
                },10)
            }
        };

        $scope.saveGroupName = function() {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.SetGroupName(
                        $scope.selection,
                        $scope.groupName
                    ));
                },10)
            }
        };

        $scope.saveVisibility = function() {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.SetVisibility(
                        $scope.selection,
                        $scope.visible
                    ));
                },10)
            }
        };

        $scope.saveShadowVisibility = function() {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.SetShadowVisibility(
                        $scope.selection,
                        $scope.visibleToShadows
                    ));
                },10)
            }
        };

        $scope.switchUvs = function(from,to) {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.SwapUVs(
                        $scope.selection,
                        from.id,
                        to.id
                    ));
                },10)
            }
        };

        $scope.flipFaces = function() {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.FlipFaces(
                        $scope.selection
                    ));
                },10)
            }
        };

        $scope.flipNormals = function() {
            if ($scope.selection.length) {
                setTimeout(() => {
                    executeCommand(new app.plistCommands.FlipNormals(
                        $scope.selection
                    ));
                },10)
            }
        };

        $scope.uvChannels = [
            { id:0, label:"Channel 0" },
            { id:1, label:"Channel 1" },
            { id:2, label:"Channel 2" },
        ];

        $scope.fromUV = $scope.uvChannels[0];
        $scope.toUV = $scope.uvChannels[1];

        $scope.name = "";
        $scope.groupName = "";
        $scope.visible = false;
        $scope.visibleToShadows = false;

        $scope.selection = [];
        $scope.materials = [];
        $scope.drawables = [];

        $scope.canCombine = function() {
            return $scope.drawables.length==1 && $scope.selection.length>1;
        }

        $scope.combinePlist = function() {
            if ($scope.canCombine()) {
                executeCommand(new app.plistCommands.Combine(
                    $scope.drawables[0],
                    $scope.selection,
                    $scope.materials[0]
                ));
                app.render.Scene.Get().selectionManager.clear();
            }
        }

        function updateUI() {
            let selectionManager = app.render.Scene.Get().selectionManager;
            $scope.selection = [];
            $scope.materials = [];
            $scope.drawables = [];
            selectionManager.selection.forEach((selItem) => {
                if (selItem.node && selItem.node.drawable && $scope.drawables.indexOf(selItem.node.drawable)==-1) {
                    $scope.drawables.push(selItem.node.drawable);
                }
                if (selItem.plist) {
                    $scope.selection.push(selItem.plist);
                    $scope.materials.push(selItem.material);
                }
            });

            if ($scope.selection.length) {
                $scope.name = $scope.selection[0].name;
                $scope.groupName = $scope.selection[0].groupName;
                $scope.visible = $scope.selection[0].visible;
                $scope.visibleToShadows = $scope.selection[0].visibleToShadows;
            }

            setTimeout(() => {
                $scope.$apply();
            },50);
        }

        app.render.Scene.Get().selectionManager.selectionChanged("plistEditor", (selectionManager) => {
            updateUI();
        });

        updateUI();
    }]);

    angularApp.directive("plistEditor", function() {
        return {
            restrict:'E',
            templateUrl:`templates/${ app.config.templateName }/directives/plist-editor.html`,
            compile: app.workspaceElementCompile(),
            scope: {

            },
            controller: 'PlistEditorController'
        }
    })
})