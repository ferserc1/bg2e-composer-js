(function() {
    function createCanvas(width,height) {
        let result = document.createElement("canvas");
        result.width  = width;
        result.height = height;
        result.style.width  = width + "px";
        result.style.height = height + "px";
        return result;
    }

    function resizeCanvas(canvas,w,h) {
        canvas.width  = w;
        canvas.height = h;
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px'; 
    }

    let g_texturePreventRemove = [];

    class CanvasTexture extends bg.app.ContextObject {

        constructor(context,width,height,drawCallback) {
            super(context);

            this._canvas = createCanvas(width,height);
                
            this._drawCallback = drawCallback;

            this._drawCallback(this._canvas.getContext("2d",{preserverDrawingBuffer:true}),this._canvas.width,this._canvas.height);
            this._texture = bg.base.Texture.FromCanvas(context,this._canvas);
        }

        get width() { return this._canvas.width; }
        get height() { return this._canvas.height; }
        get canvas() { return this._canvas; }
        get texture() { return this._texture; }

        resize(w,h) {
            resizeCanvas(this._canvas,w,h);
            this.update();
        }

        update() {
            this._drawCallback(this._canvas.getContext("2d",{preserverDrawingBuffer:true}),this.width,this.height);

			bg.base.Texture.UpdateCanvasImage(this._texture,this._canvas);
        }
    }

    bg.tools.CanvasTexture = CanvasTexture;
})();