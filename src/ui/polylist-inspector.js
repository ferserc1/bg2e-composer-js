app.addDefinitions(() => {
    app.ui = app.ui || {};
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller('PolyListInspectorController', ['$scope',function($scope) {
        $scope.elements = [];
        $scope.searchText = "";
        $scope.ignoreCase = true;
        $scope.visibilityOptions = [
            { id:1, label:"Any" },
            { id:2, label:"Visible" },
            { id:3, label:"Hidden" },
        ];
        $scope.visibility = $scope.visibilityOptions[0];
        $scope.searchByName = true;

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

        $scope.searchPlist = function() {
            console.log("Search plist " + $scope.searchText);
            let re = new RegExp($scope.searchText,$scope.ignoreCase ? "i":"");
            let result = [];
            let findDrawable = new bg.scene.FindComponentVisitor("bg.scene.Drawable");
            let selection = app.render.Scene.Get().selectionManager;
            selection.clear();
            app.render.Scene.Get().root.accept(findDrawable);
            findDrawable.result.forEach((node) => {
                node.drawable.forEach((plist,mat) => {
                    if ($scope.visibility.id==1 ||
                        ($scope.visibility.id==2 && plist.visible==true) ||
                        ($scope.visibility.id==3 && plist.visible==false)
                    ) {
                        if (($scope.searchByName && re.test(plist.name)) || !$scope.searchByName ) {
                            result.push({ node:node, plist:plist, mat:mat});
                            selection.selectItem(node, plist, mat, false);
                        }
                    }
                })
            });

            selection.notifySelectionChanged();
        }

        $scope.toggleItem = function(plist,event) {
            let sm = app.render.Scene.Get().selectionManager;
            if (!event.shiftKey) {
                $scope.elements.forEach((elem) => {
                    elem.plist.forEach((pl) => {
                        sm.deselectItem(pl.node,pl.plist,pl.material)
                    })
                });
            }

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