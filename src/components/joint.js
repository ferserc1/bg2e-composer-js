
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
        return class InputJointUI extends JointUI {
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
        $scope.rotationX = 0;
        $scope.rotationY = 0;
        $scope.rotationZ = 0;
        $scope.offsetX = 0;
        $scope.offsetY = 0;
        $scope.offsetZ = 0;

        $scope.$watch('rotationX',() => {
            $scope.component.rotate(
                bg.Math.degreesToRadians($scope.rotationX),
                bg.Math.degreesToRadians($scope.rotationY),
                bg.Math.degreesToRadians($scope.rotationZ));
        });

        $scope.$watch('rotationY',() => {
            $scope.component.rotate(
                bg.Math.degreesToRadians($scope.rotationX),
                bg.Math.degreesToRadians($scope.rotationY),
                bg.Math.degreesToRadians($scope.rotationZ));
        });

        $scope.$watch('rotationZ',() => {
            $scope.component.rotate(
                bg.Math.degreesToRadians($scope.rotationX),
                bg.Math.degreesToRadians($scope.rotationY),
                bg.Math.degreesToRadians($scope.rotationZ));
        });

        $scope.$watch('offsetX',() => {
            $scope.component.offset($scope.offsetX,$scope.offsetY,$scope.offsetZ);
        });

        $scope.$watch('offsetY',() => {
            $scope.component.offset($scope.offsetX,$scope.offsetY,$scope.offsetZ);
        });

        $scope.$watch('offsetZ',() => {
            $scope.component.offset($scope.offsetX,$scope.offsetY,$scope.offsetZ);
        });

        $scope.updateValues = function() {
            let comp = $scope.component.componentInstance;
            $scope.offsetX = comp.joint.offset.x;
            $scope.offsetY = comp.joint.offset.y;
            $scope.offsetZ = comp.joint.offset.z;
            $scope.rotationX = bg.Math.radiansToDegrees(comp.joint.eulerRotation.x);
            $scope.rotationY = bg.Math.radiansToDegrees(comp.joint.eulerRotation.y);
            $scope.rotationZ = bg.Math.radiansToDegrees(comp.joint.eulerRotation.z);
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