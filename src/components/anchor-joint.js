app.addSource(() => {

    app.components.addComponent(() => {
        function executeCommand(cmd) {
            app.CommandManager.Get().doCommand(cmd)
            .then(() => app.ComposerWindowController.Get().updateView());
        }

        return class AnchorJointUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.AnchorJoint","Anchor Joint","anchor-joint-ui");
            }

            createInstance() {
                return new bg.scene.AnchorJoint();
            }

            addAnchorPoints(anchorPoints) {
                if (anchorPoints.length>0) {
                    executeCommand(new app.anchorJointCommands.AddAnchors(this.componentInstance, anchorPoints));
                }
            }

            removeAnchor(anchorIndex) {
                if (anchorIndex>=0 && anchorIndex<this.componentInstance.anchors.length) {
                    executeCommand(new app.anchorJointCommands.RemoveAnchor(this._componentInstance,anchorIndex));
                }
            }

            updateAnchor(anchor,offset,radius) {
                executeCommand(new app.anchorJointCommands.UpdateAnchor(anchor,offset,radius));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("anchorJointUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/anchor-joint-ui.html`,
            scope: {
                component: "="
            },
            controller: ['$scope', function($scope) {
                $scope.anchors = $scope.component.componentInstance.anchors;
                $scope.selectedAnchor = null;
                $scope.selectedAnchorRadius = 0;
                $scope.selectedAnchorOffset = [0,0,0];

                $scope.selectAnchor = function(anchor) {
                    $scope.selectedAnchor = anchor;
                    if (anchor) {
                        $scope.selectedAnchorRadius = anchor.radius;
                        $scope.selectedAnchorOffset = anchor.offset.toArray();
                    }
                }

                function getBoundingBox() {
                    let drawable = $scope.component &&
                            $scope.component.componentInstance && 
                            $scope.component.componentInstance.node &&
                            $scope.component.componentInstance.node.drawable;
                    if (drawable) {
                        return new bg.tools.BoundingBox(drawable);
                    }
                    else {
                        return null;
                    }
                }

                $scope.addBoundingBoxAnchors = function() {
                    let bb = getBoundingBox();
                    if (bb) {
                        let anchors = [
                            { x: bb.max.x, y: bb.min.y, z: bb.max.z, r: 0.15 },
			                { x: bb.max.x, y: bb.min.y, z: bb.min.z, r: 0.15 },
			                { x: bb.min.x, y: bb.min.y, z: bb.max.z, r: 0.15 },
			                { x: bb.min.x, y: bb.min.y, z: bb.min.z, r: 0.15 },
			                { x: bb.max.x, y: bb.max.y, z: bb.max.z, r: 0.15 },
			                { x: bb.max.x, y: bb.max.y, z: bb.min.z, r: 0.15 },
			                { x: bb.min.x, y: bb.max.y, z: bb.max.z, r: 0.15 },
                            { x: bb.min.x, y: bb.max.y, z: bb.min.z, r: 0.15 }
                        ];
                        $scope.component.addAnchorPoints(anchors);
                    }
                };

                $scope.addBottomAnchors = function() {
                    let bb = getBoundingBox();
                    if (bb) {
                        let anchors = [
                            { x: bb.max.x, y: bb.min.y, z: bb.max.z, r: 0.15 },
			                { x: bb.max.x, y: bb.min.y, z: bb.min.z, r: 0.15 },
			                { x: bb.min.x, y: bb.min.y, z: bb.max.z, r: 0.15 },
			                { x: bb.min.x, y: bb.min.y, z: bb.min.z, r: 0.15 }
                        ];
                        $scope.component.addAnchorPoints(anchors);
                    }
                };

                $scope.addAnchor = function() {
                    $scope.component.addAnchorPoints([ { x: 0, y: 0, z: 0, r: 0.15 } ]);
                };

                $scope.commitOffset = function() {
                    $scope.component.updateAnchor(
                        $scope.selectedAnchor,
                        $scope.selectedAnchorOffset,
                        $scope.selectedAnchorRadius);
                };

                $scope.commitRadius = function() {
                    $scope.component.updateAnchor(
                        $scope.selectedAnchor,
                        new bg.Vector3($scope.selectedAnchorOffset),
                        $scope.selectedAnchorRadius);
                };

                $scope.removeSelectedAnchor = function() {
                    let index = $scope.anchors.indexOf($scope.selectedAnchor);
                    if (index != -1) {
                        $scope.component.removeAnchor(index);
                    }
                };
            }]
        }
    });
});