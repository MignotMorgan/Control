class Paint{
    constructor(x, y, width, height, hide = false){
        this.hide = hide;
    }

    get font(){ throw new Error('Paint.font getter must be implemented by the subclass'); }
    set font(value){ throw new Error('Paint.font setter must be implemented by the subclass'); }
    get textbaseline(){ throw new Error('Paint.textbaseline getter must be implemented by the subclass'); }
    set textbaseline(value){ throw new Error('Paint.textbaseline setter must be implemented by the subclass'); }
    get fillColor(){ throw new Error('Paint.fillColor getter must be implemented by the subclass'); }
    set fillColor(value){ throw new Error('Paint.fillColor setter must be implemented by the subclass'); }

    clear(){ throw new Error('Paint.clear() must be implemented by the subclass'); }
    save(){ throw new Error('Paint.save() must be implemented by the subclass'); }
    restore(){ throw new Error('Paint.restore() must be implemented by the subclass'); }
    move(x, y){ throw new Error('Paint.move(x, y) must be implemented by the subclass'); }
    resize(width, height){ throw new Error('Paint.resize(width, height) must be implemented by the subclass'); }
    measureText(text){ throw new Error('Paint.measureText(text) must be implemented by the subclass'); }
    cutText(text, width){ throw new Error('Paint.cutText(text, width) must be implemented by the subclass'); }
    borderRectangle(x, y, width, height, color = 'black'){ throw new Error('Paint.borderRectangle(...) must be implemented by the subclass'); }
    drawRectangle(x, y, width, height, color = 'black'){ throw new Error('Paint.drawRectangle(...) must be implemented by the subclass'); }
    drawText(x, y, text, options = {}){ throw new Error('Paint.drawText(...) must be implemented by the subclass'); }
    drawTextBackground(x, yTop, text, options = {}){ throw new Error('Paint.drawTextBackground(...) must be implemented by the subclass'); }
    borderRectangleStyled(x, y, width, height, options = {}){ throw new Error('Paint.borderRectangleStyled(...) must be implemented by the subclass'); }
    withAlpha(alpha, fn){ throw new Error('Paint.withAlpha(alpha, fn) must be implemented by the subclass'); }
    clipRectangle(x, y, width, height, fn){ throw new Error('Paint.clipRectangle(x, y, width, height, fn) must be implemented by the subclass'); }
    drawImage(image, x, y, width, height){ throw new Error('Paint.drawImage(...) must be implemented by the subclass'); }
    default(){ throw new Error('Paint.default() must be implemented by the subclass'); }
    dispose(){ throw new Error('Paint.dispose() must be implemented by the subclass'); }
}

class PaintCanvas extends Paint{
    constructor(x, y, width, height, hide = false){
        super(x, y, width, height, hide);
        this.canvas = document.createElement('canvas');
        this.canvas.style.border = '2px solid black';
        if(this.hide)
            this.canvas.style.display = 'none';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = x+"px";
        this.canvas.style.top = y+"px";
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.oncontextmenu = ()=> { return false; };
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        this.default();
    }
    
