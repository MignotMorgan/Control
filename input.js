class Mouse {
    constructor(control){
        this.control = control;
    }
    hover(){
        const control = this.control;
        const form = control.form;
        const children = control.children;
        if(typeof dragdrop !== 'undefined' && dragdrop.active){
            let isDraggedOrDesc = false;
            if(dragdrop.control){
                if(control === dragdrop.control){
                    isDraggedOrDesc = true;
                } else {
                    let p = control.parent;
                    while(p){
                        if(p === dragdrop.control){ isDraggedOrDesc = true; break; }
                        p = p.parent;
                    }
                }
            }
            if(isDraggedOrDesc) return;
        }

        mousehover.selected = control;

        if(control.clip === false || (mouse.x >= form.Inside.x + control.Absolute.x+control.Border.left 
            && mouse.x <= form.Inside.x + control.right-control.Border.right 
            && mouse.y >= form.Inside.y + control.Absolute.y+control.Border.top 
            && mouse.y <= form.Inside.y + control.bottom-control.Border.bottom
        ))
        {
            if( children !== null )
                for(var i = 0; i < children.length; i++){       
                    if ( children[i].enable && children[i].containMouse() ){
                        children[i].Mouse.hover();
                        return;
                    }
                }
        }
    }
    enter(){}
    leave(){}
    clickLeft(){};
    clickLeftUp(){};
    clickRight(){};
    clickRightUp(){};
    wheel(deltaX, deltaY){ }
}

class Keyboard {
    constructor(control) {
        this.control = control;
    }
    onKeyDown(){ }
    onKeyUp(){ }
}
class Input {
    constructor(control){
        this.control = control;
        this.Mouse;
        this.Keyboard;
    }
}
