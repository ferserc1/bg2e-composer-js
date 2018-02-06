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
                executeCommand(new app.plistCommands.SetName(
                    $scope.selection[0],
                    $scope.name
                ));
            }
        };

        $scope.saveGroupName = function() {
            if ($scope.selection.length) {
                executeCommand(new app.plistCommands.SetGroupName(
                    $scope.selection,
                    $scope.groupName
                ));
            }
        };

        $scope.saveVisibility = function() {
            if ($scope.selection.length) {
                executeCommand(new app.plistCommands.SetVisibility(
                    $scope.selection,
                    $scope.visible
                ));
            }
        };

        $scope.switchUvs = function(from,to) {

        };

        $scope.flipFaces = function() {

        };

        $scope.flipNormals = function() {

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

        $scope.selection = [];

        function updateUI() {
            let selectionManager = app.render.Scene.Get().selectionManager;
            $scope.selection = [];
            selectionManager.selection.forEach((selItem) => {
                if (selItem.plist) {
                    $scope.selection.push(selItem.plist);
                }
            });

            if ($scope.selection.length) {
                $scope.name = $scope.selection[0].name;
                $scope.groupName = $scope.selection[0].groupName;
                $scope.visible = $scope.selection[0].visible;
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