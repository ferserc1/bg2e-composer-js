app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);
    
    angularApp.controller("SceneEditorController", ['$scope', function($scope) {
        console.log("Scene editor controller");

        app.render.Scene.Get().sceneWillClose("sceneEditorController", (oldScene) => {
            console.log("The scene will be closed");
            return true;
        });

        app.render.Scene.Get().sceneWillOpen("sceneEditorController", (oldScene,newScene) => {
            console.log("Open new scene");
        });
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