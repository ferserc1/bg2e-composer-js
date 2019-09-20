app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    let precission = 100000;
    function adjustNumericPrecission(srcValue) {
        if (typeof(srcValue)=="number") {
            return Math.round(srcValue * precission) / precission;
        }
        else {
            return srcValue;
        }
    }

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

                $scope.color = "#ffffff";
                let timeout = null;
                $scope.colorValueChanged = function(evt) {
                    let result = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/.exec($scope.color)
                    if (result) {
                        let r = parseInt("0x" + result[1]);
                        let g = parseInt("0x" + result[2]);
                        let b = parseInt("0x" + result[3]);
                        $scope.value[0] = r / 255;
                        $scope.value[1] = g / 255;
                        $scope.value[2] = b / 255;
                        if (timeout) {
                            clearTimeout(timeout)
                        }
                        timeout = setTimeout(() => {
                            if ($scope.commitChanges) {
                                $scope.commitChanges();
                            }
                        }, 100);
                    }
                }

                $scope.preview = { 'background-color': 'rgba(0,0,0,0)' };
                $scope.$watch("value", () => {
                    if (Array.isArray($scope.value)) {
                        let r = Math.round($scope.value[0] * 255);
                        let g = Math.round($scope.value[1] * 255);
                        let b = Math.round($scope.value[2] * 255);
                        $scope.preview['background-color'] = 'rgba('
                            + r + ',' +
                            + g + ',' +
                            + b + ',' +
                            + $scope.value[3] + ')';
                        
                        $scope.color = "#" + (r<16 ? "0":"") + r.toString(16)
                             + (g<16 ? "0":"") + g.toString(16)
                             + (b<16 ? "0":"") + b.toString(16);
                    }
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
                            setTimeout(() => $scope.commitChanges(),50);
                        }
                    }
                };

                $scope.clearTexture = function() {
                    $scope.value = "";
                    if ($scope.commitChanges) {
                        setTimeout(() => $scope.commitChanges(), 50);
                    }
                };

                $scope.getTextureImage = function() {
                    return $scope.value || `templates/${ app.config.templateName }/images/no_image.png`
                };
            }]
        }
    });

    angularApp.directive("filePicker", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/file-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?",
                filters:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.filters = $scope.filters || [];
                $scope.fileName = bg.utils.path.fileName($scope.value);
                $scope.$watch("value", () => {
                    $scope.fileName = bg.utils.path.fileName($scope.value);
                });

                $scope.pickFile = function() {
                    const { dialog } = require('electron').remote;

                    let filePath = dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters:$scope.filters
                    });
                    if (filePath) {
                        filePath = app.standarizePath(filePath[0]);
                        $scope.value = filePath;
                        if ($scope.commitChanges) {
                            setTimeout(() => $scope.commitChanges(filePath),10);
                        }
                    }
                };

                $scope.clearFile = function() {
                    $scope.value = "";
                    if ($scope.commitChanges) {
                        setTimeout(() => $scope.commitChanges(""),10);
                    }
                };
            }]
        }
    });

    angularApp.directive("pathPicker", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/file-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?",
                filters:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.fileName = $scope.value && bg.utils.path.fileName($scope.value);
                $scope.$watch("value", () => {
                    $scope.fileName = $scope.value && bg.utils.path.fileName($scope.value);
                });

                $scope.pickFile = function() {
                    const { dialog } = require('electron').remote;

                    let filePath = dialog.showOpenDialog({
                        properties: ['openDirectory']
                    });
                    if (filePath) {
                        filePath = app.standarizePath(filePath[0]);
                        $scope.value = filePath;
                        if ($scope.commitChanges) {
                            setTimeout(() => $scope.commitChanges(filePath),10);
                        }
                    }
                };

                $scope.clearFile = function() {
                    $scope.value = "";
                    if ($scope.commitChanges) {
                        setTimeout(() => $scope.commitChanges(""),10);
                    }
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
                            setTimeout(() => $scope.commitChanges(), 10);
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
                        setTimeout(() => $scope.commitChanges(), 10);
                    }
                }
                $scope.$watch('value', () => {
                    if (typeof($scope.value)!="boolean") {
                        $scope.value = $scope.value ? true : false;
                    }
                })
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
            controller: ['$scope','$timeout', function($scope,$timeout) {
                if (Array.isArray($scope.value)) {
                    $scope.x = adjustNumericPrecission(Number($scope.value[0]));
                    $scope.y = adjustNumericPrecission(Number($scope.value[1]));
                    $scope.z = adjustNumericPrecission(Number($scope.value[2]));
                    $scope.w = adjustNumericPrecission(Number($scope.value[3]));
                }
                else {
                    $scope.x = 0;
                    $scope.y = 0;
                    $scope.z = 0;
                    $scope.w = 0;
                }

                $scope.$watch('value',() => {
                    if (Array.isArray($scope.value)) {
                        $scope.x = adjustNumericPrecission(Number($scope.value[0]));
                        $scope.y = adjustNumericPrecission(Number($scope.value[1]));
                        $scope.z = adjustNumericPrecission(Number($scope.value[2]));
                        $scope.w = adjustNumericPrecission(Number($scope.value[3]));
                    }
                }, true);

                let timer = null;
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
                        $scope[index] -= inc;
                    }
                    if (event.key=="ArrowUp") {
                        $scope[index] += inc;
                    }

                    if (timer) {
                        $timeout.cancel(timer);
                    }
                    timer = $timeout(() => {
                        $scope.commit();
                        timer = null;
                    }, 500);
                };
                $scope.keyUp = function(index,event) {
                    if (event.key=="Enter") {
                        event.target.blur();
                        $scope.commit();
                    }
                }
                $scope.commit = function() {
                    if ($scope.value.length>=1) $scope.value[0] = adjustNumericPrecission(Number($scope.x));
                    if ($scope.value.length>=2) $scope.value[1] = adjustNumericPrecission(Number($scope.y));
                    if ($scope.value.length>=3) $scope.value[2] = adjustNumericPrecission(Number($scope.z));
                    if ($scope.value.length>=4) $scope.value[3] = adjustNumericPrecission(Number($scope.w));
                    if ($scope.commitChanges) {
                        $scope.commitChanges();
                    }
                }
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
                $scope.value = adjustNumericPrecission($scope.value);
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
                        $scope.vlaue = adjustNumericPrecission($scope.value);
                    }
                    if (event.key=="ArrowUp") {
                        $scope.value += inc - 0.0001;
                        $scope.vlaue = adjustNumericPrecission($scope.value);
                    }
                };
                $scope.commit = function() {
                    if ($scope.commitChanges) {
                        $scope.commitChanges();
                    }
                }
            }]
        };
    });

    angularApp.directive("stringPicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/string-picker.html`,
            scope: {
                label:"@",
                value:"=",
                commitChanges:"=?"
            },
            controller: ['$scope', function($scope) {
                $scope.valueChanged = false;
                $scope.keyUp = function(evt) {
                    if (evt.key=="Enter") {
                        evt.target.blur();
                    }
                    else {
                        $scope.valueChanged = true;
                    }
                }
                
                $scope.confirm = function(evt) {
                    $scope.valueChanged = false;
                    if ($scope.commitChanges) {
                        $scope.commitChanges();
                    }
                }
            }]
        };
    });

    angularApp.directive("translatePicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/translate-scale-picker.html`,
            scope: {
                onExecute:"="
            },
            controller: ['$scope',function($scope) {
                $scope.label = "Translate";
                $scope.x = 0;
                $scope.y = 0;
                $scope.z = 0;
                $scope.apply = function() {
                    if ($scope.onExecute) {
                        $scope.onExecute($scope.x,$scope.y,$scope.z);
                    }
                    $scope.x = 0;
                    $scope.y = 0;
                    $scope.z = 0;
                }
            }]
        }
    });

    angularApp.directive("rotatePicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/rotate-picker.html`,
            scope: {
                onExecute:"="
            },
            controller: ['$scope',function($scope) {
                $scope.alpha = 0;
                $scope.axises = [
                    { id:0, label:"X Axis", value:[1,0,0] },
                    { id:1, label:"Y Axis", value:[0,1,0] },
                    { id:2, label:"Z Axis", value:[0,0,1] }
                ]
                $scope.axis = $scope.axises[0];
                $scope.apply = function() {
                    if ($scope.onExecute) {
                        $scope.onExecute($scope.alpha,...$scope.axis.value);
                    }
                    $scope.alpha = 0;
                }
            }]
        }
    })

    angularApp.directive("scalePicker", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/translate-scale-picker.html`,
            scope: {
                onExecute:"="
            },
            controller: ['$scope',function($scope) {
                $scope.label = "Scale";
                $scope.x = 1;
                $scope.y = 1;
                $scope.z = 1;
                $scope.apply = function() {
                    if ($scope.onExecute) {
                        $scope.onExecute($scope.x,$scope.y,$scope.z);
                    }
                    $scope.x = 1;
                    $scope.y = 1;
                    $scope.z = 1;
                }
            }]
        }
    })

    angularApp.directive('autofocus', ["$timeout", function($timeout) {
        return {
            restrict: 'A',
            link: function($scope,$element) {
                $element[0].focus();
            }
        }
    }])
})