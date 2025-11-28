export class Lineage {
    constructor(control){
        this.control = control;
        this.Drag;
        this.Drop;
        this.children = [];
        this.max = -1; // -1 = unlimited; 0 = none;
        this.parent = null;
        this.form = null;
    }
    unlimited(){ this.max = -1; }
    none(){ this.max = 0; }
    get Max(){ return this.max; }
    set Max(value){ this.max = value; }
    get Parent(){ return this.parent; }
    set Parent(value){ this.parent = value; }
    add(control){
        if(!control || control === this.control) return false;
        if(this.max === 0) return false;
        if(this.max > -1 && this.max <= this.children.length) return false;
        if(control.parent === this.control) return true;
        if(control.parent) control.parent.Lineage.remove(control);

        control.Lineage.parent = this.control;
        if (control.canMove){ this.children.push(control); }
        else{ this.children.unshift(control); }

        control.Lineage.changedParent();

        return true;
    }
    remove(control){
        if(!control) return false;
        const children = this.children;
        const i = children.indexOf(control);
        if(i === -1) return false;
        children.splice(i, 1);
        control.Lineage.parent = null;
        return true;
    }
    changedParent(){
        this.form = this.Parent.Lineage.form;
        this.control.Move.parentMove();
        let children = this.children;
        if(children && children.length)
            for(let i = 0; i < children.length; i++)
                children[i].Move.parentMove();
    }
    firstPosition(control){
        if(!control) return;
        const children = this.children;
        let i = children.indexOf(control);
        if(i === -1) return;
        if(i < children.length - 1){
            if(control.canMove){
                children.splice(i, 1);
                children.push(control);
            }
        }
        if(this.parent != null) this.parent.Lineage.firstPosition(this.control);
    }
    isAncestor(ancestor){
        const control = this.control;
        const parent = control.parent;
        if(control === ancestor){return true ;}
        else if (parent){ return parent.Lineage.isAncestor(ancestor); }
        else { return false; }
    }
}
