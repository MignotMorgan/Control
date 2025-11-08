class Draw {
    #Paint;
    constructor(control){
        this.control = control;
        this.#Paint = null;
        this.#clip = false;
        this.Theme = new Theme();
    }
    #clip;
    get clip(){ return this.#clip === true; }
    set clip(value){ this.#clip = !!value; }

    get Paint(){
        if(this.#Paint !== null) return this.#Paint;
        const form = this.control && this.control.form;
        if(form && form.Draw && form.Draw.Paint != null) return form.Draw.Paint; 
        return null;
    }
    set Paint(value){ this.#Paint = value; }    
    execute(){
        if(dragdrop.control === this.control){
            this.drawDrag();
        }else{
            this.draw();
        }
    }
    drawChildren(){
        const control = this.control;
        const children = control.children;

        for(let i = 0; i < children.length; i++)
            if ( children[i].visible )
                children[i].Draw.execute();
    }
    draw(){
        const control = this.control;
        const paint = this.Paint;
        const rect = control.Rectangle.rectangleBackground();
        this.drawBackground();
        this.drawBorder();

        if ( control.canResize && ( mousehover.control === control || transformation.control === control))
            this.drawResize();

        if(this.#clip === true){
            paint.clipRectangle(rect.x, rect.y, rect.width, rect.height, () => { this.drawChildren(); });
        }else{
            this.drawChildren();
        }
    }
    drawDrag(){
        const control = this.control;
        const paint = this.Paint;
        const theme = this.Theme.drag;
        paint.withAlpha(theme.alpha, () => {
            this.draw();
            paint.drawRectangle(control.Absolute.x, control.Absolute.y, control.Size.width, control.Size.height, theme.color);
        });
    }
    drawBackground(){
        const control = this.control;
        const paint = this.Paint;
        const rect = control.Rectangle.rectangleBackground();
        const theme = this.Theme.background;

        paint.drawRectangle(rect.x, rect.y, rect.width, rect.height, theme.color);
        if(theme.image.Url){
            this.drawBackgroundImage( rect.x, rect.y, rect.width, rect.height, this.Theme.backgroundImage, theme.image.mode);
        }
        if (theme.rectangle.lineWidth > 0){
            paint.borderRectangleStyled(rect.x, rect.y, rect.width, rect.height, { color: theme.rectangle.color, lineWidth: theme.rectangle.lineWidth, style: theme.rectangle.style });
        }
    }
    drawBackgroundImage(x, y, w, h, image, mode = 'stretch'){
        const paint = this.Paint;
        const imgW = image.naturalWidth || image.width;
        const imgH = image.naturalHeight || image.height;
        if(!imgW || !imgH) return;
        if(mode === 'stretch'){
            paint.drawImage(image, x, y, w, h);
            return;
        }
        if(mode === 'none'){
            paint.drawImage(image, x, y, imgW, imgH);
            return;
        }
        const ratioImage = imgW / imgH;
        const ratioRect = w / h;
        let dw, dh, dx, dy;
        if(mode === 'cover'){
            if(ratioImage > ratioRect){ dh = h; dw = dh * ratioImage; } else { dw = w; dh = dw / ratioImage; }
        } else {
            if(ratioImage > ratioRect){ dw = w; dh = dw / ratioImage; } else { dh = h; dw = dh * ratioImage; }
        }
        dx = x + (w - dw) / 2;
        dy = y + (h - dh) / 2;
        paint.drawImage(image, dx, dy, dw, dh);
    }
    drawBorder(){
        const control = this.control;
        const paint = this.Paint;
        const border = control.Border;
        const x = control.Absolute.x;
        const y = control.Absolute.y;   
        const width = control.Size.width;
        const height = control.Size.height;
        const theme = this.Theme.background;
        paint.drawRectangle(x, y, width, border.top, theme.border.color);
        paint.drawRectangle(x, y, border.left, height, theme.border.color);
        paint.drawRectangle(x+width-border.right, y, border.right, height, theme.border.color);
        paint.drawRectangle(x, y+height-border.bottom, width, border.bottom, theme.border.color);
        if(theme.border.rectangle.lineWidth > 0)
            paint.borderRectangle(x, y, width, height, theme.border.rectangle.color, theme.border.rectangle.lineWidth);
    }
    drawResize(){
        const control = this.control;
        const paint = this.Paint;
        const x = control.Absolute.x;
        const y = control.Absolute.y;
        const width = control.Size.width;
        const height = control.Size.height;

        const hs = 8;
        const half = Math.floor(hs/2);
        const left = x;
        const right = x + width;
        const top = y;
        const bottom = y + height;
        const cx = x + Math.floor(width/2);
        const cy = y + Math.floor(height/2);
        const handles = [
            [left, top],           // TL
            [cx, top],             // T
            [right, top],          // TR
            [right, cy],           // R
            [right, bottom],       // BR
            [cx, bottom],          // B
            [left, bottom],        // BL
            [left, cy]             // L
        ];

        paint.withAlpha(0.9, ()=>{
            for(let i=0;i<handles.length;i++){
                const hx = handles[i][0] - half;
                const hy = handles[i][1] - half;
                paint.drawRectangle(hx, hy, hs, hs, "#ffffff");
                paint.borderRectangle(hx, hy, hs, hs, "#2979ff");
            }
        });
    }

}

class DrawForm extends Draw {
    constructor(control){
        super(control);
    }
    draw(){
        super.draw();
        const control = this.control;
        const paint = control.form.Paint;
        let ix = 20
        let iy = 20;
        paint.drawText(ix, iy, "souris : " + mouse.x + " : " + mouse.y + " temps : " + mouse.time);
        iy += 20;
        if (focus !== null){
            paint.drawText(ix, iy, "focus : " + focus.id );
        } else {
            paint.drawText(ix, iy, "focus : null");
        }
        //iy += 20;
        if(mousehover.control != null && mousehover.selected != null){
            iy += 20;
            paint.drawText(ix, iy, "souris dans le contrôle : " + (mouse.x - mousehover.control.form.Inside.x - mousehover.control.Absolute.x) + " : " + (mouse.y - mousehover.control.form.Inside.y - mousehover.control.Absolute.y));
            iy += 20;
            paint.drawText(ix, iy, "mousehover : " + mousehover.control.id + " X: " + mousehover.control.Inside.x + " Y: " + mousehover.control.Inside.y + " width: " + mousehover.control.Size.width + " height: " + mousehover.control.Size.height + " parent: " + (mousehover.control.parent === null ? "null" : mousehover.control.parent.id));
        }
        iy += 20;
        if(transformation.control != null)
            paint.drawText(ix, iy, "transformation : " + transformation.control.id + " redim: " + transformation.resize + " gauche: " + transformation.left + " haut: " + transformation.top + " droite: " + transformation.right + " bas: " + transformation.bottom);
        else
            paint.drawText(ix, iy, "transformation : null");

        iy += 20;
        paint.drawText(ix, iy, "armed: " + dragdrop.armed + " active: " + dragdrop.active + " control: " + (dragdrop.control === null ? "null" : dragdrop.control.id) + " parent: " + (dragdrop.parent === null ? "null" : dragdrop.parent.id) + " target: " + (dragdrop.target === null ? "null" : dragdrop.target.id));
    }
    drawChildren(){
        super.drawChildren();
        if(dragdrop.control != null)dragdrop.control.Draw.execute();
    };
}
