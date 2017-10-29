app.addDefinitions(() => {
    app.ui = app.ui || {};

});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

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
                };
            }]
        };
    });

    angularApp.controller("SceneInspectorController", ['$scope',function($scope) {
        $scope.node = {
            name: "Scene root",
            expanded: true,
            children: []
        };
        function updateScene() {
            $scope.node = app.render.Scene.Get().root;
            $scope.node.expanded = true;
            setTimeout(() => $scope.$apply(),10);
        }

        app.render.Scene.Get().sceneChanged("sceneInspector",(sceneRoot) => {
            updateScene();
        });
        app.render.Scene.Get().selectionManager.selectionChanged("sceneInspector",(selectionManager) => {
            updateScene();
        })
        updateScene();
    }]);

    angularApp.directive('sceneInspector', () => {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/scene-inspector.html`,
            controller: 'SceneInspectorController'
        };
    });
})