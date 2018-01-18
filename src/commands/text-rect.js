app.addSource(() => {
    app.textRectCommands = {};

    class SetText extends app.Command {
        constructor(node,newText) {
            super();
            this._node = node;
            this._comp = node.component("bg.scene.TextRect");
            this._prevText = this._comp && this._comp.text;
            this._newText = newText;
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._comp) {
                    reject(new Error("Invalid node: no such text rect component found"));
                }
                this._comp.text = this._newText;
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._comp.text = this._prevText;
                resolve();
            })
        }
    }

    app.textRectCommands.SetText = SetText;

    class SetProperties extends app.Command {
        constructor(node,props,doubleSided,unlit) {
            super();
            this._node = node;
            this._comp = node.component("bg.scene.TextRect");
            this._props = props;
            this._doubleSided = doubleSided;
            this._unlit = unlit;
            if (this._comp ) {
                this._prevProps = {};
                this._comp.textProperties.serialize(this._prevProps);
                this._prevDoubleSided = this._comp.doubleSided;
                this._prevUnlit = this._comp.unlit;
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._comp) {
                    reject(new Error("Invalid node: no such text rect component found"));
                }
                this._comp.textProperties.deserialize(this._props);
                this._comp.doubleSided = this._doubleSided;
                this._comp.unlit = this._unlit;
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._comp.textProperties.deserialize(this._prevProps);
                this._comp.doubleSided = this._prevDoubleSided;
                this._comp.unlit = this._prevUnlit;
                resolve();
            })
        }
    }

    app.textRectCommands.SetProperties = SetProperties;

    class SetRect extends app.Command {
        constructor(node,newSize) {
            super();
            this._node = node;
            this._comp = node.component("bg.scene.TextRect");
            this._newSize = newSize;
            if (this._comp) {
                this._prevRect = new bg.Vector2(this._comp.rectSize);
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._comp) {
                    reject(new Error("Invalid node: no such text rect component found"));
                }
                this._comp.rectSize = new bg.Vector2(this._newSize);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._comp.rectSize = new bg.Vector2(this._prevRect);
                resolve();
            })
        }
    }

    app.textRectCommands.SetRect = SetRect;

    class SetTextureSize extends app.Command {
        constructor(node,newSize) {
            super();
            this._node = node;
            this._comp = node.component("bg.scene.TextRect");
            this._newSize = newSize;
            if (this._comp) {
                this._prevRect = new bg.Vector2(this._comp.textureSize);
            }
        }

        execute() {
            return new Promise((resolve,reject) => {
                if (!this._comp) {
                    reject(new Error("Invalid node: no such text rect component found"));
                }
                this._comp.textureSize = new bg.Vector2(this._newSize);
                resolve();
            })
        }

        undo() {
            return new Promise((resolve) => {
                this._comp.textureSize = new bg.Vector2(this._prevRect);
                resolve();
            })
        }
    }

    app.textRectCommands.SetTextureSize = SetTextureSize;
});