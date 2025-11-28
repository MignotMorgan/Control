import { Core } from './core.js';

export class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

export class Size {
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
}

export class Border {
    constructor(top, right, bottom, left){
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
}

export class Rectangle {
    constructor(control){
        this.control = control;
        this.Location;
        this.Absolute;
        this.Inside;
        this.Size;
        this.Border;
    }
    containMouse(){
        const mouse = Core.mouse;
        return this.contains(mouse.x, mouse.y);
    }
    contains(x, y){
        const form = this.control.form;
        return ( x > form.Inside.x +  this.Absolute.x && x < form.Inside.x + this.Absolute.x + this.Size.width 
            && y > form.Inside.y + this.Absolute.y && y < form.Inside.y + this.Absolute.y + this.Size.height );
    }
    rectangleBackground(){
        const size = this.Size;
        const border = this.Border;
        return {
            x: this.Absolute.x + border.left,
            y: this.Absolute.y + border.top,
            width: size.width - border.left - border.right,
            height: size.height - border.top - border.bottom
        };
    }
}

export class Geometric {
    constructor(control){
        this.control = control;
        this.Rectangle;
        this.Transformation;
    }
}
