
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
                // TODO: Implement using commands
                try {
                    this.componentInstance.sideSize = size;
                    this.componentInstance.width = w;
                    this.componentInstance.height = h;
                    this.componentInstance.depth = d;
                    this.componentInstance.offset = new bg.Vector3(offset);
                } catch(err) {
                    console.error(err.message);
                }
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