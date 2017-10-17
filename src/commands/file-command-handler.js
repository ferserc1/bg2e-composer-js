app.addSource(() => {

    class FileCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                "openFile"
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'openFile':
                this.openFile(params);
                break;
            }
        }

        openFile() {
            const {dialog} = require('electron').remote;
            
            let filePath = dialog.showOpenDialog({ properties: ['openFile']});
            if (filePath && filePath.length>0) {
                bg.base.Loader.Load(this.gl,filePath[0])
                    .then((node) => {
                        this._sceneRoot.addChild(node);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    }

    new FileCommandHandler();
})