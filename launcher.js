
const {app, BrowserWindow} = require('electron');

app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');

const url = require('url');
const path = require('path');
const menu = require(__dirname + '/src-main/menu');
const WindowStateManager = require('electron-window-state-manager');

function launch(indexFile,debug) {
    let win = null;
    
    const mainWindowState = new WindowStateManager('mainWindow', {
        defaultWidth: 1024,
        defaultHeight: 768
    });
    
    function createWindow() {
        win = new BrowserWindow({
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y,
            icon: path.join(__dirname, "data/bg2e-composer-512.png")
        });
        if (mainWindowState.maximized) {
            win.maximize();
        }
        win.loadURL(url.format({
            pathname: path.join(__dirname, indexFile),
            protocol: 'file',
            slashes: true
        }));
        win.on('close', () => {
            mainWindowState.saveState(win);
        });
    }
    
    app.on('ready', () => {
        createWindow();
    
        menu.buildMenu(debug);
    });    
}

module.exports = {
    launchRelease: function() {
        launch("index.html",false);
    },

    launchDebug: function() {
        launch("index-debug.html",true);
    }
}
