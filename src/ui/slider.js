app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("SliderController",['$scope',function($scope) {
        
        $scope.valuePercent = 0;
        
        $scope.leftValue = 0;
        let handlerWidth = 0;
        
        $scope.sliderOptions = $scope.sliderOptions || {};
        $scope.sliderOptions.floor = $scope.sliderOptions.floor || 0;
        $scope.sliderOptions.ceil = $scope.sliderOptions.ceil || 255;
        $scope.sliderOptions.precision = $scope.sliderOptions.precision || 2;

        $scope.value = getValue();

        $scope.handlerWidth = function() {
            if (!handlerWidth) {
                handlerWidth = $scope.handler.getBoundingClientRect().width;
            }
            return handlerWidth;
        };

        function getValue() {
            let range = $scope.sliderOptions.ceil - $scope.sliderOptions.floor;
            let value = $scope.valuePercent * range / 100;
            return value + $scope.sliderOptions.floor;
        }

        function updatePosition(evt) {
            let w = evt.target.getBoundingClientRect().width;
            let x = evt.offsetX - $scope.handlerWidth() / 2;
            $scope.leftValue = x * 100 / w;
            $scope.valuePercent = Math.round(evt.offsetX * 100 / w);
            let range = $scope.sliderOptions.ceil - $scope.sliderOptions.floor;
            let value = $scope.valuePercent * range / 100;
            $scope.value = getValue();
        }

        $scope.onMouseDown = function(evt) {
            updatePosition(evt);
        };

        $scope.onMouseUp = function(evt) {
        };

        $scope.onMouseMove = function(evt) {
            if (evt.buttons) {
                updatePosition(evt);
               // console.log($scope.valuePercent);
//                console.log(evt.target);
//                console.log(evt.pageX - evt.target.getBoundingClientRect().left);
            }
        };
    }]);

    angularApp.directive("slider", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/slider.html`,
            scope: {
                sliderModel:"=",
                sliderOptions:"=?"
            },
            link: function(scope,elem) {
                console.log(elem);
                for (var i = 0; i<elem.children().children().length; ++i) {
                    let child = elem.children().children()[i];
                    if (child.className=='bg2-handler') {
                        scope.handler = child;
                    }
                }
            },
            controller:"SliderController"
        }
    })
})