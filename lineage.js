class Lineage {
    constructor(control){
        this.control = control;
        this.Drag;
        this.Drop;
        this.children = null;
        this.max = -1; // -1 = unlimited; 0 = none;
        this.index = 0;
        this.parent = null;
        this.form = null;
    }
    unlimited(){ this.max = -1; }
    none(){ this.max = 0; }
    get Max(){ return this.max; }
    set Max(value){ this.max = value; }
    get Index(){ return this.index; }
    set Index(value){ this.index = value; }
    get Parent(){ return this.parent; }
    set Parent(value){ this.parent = value; }
    add(control) {
        if(this.max === 0) return false;
        if(this.children === null) this.children = [];
        if(this.max > -1 && this.max <= this.children.length) return false;

        control.Lineage.parent = this.control;
        control.Lineage.index = this.children.length;
        this.children[this.children.length] = control;
        control.Lineage.changedParent();

        return true;
    }
    remove(control){
        let children = this.children;
        if(children === null) return false;
        let removed = false;
        const next = [];
        for(let i=0;i<children.length;i++){
            const c = children[i];
            if(c === control){ removed = true; continue; }
            next.push(c);
        }
        if(!removed) return false;
        this.children = next;
        for(let i=0;i<this.children.length;i++){
            this.children[i].Lineage.index = i;
        }
        control.Lineage.parent = null;
        return true;
    }
    removeChild(control){
        if(!control) return false;
        if(control.parent !== this.control) return false;
        control.Lineage.destroy();
        return this.remove(control);
    }
    changedParent(){
        this.form = this.Parent.Lineage.form;
        let children = this.children;
        if(children != null)
            for(let i = 0; i < children.length; i++)
                children[i].Lineage.changedParent();
        this.control.Transformation.Move.to(this.control.parent.x + this.control.parent.Border.left + this.control.Inside.x, this.control.parent.y + this.control.parent.Border.top + this.control.Inside.y);
    }
    firstPosition(control)
    {
        let children = this.children;
        if(control != null && control.Lineage.index > 0){
            for( let i = control.Lineage.index; i > 0; i-- ){
                if(!control.canMove && children[i-1].canMove)return;
                children[i] = children[i-1];
                children[i].Lineage.index = i;
                children[i-1] = control;
                children[i-1].Lineage.index = i-1;
            }
        }
        if(this.parent != null) this.parent.Lineage.firstPosition(this.control);
    }
    destroy(){
        let children = this.children;
        if(children && children.length){
            while(children && children.length > 0){
                const child = children[0];
                this.removeChild(child);
            }
        }
        try { this.control.clip = false; } catch(_){ }
        if(this.control && this.control.paint && typeof this.control.paint.dispose === 'function'){
            try { this.control.paint.dispose(); } catch(_){ }
        }
    }
}
