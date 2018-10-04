
app.addWorkspace(() => {
    return {
        name:"Scene editor",
        endpoint:'/sceneEditor',
        templateUrl: `templates/${ app.config.templateName }/views/scene-editor.html`,
        controller: 'SceneEditorController',
        isDefault:true,
        sceneMode: app.render.SceneMode.SCENE
    };
});

app.addWorkspace(() => {
    return {
        name:"Model editor",
        endpoint:'/modelEditor',
        templateUrl: `templates/${ app.config.templateName }/views/model-editor.html`,
        controller: 'ModelEditorController',
        isDefault: false,
        sceneMode: app.render.SceneMode.SCENE
    };
});

app.addWorkspace(() => {
    return {
        name:"Library editor",
        endpoint:'/libraryEditor',
        templateUrl: `templates/${ app.config.templateName }/views/library-editor.html`,
        controller: 'LibraryEditorController',
        isDefault: false,
        sceneMode: app.render.SceneMode.LIBRARY
    };
});