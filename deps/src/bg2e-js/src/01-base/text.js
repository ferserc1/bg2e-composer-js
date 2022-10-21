(function() {

    class TextProperties {

        constructor() {
            this._font = "Verdana";
            this._size = 30;
            this._color = "#FFFFFF";
            this._background = "transparent";
            this._align = "start";
            this._bold = false;
            this._italic = false;

            this._dirty = true;
        }

        clone() {
            let newInstance = new TextProperties();

            newInstance._font = this._font;
            newInstance._size = this._size;
            newInstance._color = this._color;
            newInstance._background = this._background;
            newInstance._align = this._align;
            newInstance._bold = this._bold;
            newInstance._italic = this._italic;

            return newInstance;
        }

        get font() { return this._font; }
        set font(v) { this._dirty = true; this._font = v; }
        get size() { return this._size; }
        set size(v) { this._dirty = true; this._size = v; }
        get color() { return this._color; }
        set color(v) { this._dirty = true; this._color = v; }
        get background() { return this._background; }
        set background(v) { this._dirty = true; this._background = v; }
        get align() { return this._align; }
        set align(v) { this._dirty = true; this._align = v; }
        get bold() { return this._bold; }
        set bold(v) { this._dirty = true; this._bold = v; }
        get italic() { return this._italic; }
        set italic(v) { this._dirty = true; this._italic = v; }
        

        // this property is set to true every time some property is changed
        set dirty(d) { this._dirty = d; }
        get dirty() { return this._dirty; }

        serialize(jsonData) {
            jsonData.font = this.font;
            jsonData.size = this.size;
            jsonData.color = this.color;
            jsonData.background = this.background;
            jsonData.align = this.align;
            jsonData.bold = this.bold;
            jsonData.italic = this.italic;
        }

        deserialize(jsonData) {
            this.font = jsonData.font;
            this.size = jsonData.size;
            this.color = jsonData.color;
            this.background = jsonData.background;
            this.align = jsonData.align;
            this.bold = jsonData.bold;
            this.italic = jsonData.italic;
            this._dirty = true;
        }
    }

    bg.base.TextProperties = TextProperties;
})();