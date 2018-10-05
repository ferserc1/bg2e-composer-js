app.addSource(() => {

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Set Select Gizmo", "KeyQ", () => {
        app.CommandHandler.Get("ViewCommandHandler").setSelectGizmo();
    }));

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Set Translate Gizmo", "KeyW", () => {
        app.CommandHandler.Get("ViewCommandHandler").setTranslateGizmo();
    }));

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Set Rotate Gizmo", "KeyE", () => {
        app.CommandHandler.Get("ViewCommandHandler").setRotateGizmo();
    }));

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Set Scale Gizmo", "KeyR", () => {
        app.CommandHandler.Get("ViewCommandHandler").setScaleGizmo();
    }));

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Set Transform Gizmo", "KeyT", () => {
        app.CommandHandler.Get("ViewCommandHandler").setTransformGizmo();
    }));

    app.ShortcutManager.Get().addShortcut(new app.Shortcut("Zoom extent", "KeyZ", () => {
        app.CommandHandler.Get("ViewCommandHandler").zoomAll();
    }));
})