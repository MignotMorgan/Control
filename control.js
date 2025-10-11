let controls = [];
let mouse = {x:0, y:0, down:Date.now(), up:Date.now(), time:0};
let mousehover = {control:null, selected:null};
let Modifiers = { shift:false, ctrl:false, alt:false, meta:false, capslock:false, keyCode:0, key:"", shortcut:"" };
// offset représente le pixel où vous avez cliquer dans le Control (Drag). 
// Cela permet de ne  pas repositionner le contrôle en alignant son coin haut-gauche directement sous la souris.
// C'est utilisé pour conserver l'articulation visuelle de la prise, de sorte que le point “saisi” au départ reste sous la souris.
let dragdrop = {armed:false, active:false, control:null, parent:null, target:null, srcX:0, srcY:0, startX:0, startY:0, offsetX:0, offsetY:0, data:{ text:"", files: null }};
let transformation = {control:null, x:0, y:0, resize:false, border:5, left:false, top:false, right:false, bottom:false, lock:false};
let focus = null;

/**
 * Représente un contrôle visuel rectangulaire pouvant contenir des enfants.
 * Responsabilités:
 * - Gestion géométrique via `Geometric` (Rectangle, Transformation, Draw)
 * - Gestion hiérarchique via `Lineage` (parent, enfants, z-order)
 * - Gestion des entrées via `Input` (Mouse/Keyboard)
 * Propriétés usuelles exposées en getters/setters: x, y, width, height, canMove/Resize/Scale/Drag/Drop
 */
class Control {
    constructor() {
        this.Geometric;
        this.Lineage;
        this.Input;

        this.id = "";
        this.enable = true;
        this.visible = true;
        this.canFocus = true;
    }
    initialize(){}

    get Rectangle(){ return this.Geometric.Rectangle; }
    get Inside(){ return this.Geometric.Rectangle.Inside; }
    get Border(){ return this.Geometric.Rectangle.Border; }
    get Draw(){ return this.Geometric.Draw; }
    get Drag(){ return this.Lineage.Drag; }
    get Drop(){ return this.Lineage.Drop; }
    get Transformation(){ return this.Geometric.Transformation; }
    get Mouse(){ return this.Input.Mouse; }
    get Keyboard(){ return this.Input.Keyboard; }

    get x(){return this.Geometric.Rectangle.Location.x;}
    set x(value){this.Geometric.Rectangle.Location.x = value;}
    get y(){return this.Geometric.Rectangle.Location.y;}
    set y(value){this.Geometric.Rectangle.Location.y = value;}
    get width(){return this.Geometric.Rectangle.Size.width;}
    set width(value){this.Geometric.Rectangle.Size.width = value;}
    get height(){return this.Geometric.Rectangle.Size.height;}
    set height(value){this.Geometric.Rectangle.Size.height = value;}

    get canMove(){return this.Geometric.Transformation.Move.active;}
    set canMove(value){this.Geometric.Transformation.Move.active = value;}
    get canResize(){return this.Geometric.Transformation.Resize.active;}
    set canResize(value){this.Geometric.Transformation.Resize.active = value;}
    get canScale(){return this.Geometric.Transformation.Scale.active;}
    set canScale(value){this.Geometric.Transformation.Scale.active = value;}

    get canDrag(){ return this.Lineage.Drag.active }
    set canDrag(value){ this.Lineage.Drag.active = !!value }
    get canDrop(){ return this.Lineage.Drop.active }
    set canDrop(value){ this.Lineage.Drop.active = !!value; }

    get form(){return this.Lineage.form;}
    get parent(){return this.Lineage.parent;}
    get children(){return this.Lineage.children;}   
    get right(){return this.x + this.width;};
    get bottom(){return this.y + this.height;};

    get clip(){ return this.Draw.clip; }
    set clip(value){ this.Draw.clip = value; }

    containMouse(){ return this.Geometric.Rectangle.containMouse(); }
    contains(x, y){ return this.Geometric.Rectangle.contains(x, y); }
    add(control){ this.Lineage.add(control); }
    remove(control){ return this.Lineage.removeChild(control); }
    destroy(){ this.Lineage.destroy(); }
    onDraw(context, x, y){ this.Geometric.Draw.execute(context, x, y); }

    onFocus(){
        if( this.canFocus ){ focus = this; this.Lineage.firstPosition(null); }
        else if ( this.parent != null ) this.parent.onFocus();
    }
}

/**
 * Racine d'affichage: un contrôle spécialisé qui possède un support de rendu (`paint`).
 * Sert de "surface" principale pour dessiner la scène et héberger l'arbre de contrôles.
 */
class Form extends Control {
    constructor() {
        super();
    
        controls[controls.length] = this;

        this.paint = null;
    }
    initialize(){
        super.initialize();
        this.Lineage.form = this;        
        this.x = 0;
        this.y = 0;        
    }    
}
