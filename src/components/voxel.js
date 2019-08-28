
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

        $scope.setIdentifier = function() {

        };

        $scope.setSideSize = function() {

        };

        $scope.setWidth = function() {

        };

        $scope.setHeight = function() {

        };

        $scope.setDepth = function() {

        };

        $scope.setOffset = function() {

        };

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