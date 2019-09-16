app.addSource(() => {
    app.voxelCommands = {};

    class SetVoxelData extends app.Command {
        constructor(voxel,sideSize,w,h,d,offset) {
            super();
            this._voxel = voxel;
            this._sideSize = sideSize;
            this._size = {
                w: w,
                h: h,
                d: d
            };
            this._offset = offset;
        }

        execute() {
            return new Promise((resolve,reject) => {
                this._undoData = {
                    sideSize: this._voxel.sideSize,
                    size: {
                        w: this._voxel.width,
                        h: this._voxel.height,
                        d: this._voxel.depth
                    },
                    offset: new bg.Vector3(this._voxel.offset)
                }
                this._voxel.sideSize = this._sideSize;
                this._voxel.depth = this._size.d;
                this._voxel.width = this._size.w;
                this._voxel.height = this._size.h;
                this._voxel.offset = new bg.Vector3(this._offset);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._voxel.sideSize = this._undoData.sideSize;
                this._voxel.width = this._undoData.size.w;
                this._voxel.height = this._undoData.size.h;
                this._voxel.depth = this._undoData.size.d;
                this._voxel.offset = new bg.Vector3(this._undoData.offset);
                resolve();
            });
        }
    }

    app.voxelCommands.SetVoxelData = SetVoxelData;

    class SetVoxelGridData extends app.Command {
        constructor(voxelGrid,gridSize,x,y,offset) {
            super();
            this._voxelGrid = voxelGrid;
            this._gridSize = gridSize;
            this._x = x;
            this._y = y;
            this._offset = offset;
        }

        execute() {
            return new Promise((resolve) => {
                this._undoData = {
                    gridSize: this._voxelGrid.gridSize,
                    x: this._voxelGrid.x,
                    y: this._voxelGrid.y,
                    offset: new bg.Vector3(this._voxelGrid.offset)
                };
                this._voxelGrid.gridSize = this._gridSize;
                this._voxelGrid.x = this._x;
                this._voxelGrid.y = this._y;
                this._voxelGrid.offset = new bg.Vector3(this._offset);
                resolve();
            });
        }

        undo() {
            return new Promise((resolve) => {
                this._voxelGrid.gridSize = this._undoData.gridSize;
                this._voxelGrid.x = this._undoData.x;
                this._voxelGrid.y = this._undoData.y;
                this._voxelGrid.offset = new bg.Vector3(this._undoData.offset);
                resolve();
            });
        }
    }

    app.voxelCommands.SetVoxelGridData = SetVoxelGridData;
})