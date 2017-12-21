app.addDefinitions(() => {
    app.ui = app.ui || {};

});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    app.ui.addDragHandler(() => {
        return class NodeDragHandler extends app.ui.DragHandler {
            canDrag(src,dst) {
                return src instanceof bg.scene.Node && dst instanceof bg.scene.Node;
            }
    
            drag(src,dst) {
                return new Promise((resolve,reject) => {
                    let newParent = dst;
                    let nodeList = [];
                    let selection = app.render.Scene.Get().selectionManager.selection;
                    let isSourceSelected = false;   // Add the source to the selection, if is not selected
                    selection.forEach((item) => {
                        if (item.node) {
                            nodeList.push(item.node);
                        }
                        if (item.node==src) {
                            isSourceSelected = true;
                        }
                    });
                    if (!isSourceSelected) {
                        nodeList.push(src);
                    }
                    
                    app.CommandManager.Get().doCommand(new app.nodeCommands.SetParent(newParent,nodeList))
                        .then(() => {
                            newParent.expanded = true;
                            app.render.Scene.Get().notifySceneChanged();
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            }
        }
    })

    angularApp.factory("RecursionHelper", ['$compile', function($compile) {
        return {
            compile: function(element, link) {
                if (angular.isFunction(link)) {
                    link = { post: link };
                }

                let contents = element.contents().remove();
                let compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,

                    post: function(scope,element) {
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        
                        compiledContents(scope,function(clone) {
                            element.append(clone);
                        });

                        let children = element.children();
                        if (children.length) {
                            let el = children[0];  // H1 node
                            el.draggable = true;
                            el.data = scope.family;
                            el.addEventListener("dragstart", function(evt) {
                                if (!(this.data instanceof bg.scene.Node)) {
                                    // The root node is not an instance of bg.scene.Node
                                    this.data = app.render.Scene.Get().root;
                                }
                                app.ui.DragManager.Get().dragStart(this.data);
                                return false;
                            }, false);
                            el.addEventListener("dragover",function(evt) {
                                evt.preventDefault();
                                return false;
                            }, false);
                            el.addEventListener("drop", function(evt) {
                                if (!(this.data instanceof bg.scene.Node)) {
                                    // The root node is not an instance of bg.scene.Node
                                    this.data = app.render.Scene.Get().root;
                                }
                                app.ui.DragManager.Get().dragEnd(this.data);
                                return false;
                            }, false);
                        }

                        if (link && link.post) {
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        }
    }]);

    angularApp.directive("tree", function(RecursionHelper) {
        return {
            restrict: "E",
            scope: { family: '=' },
            templateUrl: `templates/${ app.config.templateName }/directives/tree-item.html`,
            compile: function(element) {
                return RecursionHelper.compile(element);
            },
            controller: ['$scope',function($scope) {
                $scope.toggleExpand = function() {
                    $scope.family.expanded = !$scope.family.expanded;
                };

                $scope.getName = function() {
                    return $scope.family.name || "<<untitled node>>";
                };
                
                $scope.toggleItem = function(event) {
                    if (!event.shiftKey) {
                        app.render.Scene.Get().selectionManager.clear();
                    }
                    app.render.Scene.Get().selectionManager.selectNode($scope.family);
                    app.render.Scene.Get().selectionController.showGizmoForNode($scope.family);
                };
            }]
        };
    });

    angularApp.controller("SceneInspectorController", ['$scope',function($scope) {
        $scope.node = {};
        function updateScene() {
            setTimeout(() => {
                $scope.node = app.render.Scene.Get().root;
                $scope.node.expanded = true;
                $scope.$apply(() => {});
            },10);
        }

        function expandNode(node) {
            node.expanded = true;
            if (node.parent) {
                expandNode(node.parent);
            }
        }

        function expandSelection() {
            let sel = app.render.Scene.Get().selectionManager.selection;
            sel = sel.length && sel[sel.length-1];
            if (sel.node) {
                expandNode(sel.node);
            }
        }

        app.render.Scene.Get().sceneChanged("sceneInspector",(sceneRoot) => {
            updateScene();
        });
        app.render.Scene.Get().selectionManager.selectionChanged("sceneInspector",(selectionManager) => {
            expandSelection();
            updateScene();
        });
        app.CommandManager.Get().onUndo("sceneInspector",() => {
            updateScene();
        });
        app.CommandManager.Get().onRedo("sceneInspector",() => {
            updateScene();
        });
        updateScene();
    }]);

    angularApp.directive('sceneInspector', () => {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/scene-inspector.html`,
            compile: app.workspaceElementCompile(),
            controller: 'SceneInspectorController'
        };
    });
});

