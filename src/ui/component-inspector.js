app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("ComponentInspectorController",['$scope',function($scope) {
        $scope.selection = $scope.selection || [];
        $scope.selectedNode = null;
        $scope.components = [];
        $scope.nodeName = "";
        
        $scope.$watch("selection",function() {
            $scope.selectedNode = $scope.selection.length && $scope.selection[0];
            $scope.nodeName = $scope.selectedNode && $scope.selectedNode.name;
            $scope.components = [];
            $scope.unknownComponents = [];
            if ($scope.selectedNode) {
                for (let identifier in $scope.selectedNode._components)  {
                    let instance = $scope.selectedNode.component(identifier);
                    let ui = app.components.getUIForComponent(identifier) || {};
                    if (ui) {
                        ui.componentInstance = instance;
                        $scope.components.push(ui);
                    }
                    else {
                        $scope.unknownComponents.push(identifier);
                    }
                }
            }
        });
        
        $scope.addComponent = function() {
            app.ui.DialogView.Show({
                templateUrl:`templates/${ app.config.templateName }/directives/add-component-view.html`,
                title:"Add Component",
                showClose: false,
                type: 'modal-right bg2-modal-mini',
                onAccept:(result) => { return result; }
            })
                .then((comp) => {
                    if (comp && $scope.selectedNode) {
                        let instance = comp.createInstance();
                        app.CommandManager.Get().doCommand(
                            new app.nodeCommands.AddComponent($scope.selectedNode,instance)
                        )
                        .then(() => {
                            app.render.Scene.Get().notifySceneChanged();
                            app.ComposerWindowController.Get().updateView();
                        })
                        .catch((err) => {

                        })
                    }
                })
                .catch((err) => console.log(err));
        };

        $scope.removeComponent = function(componentUi) {
            let comp = componentUi.componentInstance;
            app.CommandManager.Get().doCommand(new app.nodeCommands.RemoveComponent(comp.node,comp))
                .then(() => {
                    app.render.Scene.Get().notifySceneChanged();
                    app.ComposerWindowController.Get().updateView();
                });
        };

        $scope.setNodeName = function() {
            app.CommandManager.Get().doCommand(
                new app.nodeCommands.SetName($scope.selectedNode,$scope.nodeName)
            )
            .then(() => {
                app.render.Scene.Get().notifySceneChanged();
            });
        };

    }]);

    angularApp.directive("componentInspector", function() {
        return {
            restrict: 'E',
            templateUrl: `templates/${ app.config.templateName }/directives/component-inspector.html`,
            compile: app.workspaceElementCompile(),
            scope: {
                selection:"="
            },
            controller: 'ComponentInspectorController'
        };
    });
})