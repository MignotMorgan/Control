import { Control } from './control.js';
import { Core } from './core.js';
import { Draw } from './draw.js';
import { Move, Resize, Scale } from './transformation.js';
import { Rectangle, Point, Size, Border } from './geometric.js';
import { PaintCanvas } from './paint.js';
import { Factory } from './factory.js';

export class Form extends Control {
    constructor(){
        super();
        Core.controls.push(this);
    }
    initialize(){
        super.initialize();
        this.Lineage.form = this;
        this.x = 0;
        this.y = 0;        
    }    
}

export class DrawForm extends Draw {
    constructor(control){
        super(control);
    }
    draw(){
        super.draw();
        const control = this.control;
        const paint = control.form.Paint;
        const mouse = Core.mouse;
        const mousehover = Core.mousehover;
        const dnd = Core.dragdrop;
        const transformation = Core.transformation;
        const focus = Core.focus
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
        paint.drawText(ix, iy, "armed: " + dnd.armed + " active: " + dnd.active + " control: " + (dnd.control === null ? "null" : dnd.control.id) + " parent: " + (dnd.parent === null ? "null" : dnd.parent.id) + " target: " + (dnd.target === null ? "null" : dnd.target.id));
    }
    drawChildren(){
        super.drawChildren();
        const dnd = Core.dragdrop;
        if(dnd.control != null)dnd.control.Draw.execute();
    };
}

export class MoveForm extends Move {
    constructor(control){
        super(control);
    }
    on(){
        const mouse = Core.mouse;
        const transformation = Core.transformation;
        let x = mouse.x - transformation.offsetX;
        let y = mouse.y - transformation.offsetY;
        this.to(x, y);
    };
    to(x, y){
        const control = this.control;
        control.Paint.move(x, y);
        control.Inside.x = x;
        control.Inside.y = y;
        control.Absolute.x = 0;
        control.Absolute.y = 0;
    }
}

export class ResizeForm extends Resize {
    constructor(control){
        super(control);
    }
    on(){
        const mouse = Core.mouse;
        const transformation = Core.transformation;
        const control = this.control;
        var left = control.Inside.x;
        var top = control.Inside.y;
        var right = control.Inside.x + control.Size.width;
        var bottom = control.Inside.y + control.Size.height;

        if( transformation.left )left = mouse.x;
        if( transformation.top )top = mouse.y;
        if( transformation.right )right = mouse.x;
        if( transformation.bottom )bottom = mouse.y;

        if(control.canScale){
            var width = right - left;
            var height = bottom - top;
            var ratio_width = width / control.Size.width;
            var ratio_height = height / control.Size.height;

            var ratio_size = control.Scale.minimumScale( {width:ratio_width, height:ratio_height} );
            if(transformation.left && ratio_size.width == 1)left = control.Inside.x;
            if(transformation.top && ratio_size.height == 1)top = control.Inside.y;
            if(transformation.left || transformation.top)
                control.Scale.moveToScale(left, top);
            control.Scale.to(ratio_size.width, ratio_size.height);
        }
        else{
            if(transformation.left || transformation.top)
                control.Move.to(left, top);
            this.to(right - left, bottom - top);
        }
    };
    to(width, height){
        const control = this.control;
        control.Paint.resize(width, height);

        control.Size.width = width;
        control.Size.height = height;

        if( control.children != null )
            for(var i = 0; i < control.children.length; i++)
                control.children[i].Resize.parentResize();
    };
}

export class ScaleForm extends Scale {
    constructor(control){
        super(control);
    }
    to(ratio_width, ratio_height){
        const control = this.control;
        const border = control.Border;
        control.Paint.resize(control.Size.width*ratio_width, control.Size.height*ratio_height);

        control.Size.width = control.Size.width * ratio_width;
        control.Size.height = control.Size.height * ratio_height;

        border.left = border.left * ratio_width;
        border.right = border.right * ratio_width;
        border.top = border.top * ratio_height;
        border.bottom = border.bottom * ratio_height;

        if( control.children != null )
            for(var i = 0; i < control.children.length; i++)
                control.children[i].Scale.parentScale(ratio_width, ratio_height);
    };

    moveToScale(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.Absolute.x - parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.Absolute.y - parent.Border.top;
        control.Paint.move(x, y);
    };

}

export class FactoryForm extends Factory {  
    createControl(){return new Form(); }
    createPaint(x, y, width, height, hide = false){ return new PaintCanvas(x, y, width, height, hide);}
    createRectangle(control, x, y, width, height, top, right, bottom, left){
        let rectangle = new Rectangle(control);
        rectangle.Location = this.createPoint(0, 0);
        rectangle.Absolute = this.createPoint(0, 0);
        rectangle.Inside = this.createPoint(x, y);
        rectangle.Size = this.createSize(width, height);
        rectangle.Border = this.createBorder(top, right, bottom, left);
        return rectangle;
    }
    createDraw(control){
        const draw = new DrawForm(control);
        const paint = this.createPaint(control.Inside.x, control.Inside.y, control.Size.width, control.Size.height);
        draw.Paint = paint;
        draw.Theme = this.createTheme();
        return draw;
    }
    createMove(control){ return new MoveForm(control); }
    createResize(control){ return new ResizeForm(control); }
    createScale(control){ return new ScaleForm(control); }
}


