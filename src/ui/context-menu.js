app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("contextMenu", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/context-menu.html`,
            scope: {

            },
            controller: ['$scope',function($scope) {
                $scope.hideMenu = function() {
                    $scope.visible = false;
                };

                $scope.selectOption = function(option) {
                    if ($scope.onSelected) {
                        $scope.onSelected(option);
                    }
                    $scope.visible = false;
                };

                $scope.visible = false;

                $scope.options = [
                    { id:1, label:"Option 1" },
                    { id:2, label:"Option 2" },
                    { id:3, label:"Option 3" },
                    { id:4, label:"Option 4" },
                    { id:5, label:"Option 5" }
                ];

                $scope.x = 0;
                $scope.y = 0;

                $scope.onSelected = null;

                app.on("trigger-context-menu", "contextMenu", (params) => {
                    setTimeout(() => {
                        $scope.visible = true;
                        $scope.options = params.options;
                        $scope.onSelected = params.onSelected;
                        $scope.x = params.x;
                        $scope.y = params.y;
                        $scope.$apply();
                    },10);
                });

                $scope.getStylePosition = function() {
                    let hw = window.innerWidth / 2;
                    let hh = window.innerHeight / 2;
                    
                    if (hw>$scope.x && hh>$scope.y) {
                        return { left: `${ $scope.x }px`, top: `${ $scope.y }px;` };
                    }
                    else if (hw>$scope.x && hh<$scope.y) {
                        return { left: `${ $scope.x }px`, bottom: `${ window.innerHeight - $scope.y }px` };
                    } 
                    else if (hw<$scope.x && hh>$scope.y) {
                        return { right: `${ window.innerWidth - $scope.x }px`, top: `${ $scope.y }px` };
                    }
                    else if (hw<$scope.x && hh<$scope.y) {
                        return { right: `${ window.innerWidth - $scope.x }px`, bottom: `${ window.innerHeight - $scope.y }px` };
                    }
                    else return {}
                };
            }]
        }
    });

    app.ui = app.ui || {};

    app.ui.contextMenu = {
        // Two signatures:
        //      posX, posY, options, onSelected
        //      mouseEvent, options, onSelected
        show: function(a,b,c,d) {
            let x = 0;
            let y = 0;
            let options = [];
            let onSelected = [];
            if (typeof(a)=='number') {
                x = a;
                y = b;
                options = c;
                onSelected = d;
            }
            else if (typeof(a)=='object' && a.clientX && a.clientY) {
                x = a.clientX;
                y = a.clientY;
                options = b;
                onSelected = c;
            }
            else {
                throw new Error("Invalid parameters");
            }
            
            app.trigger("trigger-context-menu",{ x:x, y:y, options:options, onSelected:onSelected });
        }
    };

})