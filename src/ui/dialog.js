app.addDefinitions(() => {
    let g_resolve = null;
    let g_reject = null;

    class DialogView {
        static Show(params) {
            if (g_reject) {
                g_reject();
            }
            params.type = params.type || 'modal';
            params.title = params.title || 'Dialog';
            params.showClose = params.showClose!==undefined ? params.showClose : true;
            app.trigger("showDialog",params);
            return new Promise((resolve,reject) => {
                g_resolve = resolve;
                g_reject = reject;
            });
        }

        static Close() {
            app.trigger("hideDialog",{});
            if (g_reject) g_reject();
        }

        static Ok(result) {
            app.trigger("hideDialog",{});
            if (g_resolve) g_resolve(result);
        }
    }

    app.ui = app.ui || {};
    app.ui.DialogView = DialogView;

    // Example:
    //app.ui.DialogView.Show({
    //    templateUrl:`templates/${ app.config.templateName }/directives/test.html`,
    //    type: 'modal',
    //    showClose: true,
    //    onAccept: function() { return "promise return value on accept"; }
    //}).then((result) => console.log(result));
    //...
    //app.ui.DialogView.Ok("test"); > this will resolve the returned promise from DialogView.Show
    //app.ui.Close();   > this will reject the returned promise from DialogView.Show

    class DialogInput {
        static Show(params) {
            return new Promise((resolve,reject) => {
                params.ok = function(value) {
                    resolve(value);
                }
                params.cancel = function() {
                    reject();
                }
                app.trigger("showInputDialog",params);
            });
        }

        static Close() {
            app.trigger("hideInputDialog");
        }

        static Ok() {
            app.trigger("hideInputDialog");
        }
    }

    app.ui.DialogInput = DialogInput;

    // Example:
    // app.ui.DialogInput.Show({
    //     x: 10,
    //     y: 10,
    //     value: 12.5,
    //     validator: (value) => /^-?\d+(\.\d+)?$/.test(value)
    // }).then((value) => console.log(value))
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    function getElementByClassName(elem,className) {
        let re = new RegExp(className);
        let result = null;
        if (re.test(elem.className)) {
            elem.innerHTML = "";
            result = angular.element(elem);
        }
        else {
            for (let i = 0; i<elem.children.length; ++i) {
                let child = elem.children[i];
                result = getElementByClassName(child,className);
                if (result) break;
            }
        }
        return result;
    }

    angularApp.directive("dialogView", ['$templateRequest','$compile',function($templateRequest,$compile) {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/dialog-view.html`,
            link: function(scope,element) {
                app.configureWorkspaceElement(element);
                scope.setContent = function(params) {
                    $templateRequest(params.templateUrl + '?cache=' + Math.random())
                        .then((html) => {
                            let template = angular.element(html);
                            let content = getElementByClassName(element[0],'bg2-dialog-content');
                            let title = getElementByClassName(element[0],'bg2-dialog-title');
                            scope.data = params.data || {};
                            content.append(template);
                            title[0].innerHTML = params.title;
                            $compile(template)(scope);
                        });
                }
            },
            controller: ['$scope','$compile',function($scope) {
                $scope.visible = false;
                $scope.result = null;

                $scope.close = function() {
                    app.ui.DialogView.Close();
                };

                $scope.accept = function() {
                    if (typeof($scope.onAccept)=="function") {
                        app.ui.DialogView.Ok($scope.onAccept($scope.result));
                    }
                    else {
                        app.ui.DialogView.Ok();
                    }
                };

                app.on("showDialog","dialogView",(params) => {
                    $scope.visible = true;
                    $scope.type = params.type;
                    $scope.showAccept = typeof(params.onAccept)=="function";
                    $scope.showClose = params.showClose;
                    $scope.onAccept = params.onAccept;
                    $scope.setContent(params);
                    $scope.$apply();
                });

                app.on("hideDialog","dialogView",(params) => {
                    $scope.visible = false;
                    $scope.$apply();
                });
            }]
        };
    }]);

    angularApp.directive("dialogInput", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/dialog-input.html`,
            scope: {

            },
            link: function(scope, element) {
                scope.inputElement = element.find("input")[0];
                scope.containerElement = scope.inputElement.parentElement;
            },
            controller: ['$scope', function($scope) {
                $scope.visible = false;
                $scope.position = { x:0, y:0 };
                $scope.value = "";
                $scope.validationError = false;
                let cancelFunc = null;
                let okFunc = null;
                let validator = null;

                app.on("showInputDialog","dialogInput", (params) => {
                    $scope.visible = true;
                    $scope.position.x = params.x;
                    $scope.position.y = params.y;
                    $scope.value = params.value;
                    cancelFunc = params.cancel;
                    okFunc  = params.ok;
                    validator = params.validator;
                    $scope.$apply();
                    setTimeout(() => {
                        $scope.inputElement.focus();

                        // Check bounds
                        let fieldWidth = $scope.containerElement.clientWidth + 60;
                        let fieldRight = window.innerWidth - (params.x + fieldWidth);
                        if (fieldRight<0) {
                            $scope.position.x = window.innerWidth - fieldWidth;
                            $scope.$apply();
                        }
                    },10);
                });

                app.on("hideDialogInput","dialogInput", (params) => {
                    $scope.visible = false;
                    $scope.$apply();
                });

                $scope.cancel = function() {
                    $scope.visible = false;
                    if (cancelFunc) {
                        cancelFunc();
                    }
                };

                $scope.ok = function() {
                    if (validator && !validator($scope.value)) {
                        return;
                    }
                    $scope.validationError = false;
                    $scope.visible = false;
                    if (okFunc) {
                        okFunc($scope.value);
                    }
                };

                $scope.keyUp = function(evt) {
                    if (validator && !validator($scope.value)) {
                        $scope.validationError = true;
                    }
                    else {
                        $scope.validationError = false;
                    }
                    
                    if (evt.key=="Enter") {
                        $scope.ok();
                    }
                    else if (evt.key=="Esc") {
                        $scope.cancel();
                    }
                };

                $scope.click = function(evt) {
                    evt.stopPropagation();
                };
            }]
        }
    })
});