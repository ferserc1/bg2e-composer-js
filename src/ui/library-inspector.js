app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("LibraryInspectorController",['$scope',function($scope) {
        let libMgr = app.library.Manager.Get();
        function clearHash(node) {
            delete node.$$hashKey;
            if (node.children) {
                node.children.forEach((ch) => clearHash(ch));
            }
        }

        function update(library) {
            setTimeout(() => {
                clearHash(libMgr.current.root);
                $scope.libraryName = library.filePath || "(Library not saved)";
                $scope.currentNode = library.currentNode;
                $scope.navigator = library.navigator;
                $scope.clipboardContent = library.clipboardContent.length;
                $scope.$apply();
            },50);
        }

        libMgr.libraryChanged("libraryInspector",(library) => {
            update(library);
        });
        
        update(libMgr.current);

        $scope.enterNode = function(node) {
            libMgr.current.deselectAll();
            libMgr.current.currentNode = node;
            libMgr.notifyLibraryChanged();
        };

        $scope.selectNode = function(node,event) {
            if (!event.shiftKey) {
                libMgr.current.deselectAll();
            }
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
        };

        $scope.addToSelection = function(node) {
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
        };

        $scope.getIconClass = function(node) {
            return "bg2-library-item-" + node.type;
        }

        $scope.addNode = function(event) {
            app.ui.contextMenu.show(
                event,[
                    { label:"Group", type:app.library.NodeType.GROUP },
                    { label:"Material", type:app.library.NodeType.MATERIAL },
                    { label:"Model", type:app.library.NodeType.MODEL }
                ],(sel) => {
                    libMgr.current.addNode(sel.type);
                    libMgr.notifyLibraryChanged();
                });
        };

        $scope.removeNode = function(event) {
            if (libMgr.current.selection.length>0) {
                app.ui.contextMenu.show(
                    event,[
                        { label:"Remove selected nodes", remove:true },
                        { label:"Cancel", remove:false }
                    ],(sel) => {
                        let errors = 0;
                        if (sel.remove) {
                            libMgr.current.selectionCopy.forEach((item) => {
                                if (!libMgr.current.removeNode(item)) {
                                    errors++;
                                }
                            });
                        }
                        if (errors>1 ) {
                            alert("Some elements could not be deleted because there are groups and are not empty.");
                        }
                        if (errors==1) {
                            alert("An element could not be deleted because it's a group and it is not empty.");
                        }
                    }
                );
            }
        };

        $scope.copySelection = function() {
            clearHash(libMgr.current.root);
            if (libMgr.current.selection.length) {
                libMgr.current.copySelection();
                update(libMgr.current);
            }
        };

        $scope.cutSelection = function() {
            clearHash(libMgr.current.root);
            if (libMgr.current.selection.length) {
                libMgr.current.cutSelection();
                update(libMgr.current);
            }
        };

        $scope.paste = function() {
            clearHash(libMgr.current.root);
            if (libMgr.current.clipboardContent.length) {
                // setTimeout to prevent angular convert a cicrulcar structure json
                setTimeout(() => {
                    libMgr.current.paste();
                    update(libMgr.current);
                },50);
            }
        };
    }]);

    angularApp.directive("libraryInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/library-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {
            },
            controller: 'LibraryInspectorController'
        }
    })
});