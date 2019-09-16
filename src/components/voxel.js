
app.addSource(() => {

    app.components.addComponent(() => {
        return class VoxelUI extends app.components.ComponentUI {
            constructor(componentType,title,directive) {
                super("bg.scene.Voxel","Voxel","voxel-ui");
            }
    
            createInstance(selectedNode) {
                let comp = new bg.scene.Voxel();
                return comp;
            }

            updateComponentData(id,size,w,h,d,offset) {
                app.CommandManager.Get().doCommand(
                    new app.voxelCommands.SetVoxelData(
                        this.componentInstance,
                        size,
                        w, h, d,
                        new bg.Vector3(offset))
                )
                .then(() => app.ComposerWindowController.Get().updateView())
                .catch((err) => console.error(err.message));
            }

            move(x,y) {
                let parent = this.componentInstance.node && this.componentInstance.node.parent;
                let grid = parent && parent.component("bg.scene.VoxelGrid");
                if (grid && parent) {
                    let pos = grid.getVoxelPosition(this.componentInstance);
                    pos.x += x;
                    pos.y += y;
                    grid.setVoxelPosition(this.componentInstance,pos.x, pos.y);
                }
            }

            rotate() {
                let r = this.componentInstance.rotationY;
                this.componentInstance.rotationY = (r==3 ? 0 : r + 1);
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("VoxelController", ['$scope', function($scope) {
        $scope.voxelId = "";
        $scope.sideSize = 0.2;
        $scope.sizeOptions = [
            { id:1, label:"1" },
            { id:2, label:"2" },
            { id:3, label:"3" },
            { id:4, label:"4" },
            { id:5, label:"5" },
            { id:6, label:"6" },
            { id:7, label:"7" },
            { id:8, label:"8" },
            { id:9, label:"9" },
            { id:10, label:"10" }
        ];
        $scope.width = $scope.sizeOptions[0];
        $scope.height = $scope.sizeOptions[0];
        $scope.depth = $scope.sizeOptions[0];
        $scope.offset = [0,0,0];

        function findSideSize(id) {
            let result = $scope.sizeOptions[0];
            $scope.sizeOptions.some((s) => {
                if (s.id==id) {
                    result = s;
                    return true;
                }
            });
            return result;
        }

        function updateComponent() {
            $scope.component.updateComponentData(
                $scope.voxelId,
                $scope.sideSize,
                $scope.width.id,
                $scope.height.id,
                $scope.depth.id,
                $scope.offset
            );
            app.ComposerWindowController.Get().updateView();
        }

        $scope.setSideSize = function(v) { updateComponent(); };
        $scope.setWidth = function(v) { updateComponent(); };
        $scope.setHeight = function(v) { updateComponent(); };
        $scope.setDepth = function(v) { updateComponent(); };
        $scope.setOffset = function(v) { updateComponent(); };

        $scope.moveLeft = function() {$scope.component.move(-1,0); app.ComposerWindowController.Get().updateView(); };
        $scope.moveRight = function() { $scope.component.move(1, 0); app.ComposerWindowController.Get().updateView(); };
        $scope.moveUp = function() { $scope.component.move(0, 1); app.ComposerWindowController.Get().updateView(); };
        $scope.moveDown = function() { $scope.component.move(0,-1); app.ComposerWindowController.Get().updateView();};
        $scope.rotate = function() { $scope.component.rotate(); app.ComposerWindowController.Get().updateView(); };

        $scope.updateValues = function() {
            let comp = $scope.component.componentInstance;
            $scope.voxelId = comp.identifier;
            $scope.sideSize = comp.sideSize;
            $scope.width = findSideSize(comp.width);
            $scope.height = findSideSize(comp.height);
            $scope.depth = findSideSize(comp.depth);
            $scope.offset = comp.offset.toArray();
        };

        app.render.Scene.Get().selectionManager.selectionChanged("voxelUi", () => {
            setTimeout(() => {
                $scope.updateValues();
                $scope.$apply();
            });
        });

        $scope.updateValues();

    }]);

    angularApp.directive("voxelUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/voxel-ui.html`,
            scope: {
                component: "="
            },
            controller: "VoxelController"
        }
    })
});