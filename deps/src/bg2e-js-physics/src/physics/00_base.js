(function() {
    bg.physics = bg.physics || {};
    bg.physics.version = "@version@";
    var script = document.currentScript.src.split('/');
    script.pop();
    bg.physics.scriptLocation = script.join('/');


    bg.physics.ready = function(searchPath) {
        searchPath = searchPath || bg.physics.scriptLocation + '/ammo.js';
        return new Promise((resolve,reject) => {
            function checkLoaded() {
                if (!window.Ammo) {
                    setTimeout(() => checkLoaded(), 50);
                }
                else {
                    Ammo().then(() => resolve());
                }
            }
            bg.utils.requireGlobal(searchPath);
            checkLoaded();
        });
    }

})();