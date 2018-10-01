
app.addSource(() => {

    function execCommand(cmd) {
        return new Promise((resolve) => {
            app.CommandManager.Get().doCommand(cmd)
            .then(() => app.ComposerWindowController.Get().updateView());
        })
    }

    class JointUI extends app.components.ComponentUI {
        constructor(componentType,title,directive) {
            super(componentType,title,directive);
        }

        rotate(x,y,z) {
            return execCommand.apply(this,[new app.jointCommands.SetEulerRotation(this.componentInstance.joint,x,y,z)]);
        }

        offset(x,y,z) {
            return execCommand.apply(this,[new app.jointCommands.SetOffset(this.componentInstance.joint,x,y,z)]);
        }
    }
   
    app.components.addComponent(() => {
        return class InputJointUI extends JointUI {
            constructor() {
                super("bg.scene.InputChainJoint","Input joint","input-joint-ui");
            }

            get jointType() { return "input"; }

            createInstance(selectedNode) {
                let comp = new bg.scene.InputChainJoint();
                let drw = selectedNode && selectedNode.drawable;
                if (selectedNode && drw) {
                    let bb = new bg.tools.BoundingBox(drw);
                    console.log(bb);
                    comp.joint.offset = new bg.Vector3(bb.halfSize.x, 0, bb.halfSize.z);
                }
                return comp;
            }
        }
    });

    app.components.addComponent(() => {
        return class OutputJointUI extends JointUI {
            constructor() {
                super("bg.scene.OutputChainJoint","Output joint","output-joint-ui");
            }

            get jointType() { return "output"; }

            createInstance(selectedNode) {
                let comp = new bg.scene.OutputChainJoint();
                let drw = selectedNode && selectedNode.drawable;
                if (selectedNode && drw) {
                    let bb = new bg.tools.BoundingBox(drw);
                    comp.joint.offset = new bg.Vector3(bb.halfSize.x, 0, -bb.halfSize.z);
                }
                return comp;
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("JointController", ['$scope',function($scope) {
        $scope.offset = [];
        $scope.rotation = [];

        $scope.updateValues = function() {
            let comp = $scope.component.componentInstance;
            $scope.offset = [comp.joint.offset.x,comp.joint.offset.y,comp.joint.offset.z];
            $scope.rotation = [
                bg.Math.radiansToDegrees(comp.joint.eulerRotation.x),
                bg.Math.radiansToDegrees(comp.joint.eulerRotation.y),
                bg.Math.radiansToDegrees(comp.joint.eulerRotation.z)
            ];
        }

        $scope.commitChangesOffset = function() {
            $scope.component.offset($scope.offset[0],$scope.offset[1],$scope.offset[2]);
        }

        $scope.commitChangesRotation = function() {
            $scope.component.rotate(
                bg.Math.degreesToRadians($scope.rotation[0]),
                bg.Math.degreesToRadians($scope.rotation[1]),
                bg.Math.degreesToRadians($scope.rotation[2]));
        }

        app.render.Scene.Get().selectionManager.selectionChanged("jointUi" + $scope.component.jointType, () => {
            setTimeout(() => {
                $scope.updateValues();
                $scope.$apply();
            },50);
        });

        $scope.updateValues();
    }]);

    angularApp.directive("inputJointUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/joint-ui.html`,
            scope: {
                component: "="
            },
            controller: 'JointController'
        }
    });

    angularApp.directive("outputJointUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/joint-ui.html`,
            scope: {
                component: "="
            },
            controller: 'JointController'
        }
    });
    
});