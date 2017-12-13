module.exports = {
		buildMenu: function(debug = false) {
				const {app, Menu} = require('electron')
				
				const template = [
					{
						label: 'File',
						submenu: [
							{
								label: 'Open Scene...',
								accelerator: 'CmdOrCtrl+O',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'openScene' });
								}
							},
							{
								label: 'Save Scene',
								accelerator: 'CmdOrCtrl+S',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'saveScene' });
								}
							},
							{
								label: 'Save Scene As...',
								accelerator: 'CmdOrCtrl+Shift+S',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'saveSceneAs' });
								}
							},
							{type: 'separator'},
							{
								label: 'Import object',
								accelerator: 'CmdOrCtrl+Shift+O',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'openFile' })
								}
							},
							{
								label: 'Export selected',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'exportSelected' })
								}
							}
						]
					},
					{
						label: 'Edit',
						submenu: [
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
								//    accelerator: 'Q',
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'gizmoSelect' })
										}
									},
									{
										label: 'Translate',
								//    accelerator: 'W',
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'gizmoTranslate' })
										}
									},
									{
										label: 'Rotate',
								//    accelerator: 'E',
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'gizmoRotate' })
										}
									},
									{
										label: 'Scale',
								//    accelerator: 'R',
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'gizmoScale' })
										}
									},
									{
										label: 'Transform',
								//    accelerator: 'T',
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'gizmoTransform' })
										}
									}
								]
							},
							{type: 'separator'},

							{
								label: 'Graphic Settings',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'graphicSettings' })
								}
							}
						]
					},
					{
						label: 'Create',
						submenu: [
							{
								label: 'Empty Node',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'createEmptyNode' })
								}
							},
							{ type: 'separator' },
							{
								label: 'Add Component',
								submenu: [
									{ label: 'Camera', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createCameraComponent' }) }},
									{ label: 'Transform', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createTransformComponent' }) }},
									{ label: 'Light', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createLightComponent' }) }},
									{ label: 'Drawable', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createDrawableComponent' }) }},
									{ label: 'Cube', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createCubeComponent' }) }},
									{ label: 'Plane', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createPlaneComponent' }) }},
									{ label: 'Sphere', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createSphereComponent' }) }}
								]
							}
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

				if (debug) {
					template[2].submenu.push(
						{type: 'separator'},

						{role: 'reload'},
						{role: 'toggledevtools'}
					)
				}
				
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
						{
							label: 'Remove Node',
							accelerator: 'Backspace',
							click: function(item, focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'removeNode' })
							}
						}
					)
				
					// Window menu
					template[5].submenu = [
						{role: 'close'},
						{role: 'minimize'},
						{role: 'zoom'},
						{type: 'separator'},
						{role: 'front'}
					]
				}
				else {
					template[1].submenu.push(
						{
							label: 'Undo',
							click: function(item, focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'undo' });
							}
						},
						{
							label: 'Redo',
							click: function(item, focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'redo' });
							}
						},
						{type: 'separator'},
						{
							label: 'Remove Node',
							accelerator: 'Backspace',
							click: function(item, focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'removeNode' })
							}
						}
					)
				}
				
				const menu = Menu.buildFromTemplate(template)
				Menu.setApplicationMenu(menu)
		}
}