app.addDefinitions(() => {
    app.ui = app.ui || {};
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller('PolyListInspectorController', ['$scope',function($scope) {
        $scope.elements = [];

        function isSelected(plist) {
            let selectionManager = app.render.Scene.Get().selectionManager;
            return selectionManager.selection.some((item) => {
                return item.plist==plist;
            });
        }

        function updateList() {
            $scope.elements = [];
            let selectionManager = app.render.Scene.Get().selectionManager;
            let selectedPlist = [];
            let includedDrawables = [];
            selectionManager.selection.forEach((selItem) => {
                if (selItem.plist) {
                    selectedPlist.push(selItem.plist);
                }
            });

            selectionManager.selection.forEach((selItem) => {
                let drw = selItem.node && selItem.node.drawable;
                if (drw && includedDrawables.indexOf(drw)==-1) {
                    includedDrawables.push(drw);
                    let elem = {
                        name:drw.name || "<< untitled >>",
                        plist:[]
                    };
                    $scope.elements.push(elem);
                    drw.forEach((pl,mat) => {
                        elem.plist.push({
                            name:pl.name || "<< untitled >>",
                            selected: selectedPlist.indexOf(pl)!=-1,
                            node: drw.node,
                            material: mat,
                            plist:pl
                        });
                    });
                }
            });
        }

        $scope.toggleItem = function(plist) {
            let sm = app.render.Scene.Get().selectionManager;
            if (isSelected(plist.plist)) {
                sm.deselectItem(plist.node,plist.plist,plist.material);
            }
            else {
                sm.selectItem(plist.node,plist.plist,plist.material);
            }
        };

        function refresh() {
            updateList();
            setTimeout(() => $scope.$apply(), 10);
        }

        app.render.Scene.Get().sceneChanged("plistInspector",() => refresh());
        app.CommandManager.Get().onUndo("plistInspector", () => refresh());
        app.CommandManager.Get().onRedo("plistInspector", () => refresh());

        app.render.Scene.Get().selectionManager.selectionChanged("plistInspector",(selectionManager) => {
            setTimeout(() => {
                updateList();
                $scope.$apply();
            }, 50);
        });

        updateList();
    }]);

    angularApp.directive('polylistInspector', () => {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/polylist-inspector.html`,
            compile: app.workspaceElementCompile(),
            controller: 'PolyListInspectorController'
        }
    });
})