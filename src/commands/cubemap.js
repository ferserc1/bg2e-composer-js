app.addSource(() => {
    app.cubemapCommands = {};

    class LoadCubemap extends app.Command {
        constructor(cubemap,posX,negX,posY,negY,posZ,negZ) {
            super();
            this._cubemap = cubemap;
            this._posX = posX;
            this._negX = negX;
            this._posY = posY;
            this._negY = negY;
            this._posZ = posZ;
            this._negZ = negZ;

            this._restorePosX = cubemap.getImageUrl(bg.scene.CubemapImage.POSITIVE_X);
            this._restoreNegX = cubemap.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X);
            this._restorePosY = cubemap.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y);
            this._restoreNegY = cubemap.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y);
            this._restorePosZ = cubemap.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z);
            this._restoreNegZ = cubemap.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z);
        }

        execute() {
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,this._posX);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,this._negX);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,this._posY);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,this._negY);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,this._posZ);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,this._negZ);
            return this._cubemap.loadCubemap(app.ComposerWindowController.Get().gl);
        }

        undo() {
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_X,this._restorePosX);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X,this._restoreNegX);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y,this._restorePosY);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y,this._restoreNegY);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z,this._restorePosZ);
            this._cubemap.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z,this._restoreNegZ);
            return this._cubemap.loadCubemap(app.ComposerWindowController.Get().gl);
        }
    }

    app.cubemapCommands.LoadCubemap = LoadCubemap;
})