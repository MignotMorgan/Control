import { FactoryText, ControlText } from '../controltext.js';
import { Core } from '../core.js';

export class ControlInfo extends ControlText {
    constructor(){
        super();
        this.readonly = true;
        this.frames = 0;
        this.fps = 0;
        this.lastSec = performance.now();
    }
    tick(){
        super.tick();
        const control = this.control;
        const mouse = Core.mouse;
        const mousehover = Core.mousehover;
        const dnd = Core.dragdrop;
        const transformation = Core.transformation;
        const focus = Core.focus

        this.text = "mouse : " + mouse.x + " : " + mouse.y + " temps : " + mouse.time + "\n";
        this.text += "focus : " + (focus === null ? "null" : focus.id) + "\n"; 
        this.text += "transformation : " + (transformation.control === null ? "null" : transformation.control.id) + "\n";
        this.text += "dnd : " 
            + " armed: " + dnd.armed
            + " active: " + dnd.active
            + " control: " + (dnd.control === null ? "null" : dnd.control.id) 
            + " parent: " + (dnd.parent === null ? "null" : dnd.parent.id) 
            + " target: " + (dnd.target === null ? "null" : dnd.target.id) 
            + "\n";
        this.text += "mousehover : " + (mousehover.control === null ? "null" : "id ; " + mousehover.control.id
            + " x: " + mousehover.control.Inside.x
            + " y: " + mousehover.control.Inside.y 
            + " width: " + mousehover.control.Size.width 
            + " height: " + mousehover.control.Size.height
            ) + "\n";
        if(mousehover.control !== null){
            const mhx = mouse.x - mousehover.control.form.Inside.x - mousehover.control.Absolute.x;
            const mhy = mouse.y - mousehover.control.form.Inside.y - mousehover.control.Absolute.y;
            this.text += "mousehover Inside:  x: " + mhx + " y: " + mhy + "\n";
        } else{
            this.text += "mousehover Inside: \n";
        }

        this.frames++;
        const now = performance.now();
        if (now - this.lastSec >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastSec += 1000;
        }
        this.text += "fps : " + this.fps + "\n";
    }
}

export class FactoryControlInfo extends FactoryText {
    createControl(){ return new ControlInfo(); }
}