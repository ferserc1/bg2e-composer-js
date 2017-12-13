
app.addDefinitions(() => {
    app.ui = app.ui || {};

    app.ui.LogLevel = {
        INFO:"info",
        WARNING:"warning",
        ERROR:"error"
    };

    let g_log = null;
    class Log {
        static Get() {
            if (!g_log) {
                g_log = new Log();
            }
            return g_log;
        }

        constructor() {
            console.__log = console.log;
            console.__warn = console.warn;
            console.__error = console.error;
            this._messages = [];
            this._observers = {};
            console.log = function(message) {
                Log.Get().log(message,app.ui.LogLevel.INFO);
            };
            console.warn = function(message) {
                Log.Get().log(message,app.ui.LogLevel.WARNING);
            };
            console.error = function(message) {
                Log.Get().log(message,app.ui.LogLevel.ERROR);
            };
        }

        get messages() {
            return this._messages;
        }

        get lastMessageData() {
            let l = this._messages.length;
            if (l) {
                return this._messages[l-1];
            }
            else {
                return {
                    text:"",
                    level:"info"
                }
            }
        }

        get lastMessage() { return this.lastMessageData.text; }
        get lastLevel() { return this.lastMessageData.level; }

        log(message,level=app.ui.LogLevel.INFO) {
            switch (level) {
            case app.ui.LogLevel.INFO:
                if (console.__log) console.__log(message);
                break;
            case app.ui.LogLevel.WARNING:
                if (console.__warn) console.__warn(message);
                break;
            case app.ui.LogLevel.ERROR:
                if (console.__error) console.__error(message);
                break;
            }
            
            this._messages.push({
                text:message,
                level:level
            });
            this.notifyLogChanged();
        }

        logChanged(observer,callback) {
            this._observers[observer] = callback;
        }

        notifyLogChanged() {
            for (let key in this._observers) {
                this._observers[key]();
            }
        }
    }

    app.ui.Log = Log;

    // Initialize log
    Log.Get();
})