class Lineage {
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
    add(control) {
        if(!control || control === this.control) return false;
        if(this.max === 0) return false;
        if(this.max > -1 && this.max <= this.children.length) return false;
        if(control.parent === this.control) return true;
        //if(this.isAncestor(this.control, control)) return false;
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
    /*
    isAncestor(candidate, node){
        let p = node ? node.parent : null;
        while(p){
            if(p === candidate) return true;
            p = p.parent;
        }
        return false;
    }
    */
   /*
    bringToFront(control){
        const children = this.children;
        const c = control || this.control;
        if(!c) return false;
        let i = children.indexOf(c);
        if(i === -1) return false;
        if(i === children.length - 1) return true;
        children.splice(i, 1);
        children.push(c);
        return true;
    }
    bringHierarchyToFront(control = this.control){
        let node = control || this.control;
        while(node && node.parent){
            node.parent.Lineage.bringToFront(node);
            node = node.parent;
        }
        return true;
    }
    */
   /*
    removeChild(control){
        if(!control) return false;
        if(control.parent !== this.control) return false;
        control.Lineage.destroy();
        return this.remove(control);
    }
    */
    changedParent(){
        this.form = this.Parent.Lineage.form;
        this.control.Move.parentMove();
        let children = this.children;
        if(children && children.length)
            for(let i = 0; i < children.length; i++)
                children[i].Move.parentMove();
        //if(reposition){
        //    const p = this.control.parent;
        //    const px = p.x + p.Border.left;
        //    const py = p.y + p.Border.top;
        //    this.control.Move.to(px + this.control.Inside.x, py + this.control.Inside.y);
        //}
    }
    firstPosition(control)
    {
        if(!control) return;
        const children = this.children;
        //const c = control || this.control;
        let i = children.indexOf(control);
        if(i === -1) return;
        if(i < children.length - 1){
            //if(!(control.canMove === false && children[i-1] && children[i-1].canMove === true)){
            if(control.canMove){
                children.splice(i, 1);
                children.push(control);
            }
        }
        if(this.parent != null) this.parent.Lineage.firstPosition(this.control);
    }
    /*
    destroy(){
        let children = this.children;
        if(children && children.length){
            while(children && children.length > 0){
                const child = children[0];
                this.removeChild(child);
            }
        }
        try { this.control.clip = false; } catch(_){ }
        if(this.control && this.control.Paint && typeof this.control.Paint.dispose === 'function'){
            try { this.control.Paint.dispose(); } catch(_){ }
        }
    }
    */
}
