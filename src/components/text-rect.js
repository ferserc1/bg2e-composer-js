app.addSource(() => {
    app.components.addComponent(() => {
        return class TextRectUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.TextRect","Text Rectangle","text-rect-ui");
            }

            createInstance() {
                let text = new bg.scene.TextRect(new bg.Vector2(3,1),new bg.Vector2(1500,500));
                text.textProperties.size = 200;
                return text;
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
                    { id:0, label:"Arial" },
                    { id:1, label:"Helvetica" },
                    { id:2, label:"Verdana" },
                    { id:3, label:"Courier" },
                    { id:4, label:"serif" },
                    { id:5, label:"sans-serif" },
                ];
                $scope.alignOptions = [
                    { id:0, label:"Left" },
                    { id:1, label:"Center" },
                    { id:2, label:"Right" }
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
            }]
        }
    })
})