import { Core } from './core.js';

export class Mouse {
    constructor(control){
        this.control = control;
    }
    hover(){
        const control = this.control;
        const form = control.form;
        const children = control.children;
        const mouse = Core.mouse;
        const mousehover = Core.mousehover;
        const dnd = Core.dragdrop;

        if(dnd.active && dnd.control === control) return;

        mousehover.selected = control;

        if(control.clip === false || (mouse.x >= form.Inside.x + control.Absolute.x+control.Border.left 
            && mouse.x <= form.Inside.x + control.right-control.Border.right 
            && mouse.y >= form.Inside.y + control.Absolute.y+control.Border.top 
            && mouse.y <= form.Inside.y + control.bottom-control.Border.bottom
        ))
        {
            for(let i = children.length - 1; i >= 0; i--){
                const child = children[i];
                if ( child && child.enable && child.containMouse() ){
                    if(dnd.active && dnd.control === child)continue;
                    child.Mouse.hover();
                    return;
                }
            }
        }
    }
    inside(){
        const control = this.control;
        const form = control.form;
        const mouse = Core.mouse;
        return  {
            x: mouse.x - form.Inside.x - control.Absolute.x,
            y: mouse.y - form.Inside.y - control.Absolute.y
        }
    }
    enter(){}
    leave(){}
    clickLeft(){};
    clickLeftUp(){};
    clickRight(){};
    clickRightUp(){};
    wheel(deltaX, deltaY){}
}

export class Keyboard {
    constructor(control){
        this.control = control;
    }
    keyDown(){}
    keyUp(){}
}

export class Input {
    constructor(control){
        this.control = control;
        this.Mouse;
        this.Keyboard;
    }
}
