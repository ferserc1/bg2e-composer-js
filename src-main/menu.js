module.exports = {
    buildMenu: function() {
        const {app, Menu} = require('electron')
        
        const template = [
          {
            label: 'File',
            submenu: [
              {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: function(item, focusedWindow) {
                  focusedWindow.webContents.send('triggerMenu', { msg:'openFile' });
                }
              }
            ]
          },
          {
            label: 'Edit',
            submenu: [
              {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                click: function(item, focusedWindow) {
                  focusedWindow.webContents.send('triggerMenu', { msg:'undo' });
                }
              },
              {
                label: 'Redo',
                accelerator: 'CmdOrCtrl+Shift+Z',
                click: function(item, focusedWindow) {
                  focusedWindow.webContents.send('triggerMenu', { msg:'redo' });
                }
              },
              {type: 'separator'},
              {role: 'cut'},
              {role: 'copy'},
              {role: 'paste'},
              {role: 'pasteandmatchstyle'},
              {role: 'delete'},
              {role: 'selectall'}
            ]
          },
          {
            label: 'View',
            submenu: [
              {
                label: 'Gizmo',
                submenu: [
                  {
                    label: 'Select',
                    accelerator: 'Q',
                    click: function(item, focusedWindow) {
                      focusedWindow.webContents.send('triggerMenu', { msg:'gizmoSelect' })
                    }
                  },
                  {
                    label: 'Translate',
                    accelerator: 'W',
                    click: function(item, focusedWindow) {
                      focusedWindow.webContents.send('triggerMenu', { msg:'gizmoTranslate' })
                    }
                  },
                  {
                    label: 'Rotate',
                    accelerator: 'E',
                    click: function(item, focusedWindow) {
                      focusedWindow.webContents.send('triggerMenu', { msg:'gizmoRotate' })
                    }
                  },
                  {
                    label: 'Scale',
                    accelerator: 'R',
                    click: function(item, focusedWindow) {
                      focusedWindow.webContents.send('triggerMenu', { msg:'gizmoScale' })
                    }
                  },
                  {
                    label: 'Transform',
                    accelerator: 'T',
                    click: function(item, focusedWindow) {
                      focusedWindow.webContents.send('triggerMenu', { msg:'gizmoTransform' })
                    }
                  }
                ]
              },
              {type: 'separator'},

              {role: 'reload'},
              {role: 'toggledevtools'},
              {type: 'separator'},
              {role: 'resetzoom'},
              {role: 'zoomin'},
              {role: 'zoomout'},
              {type: 'separator'},
              {role: 'togglefullscreen'}
            ]
          },
          {
            role: 'window',
            submenu: [
              {role: 'minimize'},
              {role: 'close'}
            ]
          },
          {
            role: 'help',
            submenu: [
              {
                label: 'Learn More',
                click () { require('electron').shell.openExternal('https://electron.atom.io') }
              }
            ]
          }
        ]
        
        if (process.platform === 'darwin') {
          template.unshift({
            label: app.getName(),
            submenu: [
              {role: 'about'},
              {type: 'separator'},
              {role: 'services', submenu: []},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideothers'},
              {role: 'unhide'},
              {type: 'separator'},
              {role: 'quit'}
            ]
          })
        
          // Edit menu
          template[2].submenu.push(
            {type: 'separator'},
            {
              label: 'Speech',
              submenu: [
                {role: 'startspeaking'},
                {role: 'stopspeaking'}
              ]
            }
          )
        
          // Window menu
          template[4].submenu = [
            {role: 'close'},
            {role: 'minimize'},
            {role: 'zoom'},
            {type: 'separator'},
            {role: 'front'}
          ]
        }
        
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
}