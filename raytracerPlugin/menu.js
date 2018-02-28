
module.exports = {
    getMenu: function() {
        return {
            label:"Lighting",
            submenu: [
                {
                    label:"Render global ilumination",
                    click: (item,fw) => { fw.webContents.send('triggerMenu', { msg:'renderGlobalIllumination' })}
                }
            ]
        }
    }
}