app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("colorPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/color-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.options = {
                    floor: 0,
                    ceil: 1,
                    step: 0.0001,
                    precision: 2,
                    commitChanges:function() {
                        if ($scope.commitChanges) {
                            $scope.commitChanges();
                        }
                    }
                }

                $scope.preview = { 'background-color': 'rgba(0,0,0,0)' };
                $scope.$watch("value", () => {
                    $scope.preview['background-color'] = 'rgba('
                        + Math.round($scope.value[0] * 255) + ',' +
                        + Math.round($scope.value[1] * 255) + ',' +
                        + Math.round($scope.value[2] * 255) + ',' +
                        + $scope.value[3] + ')';
                }, true);
            }]
        };
    });

    angularApp.directive("texturePicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/texture-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.pickTexture = function() {
                    const { dialog } = require('electron').remote;

                    let filePath = dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            { name:"All compatible images", extensions:['jpg','jpeg','gif','png']},
                            { name:"PNG", extensions:['png']},
                            { name:"JPEG", extensions:['jpg','jpeg']},
                            { name:"GIF", extensions:['gif']}
                        ]
                    });
                    if (filePath) {
                        filePath = app.standarizePath(filePath[0]);
                        $scope.value = filePath;
                        if ($scope.commitChanges) {
                            $scope.commitChanges();
                        }
                    }
                };

                $scope.clearTexture = function() {
                    $scope.value = "";
                    if ($scope.commitChanges) {
                        $scope.commitChanges();
                    }
                };

                $scope.getTextureImage = function() {
                    return $scope.value || `templates/${ app.config.templateName }/images/no_image.png`
                };
            }]
        }
    });

    angularApp.directive("sliderPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/slider-picker.html`,
            scope: {
                label:"@",
                value:"=",
                min:"=",
                max:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.options = {
                    floor: $scope.min,
                    ceil: $scope.max,
                    step: 0.0001,
                    precision: 3,
                    commitChanges:function() {
                        if ($scope.commitChanges) {
                            $scope.commitChanges();
                        }
                    }
                };

            }]
        };
    });

    angularApp.directive("selectPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/select-picker.html`,
            scope: {
                label:"@",
                value:"=",
                options:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.value = $scope.value || $scope.options[0];
                $scope.userChanged = function() {
                    if ($scope.commitChanges) {
                        // setTimeout to ensure that the new value is updated
                        // before sending the user event
                        setTimeout(() => $scope.commitChanges(), 10);
                    }
                };
            }]
        };
    });

    let g_boolPickerId = 0;
    angularApp.directive("boolPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/bool-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.id = "boolPicker_" + (g_boolPickerId++);
                $scope.userChanged = function() {
                    if ($scope.commitChanges) {
                        $scope.commitChanges();
                    }
                }
            }]
        };
    });

    angularApp.directive("vectorPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/vector-picker.html`,
            scope: {
                label:"@",
                value:"=",
                increment:"=?",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.increment = $scope.increment || 1;
                $scope.keyDown = function(index,event) {
                    let inc = $scope.increment;
                    if (event.shiftKey) {
                        inc *= 10;
                    }
                    if (event.ctrlKey) {
                        inc *= 0.1;
                    }
                    if (event.key=="ArrowDown") {
                        $scope.value[index] -= inc - 0.0001;
                    }
                    if (event.key=="ArrowUp") {
                        $scope.value[index] += inc - 0.0001;
                    }
                    $scope.$watch("value",function() {
                        if ($scope.commitChanges) {
                            $scope.commitChanges();
                        }
                    });
                };
            }]
        };
    });

    angularApp.directive("numberPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/number-picker.html`,
            scope: {
                label:"@",
                value:"=",
                increment:"=?",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.increment = $scope.increment || 1;
                $scope.keyDown = function(event) {
                    let inc = $scope.increment;
                    if (event.shiftKey) {
                        inc *= 10;
                    }
                    if (event.ctrlKey) {
                        inc *= 0.1;
                    }
                    if (event.key=="ArrowDown") {
                        $scope.value -= inc - 0.0001;
                    }
                    if (event.key=="ArrowUp") {
                        $scope.value += inc - 0.0001;
                    }
                    $scope.$watch("value",function() {
                        if ($scope.commitChanges) {
                            $scope.commitChanges();
                        }
                    });
                };
            }]
        };
    });
})