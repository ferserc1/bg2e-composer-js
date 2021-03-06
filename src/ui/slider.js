app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("SliderController",['$rootScope','$scope',function($rootScope,$scope) {
        
        $scope.valuePercent = 0;
        
        $scope.leftValue = 0;
        let handlerWidth = 0;
        
        $scope.sliderOptions = $scope.sliderOptions || {};
        $scope.sliderOptions.floor = $scope.sliderOptions.floor || 0;
        $scope.sliderOptions.ceil = $scope.sliderOptions.ceil || 1;
        $scope.sliderOptions.precision = $scope.sliderOptions.precision || 2;

        $scope.value = getValue();

        $scope.handlerWidth = function() {
            if (!handlerWidth) {
                handlerWidth = $scope.handler.getBoundingClientRect().width;
            }
            return handlerWidth;
        };

        $scope.$watch("sliderModel", function() {
            updatePercent();
        });

        function updatePercent() {
            let range = $scope.sliderOptions.ceil - $scope.sliderOptions.floor;
            $scope.valuePercent = $scope.sliderModel * 100 / range - $scope.sliderOptions.floor;
            $scope.leftValue = $scope.valuePercent;
            $scope.value = getValue();
        }

        function getValue() {
            let range = $scope.sliderOptions.ceil - $scope.sliderOptions.floor;
            let value = $scope.valuePercent * range / 100;
            value = value + $scope.sliderOptions.floor
            value = value<$scope.sliderOptions.floor ? $scope.sliderOptions.floor : value;
            return value>=$scope.sliderOptions.ceil*0.99 ? $scope.sliderOptions.ceil : value;
        }

        function updatePosition(evt) {
            let w = evt.target.getBoundingClientRect().width;
            let x = evt.offsetX;
            $scope.leftValue = x * 100 / w;
            $scope.valuePercent = Math.round(evt.offsetX * 100 / w);
            let range = $scope.sliderOptions.ceil - $scope.sliderOptions.floor;
            let value = $scope.valuePercent * range / 100;
            $scope.value = getValue();
            $scope.sliderModel = $scope.value;
        }

        let ctrlKey = false;
        $scope.onMouseDown = function(evt) {
            if (evt.ctrlKey) {
                app.ui.DialogInput.Show({
                    x: evt.clientX,y: evt.clientY,
                    value: $scope.value,
                    validator: (value) => {
                        if (!/^-?\d+(\.\d+)?$/.test(value)) {
                            return false;
                        }
                        else {
                            let numValue = Number(value);
                            return numValue>=$scope.sliderOptions.floor && numValue<=$scope.sliderOptions.ceil;
                        }
                    }
                }).then((value) => {
                    $scope.sliderModel = value;
                    updatePercent();
                    $scope.$apply();
                    if ($scope.sliderOptions.commitChanges) {
                        $scope.sliderOptions.commitChanges();
                    }
                })
                .catch((err) => {

                });
                ctrlKey = true;
            }
            else {
                ctrlKey = false;
                updatePosition(evt);
            }
        };

        $scope.onMouseUp = function(evt) {
            if (ctrlKey) {
                return;
            }
            ctrlKey = false;
            if ($scope.sliderOptions.commitChanges) {
                $scope.sliderOptions.commitChanges();
            }
        };

        $scope.onMouseMove = function(evt) {
            if (evt.buttons) {
                updatePosition(evt);
            }
        };

        updatePercent();
    }]);

    angularApp.directive("slider", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/slider.html`,
            scope: {
                sliderModel:"=",
                sliderOptions:"=?"
                // sliderOptions:
                //  flor
                //  ceil
                //  precision
                //  onUserChanged
            },
            link: function(scope,elem) {
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