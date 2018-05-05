
app.addSource(() => {
   
    app.components.addComponent(() => {
        return class InputJointUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.InputChainJoint","Input joint","input-joint-ui");
            }

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
        return class InputJointUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.OutputChainJoint","Output joint","output-joint-ui");
            }

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

    angularApp.directive("inputJointUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/joint-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.jointType = "Input joint";
            }]
        }
    });

    angularApp.directive("outputJointUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/joint-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.jointType = "Output joint";
            }]
        }
    });
    
});