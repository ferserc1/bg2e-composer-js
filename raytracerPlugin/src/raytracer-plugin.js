app.raytracer = app.raytracer || {};

app.addSource(() => {
    let fs = require("fs");

    app.raytracer.commandPath = app.plugins.find("raytracer");
    if (/darwin/i.test(process.platform)) {
        // macOS
        app.raytracer.commandPath += '/macos/raytracer'
    }
    else if (/win/i.test(process.platform)) {
        // Windows
        app.raytracer.commandPath += '/win64/raytracer.exe'
    }

    app.raytracer.available = fs.existsSync(app.raytracer.commandPath);
    if (app.raytracer.available) {
        app.raytracer.draftQuality = {
            width: 256,
            height: 256,
            samples: 4,
            blur: 0
        };
        app.raytracer.midQuality = {
            width: 512,
            height: 512,
            samples: 30,
            blur: 2
        };
        app.raytracer.highQuality = {
            width: 2048,
            height: 2048,
            samples: 50,
            blur: 4
        };
    }

    new (class LightingCommandHandler extends app.CommandHandler {
        constructor() {
            super();
        }

        getMessages() {
            return [
                "renderGlobalIlumination"
            ];
        }

        execute(message,params) {
            if (message=='renderGlobalIlumination') {
                app.raytracer.renderLightmaps();
            }
        }
    });
});

app.addPluginSettings('raytracerPluginSettings');