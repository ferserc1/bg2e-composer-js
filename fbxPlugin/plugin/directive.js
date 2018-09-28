

module.exports = function(app,angularApp,bg) {
    angularApp.directive("fbxPluginSettings", function() {
        return {
            restrict: 'E',
            template:'<h2>{{ title }}</h2><number-picker label="Import scale" value="scale" commit-changes="saveScale"></number-picker><bool-picker label="Apply transforms" value="applyTransforms" commit-changes="saveApply"></bool-picker>',
            controller: ['$scope',function($scope) {
                $scope.title = "Autodesk FBX";
                $scope.scale = app.fbxPlugin.defaultScale;
                $scope.applyTransforms = app.fbxPlugin.applyTransforms;
                $scope.saveScale = function(value) {
                    app.fbxPlugin.defaultScale = $scope.scale;
                    app.settings.set("fbxPlugin.defaultScale",$scope.scale);
                };

                $scope.saveApply = function(value) {
                    app.fbxPlugin.applyTransforms = $scope.applyTransforms;
                    app.settings.set("fbxPlugin.applyTransforms",$scope.applyTransforms);
                };
            }]
        }
    });

    return {};
}