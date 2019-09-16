
app.addSource(() => {

    app.components.addComponent(() => {
        return class VoxelGridUI extends app.components.ComponentUI {
            constructor() {
                super("bg.scene.VoxelGrid","Voxel Grid","voxel-grid-ui");
            }

            createInstance(selectedNode) {
                let comp = new bg.scene.VoxelGrid();
                return comp;
            }

            updateComponentData(size,x,y,offset) {
                // // TODO: Implement using commands
                // try {
                //     this.componentInstance.gridSize = size;
                //     this.componentInstance.x = x;
                //     this.componentInstance.y = y;
                //     this.componentInstance.offset = new bg.Vector3(offset);
                // } catch(err) {
                //     console.error(err.message);
                // }

                app.CommandManager.Get().doCommand(
                    new app.voxelCommands.SetVoxelGridData(
                        this.componentInstance,
                        size,
                        x, y,
                        new bg.Vector3(offset))
                )
                .then(() => app.ComposerWindowController.Get().updateView())
                .catch((err) => console.error(err.message));
            }
        }
    });

    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.controller("VoxelGridController",['$scope', function($scope) {
        $scope.gridSize = 0.2;
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
            { id:10, label:"10" },
            { id:11, label:"11" },
            { id:12, label:"12" },
            { id:13, label:"13" },
            { id:14, label:"14" },
            { id:15, label:"15" },
            { id:16, label:"16" },
            { id:17, label:"17" },
            { id:18, label:"18" },
            { id:19, label:"19" },
            { id:20, label:"20" },
            { id:21, label:"21" },
            { id:22, label:"22" },
            { id:23, label:"23" },
            { id:24, label:"24" },
            { id:25, label:"25" },
            { id:26, label:"26" },
            { id:27, label:"27" },
            { id:28, label:"28" },
            { id:29, label:"29" },
            { id:30, label:"30" }
        ];
        $scope.width = $scope.sizeOptions[0];
        $scope.depth = $scope.sizeOptions[0];
        $scope.offset = [0,0,0];

        function findGridSize(id) {
            let result = $scope.sizeOptions[0];
            $scope.sizeOptions.some((s) => {
                if (s.id==id) {
                    result = s;
                    return true;
                }
            });
            return result;
        }

        $scope.update = function() {
            $scope.component.updateComponentData(
                $scope.gridSize,
                $scope.width.id,
                $scope.depth.id,
                $scope.offset
            );
            app.ComposerWindowController.Get().updateView();
        };

        $scope.updateValues = function() {
            let comp = $scope.component.componentInstance;
            $scope.gridSize = comp.gridSize;
            $scope.width = findGridSize(comp.x);
            $scope.depth = findGridSize(comp.y);
            $scope.offset = comp.offset.toArray();
        };

        app.render.Scene.Get().selectionManager.selectionChanged("voxelGridUi", () => {
            setTimeout(() => {
                $scope.updateValues();
                $scope.$apply();
            });
        })
        $scope.updateValues();
    }]);

    angularApp.directive("voxelGridUi", function() {
        return {
            restrict: "E",
            templateUrl: `templates/${ app.config.templateName }/directives/voxel-grid-ui.html`,
            scope: {
                component: "="
            },
            controller: "VoxelGridController"
        }
    });
});