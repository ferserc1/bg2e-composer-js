(function() {

    class Bg2matLoaderPlugin extends bg.base.LoaderPlugin {
        acceptType(url,data) {
            return bg.utils.Resource.GetExtension(url)=="bg2mat";
        }

        load(context,url,data) {
            return new Promise((resolve,reject) => {
                if (data) {
                    try {
                        if (typeof(data)=="string") {
                            data = JSON.parse(data);
                        }
                        let promises = [];
                        let basePath = url.substring(0,url.lastIndexOf('/')+1);

                        data.forEach((matData) => {
                            promises.push(bg.base.Material.FromMaterialDefinition(context,matData,basePath));
                        });

                        Promise.all(promises)
                            .then((result) => {
                                resolve(result);
                            });
                    }
                    catch(e) {
                        reject(e);
                    }
                }
                else {
                    reject(new Error("Error loading material. Data is null."));
                }
            });
        }
    }

    bg.base.Bg2matLoaderPlugin = Bg2matLoaderPlugin;

})();