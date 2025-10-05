/**
 * Extension Drag par contrôle (logique source de glisser interne).
 */
class Drag {
    #active = false;
    constructor(control) {
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }

    start(){
        
    }
    /** Retourne vrai si ce contrôle peut démarrer un drag interne. */
    canStartDrag(){ return !!this.active; }
    /** Validation optionnelle côté source pour un drop. Retourne true par défaut. */
    validateDrop(target, info){ return true; }
    /** Début potentiel/démarrage du drag. */
    onStart(info){ /* vide par défaut */ }
    /** Mise à jour pendant drag actif. */
    onUpdate(target, info){ /* vide par défaut */ }
    /** Annulation du drag. */
    onCancel(){ /* vide par défaut */ }
    /** Fin du cycle de drag. */
    onEnd(){ /* vide par défaut */ }
}

/**
 * Extension Drop par contrôle (logique cible de dépôt et DnD HTML5).
 */
class Drop {
    #active = false;
    constructor(control) {
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    /** Valide une opération de drop vers la cible donnée. */
    validateDrop(target, info){ return !!(target && target.canDrop); }
    /** Optionnel: veto/score pour la sélection de cible potentielle. */
    validateDropCandidate(control){ return true; }

    /** Hooks DnD HTML5/externes */
    enter(){}
    over(){}
    leave(){}
    drop(){}
}
