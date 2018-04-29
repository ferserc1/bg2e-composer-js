
const {app, BrowserWindow} = require('electron');

app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');
app.commandLine.appendSwitch('disable-http-cache');

const url = require('url');
const path = require('path');
const menu = require(__dirname + '/src-main/menu');
const WindowStateManager = require('electron-window-state-manager');

function launch(indexFile,debug) {
    let win = null;
    app.showExitPrompt = true;
    
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
        win.setMinimumSize(800,600);
        if (mainWindowState.maximized) {
            win.maximize();
        }
        win.loadURL(url.format({
            pathname: path.join(__dirname, indexFile),
            protocol: 'file',
            slashes: true
        }));
        win.on('close', (e) => {
            if (app.showExitPrompt) {
                e.preventDefault() // Prevents the window from closing 
                let { dialog } = require('electron');
                dialog.showMessageBox({
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm',
                    message: 'Unsaved data will be lost. Are you sure you want to quit?'
                }, function (response) {
                    if (response === 0) { // Runs the following if 'Yes' is clicked
                        app.showExitPrompt = false;
                        setTimeout(() => {
                            win.close();
                        },100);
                    }
                });
            }
            mainWindowState.saveState(win);
        });
    }
    
    app.on('ready', () => {
        createWindow();
    
        menu.buildMenu(debug);
    });

    app.on('window-all-closed', () => {
        app.quit();
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
