app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    const path = require('path');

    angularApp.controller("LibraryInspectorController",['$scope',function($scope) {
        $scope.mode = $scope.mode || 'edit';
        $scope.onInsertNode = $scope.onInsertNode || null;
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

        function addModelFromScene() {
            let sel = app.render.Scene.Get().selectionManager.selection;
            let nodes = [];
            sel.forEach((selItem) => {
                if (selItem.node && selItem.node.drawable && nodes.indexOf(selItem.node)==-1) {
                    nodes.push(selItem.node);
                }
            });

            if (nodes.length) {
                libMgr.current.addModelFromSceneNodes(nodes)
                    .then(() => {
                        libMgr.current.save();
                        libMgr.notifyLibraryChanged();
                    })
                    .catch((err) => {
                        console.log(err.message,true);
                    })
            }
            else {
                alert("Select at least one node in scene that contains a Drawable component.")
            }
        }

        function addMaterialFromScene() {
            libMgr.current.addMaterialFromSelection()
                .then(() => {
                    libMgr.current.save();
                    libMgr.notifyLibraryChanged();
                })
                .catch((err) => {
                    console.log(err.message,true);
                });
        }

        libMgr.libraryChanged("libraryInspector",(library) => {
            update(library);
        });
        
        update(libMgr.current);

        $scope.iconPreviewUrl = null;
        $scope.iconPreviewStyle = null;

        $scope.onItemEnter = function(node,event) {
            if (node.icon) {
                $scope.iconPreviewUrl = path.join(libMgr.current.repoPath,node.icon);
                $scope.iconPreviewStyle = {
                    position: 'fixed',
                    "z-index": 10000000,
                    top: (event.clientY - 50) + 'px',
                    left: event.clientX + 'px'
                }
            }
            else {
                $scope.iconPreviewUrl = null;
            }
        };

        $scope.onItemExit = function(event) {
            $scope.iconPreviewUrl = null;
        };

        $scope.loadLibrary = function() {
            app.CommandHandler.Get("FileCommandHandler").openLibrary();
        };

        $scope.revealLibrary = function() {
            const { shell } = require('electron').remote;
            shell.showItemInFolder(libMgr.current.filePath);
        };

        $scope.enterNode = function(node) {
            if ($scope.mode=='read' && node.type!='group') {
                if ($scope.onInsertNode) {
                    $scope.onInsertNode(node,libMgr.current.repoPath);
                }
            }
            else {
                libMgr.current.deselectAll();
                libMgr.current.currentNode = node;
                libMgr.notifyLibraryChanged();
            }
        };

        $scope.selectNode = function(node,event) {
            if ($scope.mode!='edit') return;
            if (!event.shiftKey) {
                libMgr.current.deselectAll();
            }
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
            event.stopPropagation();
        };

        $scope.addToSelection = function(node) {
            libMgr.current.toggleSelect(node);
            update(libMgr.current);
        };

        $scope.deselectAll = function() {
            libMgr.current.deselectAll();
            update(libMgr.current);
        };

        $scope.getIconClass = function(node) {
            return "bg2-library-item-" + node.type;
        }

        $scope.addNode = function(event) {
            if ($scope.mode!='edit') return;
            app.ui.contextMenu.show(
                event,[
                    { label:"Group", type:app.library.NodeType.GROUP },
                    { label:"Material", type:app.library.NodeType.MATERIAL },
                    { label:"Model", type:app.library.NodeType.MODEL },
                    { type:"separator" },
                    { label:"Model From Scene", type:-1 },
                    { label:"Material From Scene", type:-2 }
                ],(sel) => {
                    if (sel.type==-1) {
                        addModelFromScene();
                    }
                    else if (sel.type==-2) {
                        addMaterialFromScene();
                    }
                    else {
                        libMgr.current.addNode(sel.type);
                        libMgr.current.save();
                        libMgr.notifyLibraryChanged();
                    }
                });
        };

        $scope.removeNode = function(event) {
            if ($scope.mode!='edit') return;
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
                        libMgr.current.save();
                    }
                );
            }
        };

        $scope.copySelection = function() {
            if ($scope.mode!='edit') return;
            clearHash(libMgr.current.root);
            if (libMgr.current.selection.length) {
                libMgr.current.copySelection();
                update(libMgr.current);
            }
        };

        $scope.cutSelection = function() {
            if ($scope.mode!='edit') return;
            clearHash(libMgr.current.root);
            if (libMgr.current.selection.length) {
                libMgr.current.cutSelection();
                update(libMgr.current);
            }
        };

        $scope.paste = function() {
            if ($scope.mode!='edit') return;
            clearHash(libMgr.current.root);
            if (libMgr.current.clipboardContent.length) {
                // setTimeout to prevent angular convert a cicrulcar structure json
                setTimeout(() => {
                    libMgr.current.paste();
                    libMgr.current.save();
                    update(libMgr.current);
                },50);
            }
        };

        $scope.onDrag = function(fromNode,toNode) {
            if ($scope.mode!='edit') return;
            libMgr.current.moveNode(fromNode,toNode);
            libMgr.current.save();
            $scope.$apply();
        };

        $scope.onDragStart = function() {
        }
    }]);

    angularApp.directive("libraryInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/library-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {
                mode:"@",
                onInsertNode:"=?"
            },
            controller: 'LibraryInspectorController'
        }
    });

    angularApp.directive("dragDrop",function() {
        let dragIdCounter = 0;
        let g_objectData = {};
        return {
            link: function(scope,element) {
                scope.dragId = dragIdCounter++;
                g_objectData[scope.dragId] = scope.dragItem;
                element.on('dragover', function(event) {
                    event.preventDefault();
                    element[0].className = element[0].className.replace(/\s*bg2-drag-over/,"") + " bg2-drag-over";
                });

                element.on('dragleave', function(event) {
                    element[0].className = element[0].className.replace(/\s*bg2-drag-over/,"");
                });

                element.on('dragstart', function(event) {
                    event.dataTransfer.setData("Text",scope.dragId);
                    event.dataTransfer.effectAllowed = "move";
                    if (scope.onDragStart) {
                        scope.onDragStart();
                    }
                });

                element.on('drop', function(event) {
                    event.preventDefault();
                    if (scope.onDrag) {
                        let toObject = g_objectData[event.dataTransfer.getData("Text")];
                        scope.onDrag(toObject,scope.dragItem);
                    }
                    element[0].className = element[0].className.replace(/\s*bg2-drag-over/,"");
                })
            },
            scope: {
                dragItem:"=",
                onDrag:"=",
                onDragStart:"="
            }

        }
    })
});