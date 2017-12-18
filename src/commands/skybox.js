app.addSource(() => {
    app.skyboxCommands = {};

    class LoadSkybox extends app.Command {
        constructor(skybox,posX,negX,posY,negY,posZ,negZ) {
            super();
            this._skybox = skybox;
            this._posX = posX;
            this._negX = negX;
            this._posY = posY;
            this._negY = negY;
            this._posZ = posZ;
            this._negZ = negZ;

            this._restorePosX = skybox.getImageUrl(bg.scene.CubemapImage.POSITIVE_X);
            this._restoreNegX = skybox.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X);
            this._restorePosY = skybox.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y);
            this._restoreNegY = skybox.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y);
            this._restorePosZ = skybox.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z);
            this._restoreNegZ = skybox.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z);
        }

        execute() {
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,this._posX);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,this._negX);
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,this._posY);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,this._negY);
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,this._posZ);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,this._negZ);
            return this._skybox.loadSkybox(app.ComposerWindowController.Get().gl);
        }

        undo() {
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,this._restorePosX);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,this._restoreNegX);
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,this._restorePosY);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,this._restoreNegY);
            this._skybox.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,this._restorePosZ);
            this._skybox.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,this._restoreNegZ);
            return this._skybox.loadSkybox(app.ComposerWindowController.Get().gl);
        }
    }

    app.skyboxCommands.LoadSkybox = LoadSkybox;
})