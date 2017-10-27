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
                }
            }]
        };
    });

    angularApp.controller("SceneInspectorController", ['$scope',function($scope) {
        $scope.node = {
            name: "Scene root",
            expanded: true,
            children: [
                {
                    name: "Cosa 1",
                    expanded: true,
                    children: [

                    ]
                },
                {
                    name: "Cosa 2",
                    expanded: true,
                    children: [
                        
                    ]
                },
                {
                    name: "Cosa 3",
                    expanded: true,
                    children: [
                        
                    ]
                },
                {
                    name: "Cosa 4",
                    expanded: true,
                    children: [
                        
                    ]
                },
                {
                    name: "Cosa 5",
                    expanded: true,
                    children: [
                        {
                            name: "Cosa 5 1",
                            expanded: true,
                            children: [
                                
                            ]
                        },
                        {
                            name: "Cosa 5 2",
                            expanded: true,
                            children: [
                                
                            ]
                        },
                        {
                            name: "Cosa 5 3",
                            expanded: true,
                            children: [
                                
                            ]
                        }
                    ]
                },
                {
                    name: "Cosa 6",
                    expanded: true,
                    children: [
                        
                    ]
                }

            ]
        }
    }]);

    angularApp.directive('sceneInspector', () => {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/scene-inspector.html`,
            controller: 'SceneInspectorController'
        };
    });
})