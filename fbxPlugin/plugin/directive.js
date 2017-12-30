

module.exports = function(app,angularApp,bg) {
    angularApp.directive("fbxPluginSettings", function() {
        return {
            restrict: 'E',
            template:'<h2>{{ title }}</h2><number-picker label="Import scale" value="scale" commit-changes="commit"></number-picker>',
            controller: ['$scope',function($scope) {
                $scope.title = "Autodesk FBX";
                $scope.scale = app.fbxPlugin.defaultScale;
                $scope.commit = function() {
                    app.fbxPlugin.defaultScale = $scope.scale;
                    app.settings.set("fbxPlugin.defaultScale",$scope.scale);
                }
            }]
        }
    });
}