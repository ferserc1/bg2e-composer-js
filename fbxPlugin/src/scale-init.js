app.addSource(() => {
    if (app.fbxPlugin.available) {
        app.fbxPlugin.defaultScale = app.settings.get("fbxPlugin.defaultScale") || 0.01;
        app.fbxPlugin.applyTransforms = app.settings.get("fbxPlugin.applyTransforms") || false;
    }
});

app.addPluginSettings('fbx-plugin-settings');