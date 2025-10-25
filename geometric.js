class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Border {
    constructor(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
}

class Rectangle {
    constructor(control){
        this.control = control;
        this.Location;
        this.Absolute;
        this.Inside;
        this.Size;
        this.Border;
    }
    containMouse(){
        return this.contains(mouse.x, mouse.y);
    }
    contains(x, y){
        const control = this.control;
        const location = this.Absolute;
        return ( x > control.form.Inside.x +  location.x && x < control.form.Inside.x + location.x + this.Size.width 
            && y > control.form.Inside.y + location.y && y < control.form.Inside.y + location.y + this.Size.height );
    }
    rectangleBackground(){
        const control = this.control;
        const location = this.Absolute;
        const size = this.Size;
        const border = this.Border;
        return {
            x: location.x + border.left,
            y: location.y + border.top,
            width: size.width - border.left - border.right,
            height: size.height - border.top - border.bottom
        };
    }
}

class Geometric{
    constructor(control){
        this.control = control;
        this.Rectangle;
        this.Transformation;
    }
}