    get font(){ return this.context.font; }
    set font(value){ this.context.font = value; }
    get textbaseline(){ return this.context.textBaseline; }
    set textbaseline(value){ this.context.textBaseline = value; }
    get fillColor(){ return this.context.fillStyle; }
    set fillColor(value){ this.context.fillStyle = value; }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    save(){ this.context.save(); }
    restore(){ this.context.restore(); }
    dispose(){
        try{
            if(this.canvas && this.canvas.parentNode){
                this.canvas.parentNode.removeChild(this.canvas);
            }
        } catch(_){}
        this.canvas = null;
        this.context = null;
    }
    default(){
        const ctx = this.context;
        ctx.fillStyle = "#000000";
        ctx.filter = "none";
        ctx.font = "10px sans-serif";
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "butt";
        ctx.lineDashOffset = 0;
        ctx.lineJoin = "miter";
        ctx.lineWidth = 1;
        ctx.miterLimit = 10;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#000000";
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
    }
    move(x, y){
        this.canvas.style.left = x+"px";
        this.canvas.style.top = y+"px";
    }    
    resize(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
    }
    measureText(text){ return this.context.measureText(text); }
    cutText(text, width){
        if(!text || text.length === 0) return ["", ""];
        if(!(width > 0)) return ["", text];

        const ctx = this.context;
        const full = ctx.measureText(text).width;
        if(full <= width) return [text, ""];
        let lo = 0;
        let hi = text.length;
        while(lo < hi){
            const mid = Math.floor((lo + hi + 1) / 2);
            const w = ctx.measureText(text.slice(0, mid)).width;
            if(w <= width){
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        const head = text.slice(0, lo);
        const tail = text.slice(lo);
        return [head, tail];
    }
    borderRectangle(x, y, width, height, color = "black", lineWidth = 1){
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.strokeRect(x, y, width, height);
    }
    drawRectangle(x, y, width, height, color = "black"){
        const ctx = this.context;
        const prevFill = ctx.fillStyle;
        try{
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        } finally {
            ctx.fillStyle = prevFill;
        }
    }
    drawTextBackground(x, yTop, text, options = {}){
        const { color = "#c5cae9", alpha = 0.35, height, yOffset = 0 } = options;
        if(!text || text.length === 0) return;
        if(!height || height <= 0){
            return;
        }
        const w = this.measureText(text).width;
        if(!w || w <= 0) return;
        this.withAlpha(alpha, ()=>{
            this.drawRectangle(x, yTop + yOffset, w, height, color);
        });
    }
    drawText(x, y, text, options = {}){
        const ctx = this.context;
        const {
            color = "",
            font = "",
            underline = false,
            background = null,
        } = options || {};

        if(background){
            this.drawTextBackground(x, y, text, background);
        }

        if(!text || text.length === 0){
            return;
        }

        if(color !== ""){
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
        if(font !== "") ctx.font = font;
        ctx.fillText(text, x, y);

        if(underline){
            const m = ctx.measureText(text);
            let underlineY;
            if(ctx.textBaseline === 'top'){
                if(background && background.height){
                    underlineY = y + background.height - 2;
                } else if(typeof m.actualBoundingBoxAscent === 'number' && typeof m.actualBoundingBoxDescent === 'number'){
                    underlineY = y + (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) - 2;
                } else {
                    underlineY = y + 12;
                }
            } else {
                underlineY = y + 2;
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, underlineY);
            ctx.lineTo(x + m.width, underlineY);
            ctx.stroke();
        }
    }
    borderRectangleStyled(x, y, width, height, options = {}){
        const { color = "black", lineWidth = 2, dash = [], dashOffset = 0 } = options;
        const ctx = this.context;
        const prev = { strokeStyle: ctx.strokeStyle, lineWidth: ctx.lineWidth, dash: ctx.getLineDash(), dashOffset: ctx.lineDashOffset };
        try{
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            if(ctx.setLineDash){ ctx.setLineDash(dash); }
            if(typeof dashOffset === 'number'){ ctx.lineDashOffset = dashOffset; }
            ctx.strokeRect(x, y, width, height);
        } finally {
            ctx.strokeStyle = prev.strokeStyle;
            ctx.lineWidth = prev.lineWidth;
            if(ctx.setLineDash){ ctx.setLineDash(prev.dash || []); }
            ctx.lineDashOffset = prev.dashOffset || 0;
        }
    }
    withAlpha(alpha, fn){
        const ctx = this.context;
        const prev = ctx.globalAlpha;
        try{
            ctx.globalAlpha = alpha;
            fn();
        } finally {
            ctx.globalAlpha = prev;
        }
    }
    clipRectangle(x, y, width, height, fn){
        const ctx = this.context;
        ctx.save();
        try{
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
            if(typeof fn === 'function') fn();
        } finally {
            ctx.restore();
        }
    }

    drawImage(image, x, y, width, height){
        this.context.drawImage(image, x, y, width, height);
    }
}    
