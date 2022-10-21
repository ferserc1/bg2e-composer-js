(function() {

    class DrawGizmoVisitor extends bg.scene.DrawVisitor {
        constructor(pipeline,matrixState) {
            super(pipeline,matrixState);
            this._sprite = bg.scene.PrimitiveFactory.PlanePolyList(pipeline.context,1,1,"z");

            this._gizmoScale = 1;

            this._gizmoIcons = [];

            this._show3dGizmos = true;
        }

        get gizmoScale() { return this._gizmoScale; }
        set gizmoScale(s) { this._gizmoScale = s; }

        get show3dGizmos() { return this._show3dGizmos; }
        set show3dGizmos(g) { this._show3dGizmos = g; }

        clearGizmoIcons() { this._gizmoIcons = []; }
        addGizmoIcon(type,icon,visible=true) { this._gizmoIcons.push({ type:type, icon:icon, visible:visible }); }
        setGizmoIconVisibility(type,visible) {
            this._gizmoIcons.some((iconData) => {
                if (iconData.type==type) {
                    iconData.visible = visible;
                }
            })
        }

        get gizmoIcons() { return this._gizmoIcons; }

        getGizmoIcon(node) {
            let icon = null;
            this._gizmoIcons.some((iconData) => {
                if (node.component(iconData.type) && iconData.visible) {
                    icon = iconData.icon;
                    return true;
                }
            });
            return icon;
        }

        visit(node) {
            super.visit(node);

            let icon = this.getGizmoIcon(node);
            let gizmoOpacity = this.pipeline.effect.gizmoOpacity;
            let gizmoColor = this.pipeline.effect.color;
            this.pipeline.effect.color = bg.Color.White();
            let dt = this.pipeline.depthTest;
            this.pipeline.depthTest = false;
            if (icon) {
                this.pipeline.effect.texture = icon;
                this.pipeline.effect.gizmoOpacity = 1;
                this.matrixState.viewMatrixStack.push();
                this.matrixState.modelMatrixStack.push();
                this.matrixState.viewMatrixStack.mult(this.matrixState.modelMatrixStack.matrix);
                this.matrixState.modelMatrixStack.identity();
                this.matrixState.viewMatrixStack.matrix.setRow(0,new bg.Vector4(1,0,0,0));
                this.matrixState.viewMatrixStack.matrix.setRow(1,new bg.Vector4(0,1,0,0));
                this.matrixState.viewMatrixStack.matrix.setRow(2,new bg.Vector4(0,0,1,0));
                let s = this.matrixState.cameraDistanceScale * 0.05 * this._gizmoScale;
                this.matrixState.viewMatrixStack.scale(s,s,s);
                this.pipeline.draw(this._sprite);
    
                this.matrixState.viewMatrixStack.pop();
                this.matrixState.modelMatrixStack.pop();
                this.pipeline.effect.gizmoOpacity = gizmoOpacity;
                this.pipeline.effect.texture = null;
            }
            if (this._show3dGizmos) {
                node.displayGizmo(this.pipeline,this.matrixState);
            }
            this.pipeline.effect.color = gizmoColor;
            this.pipeline.depthTest = dt;
        }

    }

    bg.manipulation = bg.manipulation || {};
    bg.manipulation.DrawGizmoVisitor = DrawGizmoVisitor;
})();