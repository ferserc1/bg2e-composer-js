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
            width: app.settings.get("raytracer.widthDraft") || 256,
            height: app.settings.get("raytracer.heightDraft") || 256,
            samples: app.settings.get("raytracer.samplesDraft") || 2,
            blur: app.settings.get("raytracer.blurDraft") || 0
        };
        app.raytracer.midQuality = {
            width: app.settings.get("raytracer.widthMid") || 512,
            height: app.settings.get("raytracer.heightMid") || 512,
            samples: app.settings.get("raytracer.samplesMid") || 30,
            blur: app.settings.get("raytracer.blurMid") || 2
        };
        app.raytracer.highQuality = {
            width: app.settings.get("raytracer.widthHigh") || 2048,
            height: app.settings.get("raytracer.heightHigh") || 2048,
            samples: app.settings.get("raytracer.samplesHigh") || 50,
            blur: app.settings.get("raytracer.blurHigh") || 4
        };
    }

    new (class LightingCommandHandler extends app.CommandHandler {
        constructor() {
            super();
        }

        getMessages() {
            return [
                "renderGlobalIllumination"
            ];
        }

        execute(message,params) {
            if (message=='renderGlobalIllumination') {
                app.raytracer.renderLightmaps();
            }
        }
    });
});

app.addPluginSettings('raytracer-plugin-settings');
