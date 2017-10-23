app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    
    angularApp.controller("SceneEditorController", ['$scope', function($scope) {
        console.log("Scene editor controller");
    }]);
});

app.addWorkspace(() => {
    return {
        name:"Scene editor",
        endpoint:'/sceneEditor',
        templateUrl: `templates/${ app.config.templateName }/views/scene-editor.html`,
        controller: 'SceneEditorController',
        isDefault:true
    }
});