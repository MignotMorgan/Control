import { Core } from './core.js';

export class Control {
    constructor(){
        this.Geometric;
        this.Draw;
        this.Lineage;
        this.Input;
        this.id = "";
        this.enable = true;
        this.visible = true;
        this.canFocus = true;
    }
    initialize(){}

    get Paint(){ return this.Draw.Paint; }
    get Rectangle(){ return this.Geometric.Rectangle; }
    get Absolute(){ return this.Geometric.Rectangle.Absolute; }
    get Inside(){ return this.Geometric.Rectangle.Inside; }
    get Size(){ return this.Geometric.Rectangle.Size; }
    get Border(){ return this.Geometric.Rectangle.Border; }
    get Transformation(){ return this.Geometric.Transformation; }
    get Move(){ return this.Geometric.Transformation.Move; }
    get Resize(){ return this.Geometric.Transformation.Resize; }
    get Scale(){ return this.Geometric.Transformation.Scale; }
    get Drag(){ return this.Lineage.Drag; }
    get Drop(){ return this.Lineage.Drop; }
    get Mouse(){ return this.Input.Mouse; }
    get Keyboard(){ return this.Input.Keyboard; }
    get Theme(){ return this.Draw.Theme; }
    get customTheme(){ return this.Draw.customTheme(); }

    get canMove(){ return this.Geometric.Transformation.Move.active; }
    set canMove(value){ this.Geometric.Transformation.Move.active = value; }
    get canResize(){ return this.Geometric.Transformation.Resize.active; }
    set canResize(value){ this.Geometric.Transformation.Resize.active = value; }
    get canScale(){ return this.Geometric.Transformation.Scale.active; }
    set canScale(value){ this.Geometric.Transformation.Scale.active = value; }

    get canDrag(){ return this.Lineage.Drag.active }
    set canDrag(value){ this.Lineage.Drag.active = !!value }
    get canDrop(){ return this.Lineage.Drop.active }
    set canDrop(value){ this.Lineage.Drop.active = !!value; }

    get form(){ return this.Lineage.form; }
    get parent(){ return this.Lineage.parent; }
    get children(){ return this.Lineage.children; }   
    get right(){ return this.Absolute.x + this.Size.width; }
    get bottom(){ return this.Absolute.y + this.Size.height; }

    get clip(){ return this.Draw.clip; }
    set clip(value){ this.Draw.clip = value; }

    isForm(){ return this.Lineage.form === this; }

    containMouse(){ return this.Geometric.Rectangle.containMouse(); }
    contains(x, y){ return this.Geometric.Rectangle.contains(x, y); }
    add(control){ this.Lineage.add(control); }
    remove(control){ return this.Lineage.remove(control); }
    onDraw(){ this.Draw.execute(); }

    onFocus(){
        if( this.canFocus ){ 
            Core.focus = this; 
            if(this.parent != null){ this.parent.Lineage.firstPosition(this); }
        } else if( this.parent != null ){
            this.parent.onFocus();
        }
    }
}

