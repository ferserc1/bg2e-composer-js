
app.addSource(() => {
   
    app.components.addComponent(() => {
        return class ChainUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.Chain","Chain","chain-ui");
            }

            createInstance() {
                return new bg.scene.Chain();
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("chainUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/chain-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {

            }]
        }
    });
    
});