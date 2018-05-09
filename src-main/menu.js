module.exports = {
		buildMenu: function(debug = false) {
				const {app, Menu} = require('electron')
				
				const template = [
					{
						label: 'File',
						submenu: [
							{
								label: 'New Scene',
								accelerator: 'CmdOrCtrl+O',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'newScene' });
								}
							},
							{ type:'separator' },
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
							},
							{ type: 'separator' },
							{
								label: 'New Library',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'newLibrary' });
								}
							},
							{
								label: 'Open Library',
								click: function(item, focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'openLibrary' });
								}
							},
							{ type: 'separator' },
							{
								label: 'Plugin settings',
								click: function(item,focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'showPluginSettings' })
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
							{
								label: "3D Gizmos",
								submenu: [
									{
										label: "Camera",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleCamera3DGizmo' })
										}
									},
									{
										label: "Light",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleLight3DGizmo' })
										}
									},
									{
										label: "Orbit Camera Controller",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleOrbitCameraController3DGizmo' })
										}
									},
									{
										label: "Collider",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleCollider3DGizmo' })
										}
									},
									{ type: 'separator' },
									{
										label: "Show All",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'showAll3DGizmos' })
										}
									},
									{
										label: "Hide All",
										click: function(item,focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'hideAll3DGizmos' })
										}
									}
								]
							},
							{
								label: "Icons",
								submenu: [
									{
										label: "Camera",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleCameraIcon'} );
										}
									},
									{
										label: "Light",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleLightIcon'} );
										}
									},
									{
										label: "Transform",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleTransformIcon'} );
										}
									},
									{
										label: "Drawable",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleDrawableIcon'} );
										}
									},
									{
										label: "Text Rect",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'toggleTextRectIcon'} );
										}
									},
									{ type: 'separator' },
									{
										label: "Show all",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'showAllIcons'} );
										}
									},
									{
										label: "Hide all",
										click: function(item, focusedWindow) {
											focusedWindow.webContents.send('triggerMenu', { msg:'hideAllIcons'} );
										}
									},

								]
							},
							{ type: 'separator'},

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
							{
								label: 'Node',
								submenu: [
									{ label: 'Camera', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createCameraNode' }) }},
									{ label: 'Transform', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createTransformNode' }) }},
									{ label: 'Light', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createLightNode' }) }},
									{ label: 'Drawable', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createDrawableNode' }) }}
								]
							},
							{ type: 'separator' },
							{
								label: 'Add Component',
								submenu: [
									{ label: 'Camera', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createCameraComponent' }) }},
									{ label: 'Transform', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createTransformComponent' }) }},
									{ label: 'Light', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createLightComponent' }) }},
									{ label: 'Drawable', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg: 'createDrawableComponent' }) }}
								]
							}
						]
					},
					{
						label: 'Physics',
						submenu: [
							{
								label: 'Play',
								click: function(item,focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'play' });
								}
							},
							{
								label: 'Pause',
								click: function(item,focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'pause' });
								}
							},
							{
								label: 'Stop',
								click: function(item,focusedWindow) {
									focusedWindow.webContents.send('triggerMenu', { msg:'stop' });
								}
							}
						]
					},
					{
						role: 'window',
						submenu: [
							{role: 'minimize'},
							{role: 'close'},
							{type: 'separator'},
							{label: 'Scene editor', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'showSceneEditor' }) }},
							{label: 'Model editor', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'showModelEditor' }) }},
							{label: 'Library editor', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'showLibraryEditor' }) }}
						]
					},
					{
						role: 'help',
						submenu: [
							{
								label: 'About bg2e Composer',
								click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'about' }) }
							},
							{
								label: 'About Electron.js',
								click () { require('electron').shell.openExternal('https://electron.atom.io') }
							},
							{type:'separator'},
							{
								label: 'Online help',
								click() { require('electron').shell.openExternal('https://bitbucket.org/ferserc1/bg2e-composer-js/wiki/Home') }
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
						{ role: 'copy' },
						{ role: 'paste' },
						{type: 'separator'},
						{
							label: 'Group Nodes',
							accelerator: 'CmdOrCtrl+G',
							click: function(item,focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'groupNodes' })
							}
						},
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
						{role: 'front'},
						{type: 'separator'},
						{label: 'Scene editor', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'showSceneEditor' }) }},
						{label: 'Model editor', click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'showModelEditor' }) }},
					]
				}
				else {
					template[0].submenu.push({role: 'quit'});

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
						{ role: 'copy' },
						{ role: 'paste' },
						{type: 'separator'},
						{
							label: 'Group Nodes',
							accelerator: 'CmdOrCtrl+G',
							click: function(item,focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'groupNodes' })
							}
						},
						{
							label: 'Remove Node',
							accelerator: 'Backspace',
							click: function(item, focusedWindow) {
								focusedWindow.webContents.send('triggerMenu', { msg:'removeNode' })
							}
						}
					)
				}

				const Plugins = require(__dirname + '/../plugins').Plugins;
				let plugins = new Plugins(require(__dirname + '/../app'));

				plugins.menus.forEach((pluginMenuItem) => {
					let parentMenu = null;
					if (!template.every((templateItem) => {
						if (templateItem.label==pluginMenuItem.label) {
							parentMenu = templateItem;
						}
						return templateItem==null;
					})) {
						templateItem = {
							label:pluginMenuItem.label,
							submenu:[]
						};
						template.splice(template.length - 1, 0, templateItem);
					}

					let submenu = pluginMenuItem.submenu || [];
					submenu.forEach((pluginSubmenuItem) => {
						templateItem.submenu.push(pluginSubmenuItem);
					});

				});

				const menu = Menu.buildFromTemplate(template);
				Menu.setApplicationMenu(menu)
		}
}