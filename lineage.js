/**
 * Gère la relation hiérarchique d'un contrôle:
 * - parent / enfants
 * - index d'empilement (z-order)
 * - rattachement au form racine
 */
class Lineage {
    constructor(control) {
        this.control = control;
        this.Drag;
        this.Drop;
        this.children = null;
        this.max = -1; // -1 = unlimited; 0 = none;
        this.index = 0;
        this.parent = null;
        this.form = null;
    }
    unlimited() { this.max = -1; }
    none(){ this.max = 0; }
    get Max(){ return this.max; }
    set Max(value){ this.max = value; }
    get Index(){ return this.index; }
    set Index(value){ this.index = value; }
    get Parent(){ return this.parent; }
    set Parent(value){ this.parent = value; }

    /**
     * Ajoute un enfant à la fin de la liste.
     * Retourne false si la capacité est atteinte.
     */
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
    /** Retire un enfant et réindexe les suivants. */
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
        // Réindexe les enfants restants
        for(let i=0;i<this.children.length;i++){
            this.children[i].Lineage.index = i;
        }
        control.Lineage.parent = null;
        return true;
    }
    /**
     * Supprime un enfant du contrôle courant en nettoyant d'abord ses ressources.
     * Equivalent de l'ancien Control.remove(control):
     * - vérifie l'appartenance
     * - détruit proprement l'enfant (récursif)
     * - détache de la hiérarchie via Lineage.remove
     */
    removeChild(control){
        if(!control) return false;
        if(control.parent !== this.control) return false;
        // Nettoyage des ressources de l'enfant avant le détachement
        control.Lineage.destroy();
        return this.remove(control);
    }
    /**
     * Appelé après changement de parent pour:
     * - propager la référence au form
     * - repositionner l'enfant en absolu selon son Inside et le parent
     */
    changedParent(){
        this.form = this.Parent.Lineage.form;
        let children = this.children;
        if(children != null)
            for(let i = 0; i < children.length; i++)
                children[i].Lineage.changedParent();
        this.control.Transformation.Move.to(this.control.parent.x + this.control.parent.Border.left + this.control.Inside.x, this.control.parent.y + this.control.parent.Border.top + this.control.Inside.y);
    }
    /** Remonte un enfant au premier plan (z-order maximum) récursivement. */
    firstPosition(control)
    {
        let children = this.children;
        if(control != null && control.Lineage.index > 0)
        {
            for( let i = control.Lineage.index; i > 0; i-- )
            {
                if(!control.canMove && children[i-1].canMove)return;
                children[i] = children[i-1];
                children[i].Lineage.index = i;
                children[i-1] = control;
                children[i-1].Lineage.index = i-1;
            }
        }
        if(this.parent != null) this.parent.Lineage.firstPosition(this.control);
    }

    /**
     * Détruit proprement ce contrôle et ses ressources:
     * - détruit récursivement ses enfants (removeChild qui appelle destroy)
     * - désactive le clipping
     * - libère le canvas associé si présent (Form par exemple)
     * Ne détache pas ce contrôle de son parent; cela reste la responsabilité
     * de parent.Lineage.removeChild(child) ou équivalent.
     */
    destroy(){
        // Détruit récursivement tous les enfants
        let children = this.children;
        if(children && children.length){
            while(children && children.length > 0){
                const child = children[0];
                this.removeChild(child);
            }
        }
        // Libère le clipping via le setter de Control
        try { this.control.clip = false; } catch(_){ }
        // Libère le canvas associé si nécessaire (Form a un paint)
        if(this.control && this.control.paint && typeof this.control.paint.dispose === 'function'){
            try { this.control.paint.dispose(); } catch(_){ }
        }
    }
}
