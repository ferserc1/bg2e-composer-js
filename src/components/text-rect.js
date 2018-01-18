app.addSource(() => {
    app.components.addComponent(() => {

        function execCommand(cmd) {
            return new Promise((resolve,reject) => {
                app.CommandManager.Get().doCommand(cmd)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject();
                    })
            })
        }

        return class TextRectUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.TextRect","Text Rectangle","text-rect-ui");
            }

            createInstance() {
                let text = new bg.scene.TextRect(new bg.Vector2(3,1),new bg.Vector2(1500,500));
                text.textProperties.size = 200;
                return text;
            }
            

            updateText(text) {
                return execCommand(new app.textRectCommands.SetText(this.componentInstance.node,text));
            }

            updateRect(newRect) {
                return execCommand(new app.textRectCommands.SetRect(this.componentInstance.node,newRect));
            }

            updateTexture(newTexRect) {
                return execCommand(new app.textRectCommands.SetTextureSize(this.componentInstance.node,newTexRect));
            }

            updateProperties(properties,doubleSided,unlit) {
                return execCommand(new app.textRectCommands.SetProperties(this.componentInstance,properties,doubleSided,unlit));
            }
        };
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("textRectUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/text-rect-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope',function($scope) {
                $scope.fontOptions = [
                    { id:0, label:"Arial", value:"Arial" },
                    { id:1, label:"Helvetica", value:"Helvetica" },
                    { id:2, label:"Verdana", value:"Verdana" },
                    { id:3, label:"Courier", value:"Courier" },
                    { id:4, label:"serif", value:"serif" },
                    { id:5, label:"sans-serif", value:"sans-serif" },
                ];
                $scope.alignOptions = [
                    { id:0, label:"Left", value:"left" },
                    { id:1, label:"Center", value:"center" },
                    { id:2, label:"Right", value:"right" }
                ];

                function updateUI() {
                    $scope.text = $scope.component.componentInstance.text;
                    let textProperties = $scope.component.componentInstance.textProperties;
                    $scope.font = $scope.fontOptions[0];
                    $scope.align = $scope.alignOptions[0];
                    $scope.size = textProperties.size;
                    $scope.textColor = textProperties.color;
                    $scope.backgroundColor = textProperties.background;
                    $scope.bold = textProperties.bold;
                    $scope.italic = textProperties.italic;
                    $scope.doubleSided = $scope.component.componentInstance.doubleSided;
                    $scope.unlit = $scope.component.componentInstance.unlit;
                    $scope.rectSize = $scope.component.componentInstance.rectSize.toArray();
                    $scope.textureSize = $scope.component.componentInstance.textureSize.toArray();
                }

                updateUI();

                $scope.updateText = function() {
                    $scope.component.updateText($scope.text)
                        .then(() => app.ComposerWindowController.Get().updateView())
                }

                $scope.updateProperties = function() {
                    $scope.component.updateProperties(
                        {
                            align: $scope.align.value,
                            background: $scope.backgroundColor,
                            bold: $scope.bold,
                            color: $scope.textColor,
                            font: $scope.font.value,
                            italic: $scope.italic,
                            size: $scope.size
                        },
                        $scope.doubleSided,
                        $scope.unlit
                    )
                    .then(() => app.ComposerWindowController.Get().updateView())
                }

                $scope.updateRectangle = function() {
                    $scope.component.updateRect(new bg.Vector2($scope.rectSize))
                        .then(() => app.ComposerWindowController.Get().updateView());
                }

                $scope.updateTextureSize = function() {
                    $scope.component.updateTexture(new bg.Vector2($scope.textureSize))
                        .then(() => app.ComposerWindowController.Get().updateView());
                }
            }]
        }
    })
})