app.addSource(() => {

    class HelpCommandHandler extends app.CommandHandler {
        getMessages() {
            return [
                'about'
            ]
        }

        execute(message,params) {
            switch (message) {
            case 'about':
                app.ui.Help.ShowAbout();
                break;
            }
        }
    }

    new HelpCommandHandler();
})