/**
 * Déplacement (Move): gère la position absolue d'un contrôle
 * - on(): calcule la nouvelle position selon la souris et le contexte
 * - to(x,y): applique une position absolue et propage aux enfants
 * - toIn(x,y): contraint le déplacement à l'intérieur du parent (si non clipé)
 * - toOut(x,y): contraint à l'extérieur (option)
 * - parentMove(): recalcule la position absolue depuis Inside (appel parent)
 */
class Move {
    #active = false;
    constructor(control){
        this.control = control;
        // active is managed via private field #active
    }
    /**
     * Indique si le déplacement est actif.
     * Note: booléen stocké en champ privé `#active`.
     */
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    /**
     * Calcule la nouvelle position cible selon la souris et le contexte courant.
     * - `mouse.x`, `mouse.y`: position globale de la souris.
     * - `transformation.offsetX`, `transformation.offsetY`: décalage initial lors du clic (pour un drag fluide).
     * - Si le parent n'est pas "clipé" (`clip === false`), on contraint le déplacement à l'intérieur du parent via `toIn()`.
     * Terme: «clipping» = limitation de l'affichage/des déplacements à l'intérieur d'un rectangle (ici, celui du parent).
     */
    on(){
        const control = this.control;
        let x = mouse.x - control.form.Inside.x - transformation.offsetX;
        let y = mouse.y - control.form.Inside.y - transformation.offsetY;

        const parent = control.parent;
        if( parent !== null && parent.clip === false){
                control.Transformation.Move.toIn(x, y);
        }
        else{
            this.to(x, y);
        }
    };
    /**
     * Applique une position absolue au contrôle et met à jour ses systèmes de coordonnées.
     * - `control.x`, `control.y`: coordonnées absolues (écran/canvas).
     * - `control.Inside.x`, `control.Inside.y`: coordonnées relatives à l'intérieur du parent (zone utile hors bordures).
     * - `control.Absolute`: alias de la position absolue (utilisée par ailleurs dans le projet).
     * Propage la mise à jour aux enfants via `parentMove()`.
     */
    to(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.Absolute.x - parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.Absolute.y - parent.Border.top;
        control.x = x;
        control.y = y;
        control.Absolute.x = x;
        control.Absolute.y = y;

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Move.parentMove();
    };
    /**
     * Déplace en contraignant la position à rester À L'INTÉRIEUR du parent
     * (hors bordures du parent). Idéal pour des contenus que l'on veut garder visibles.
     */
    toIn(x, y){
        const control = this.control;
        const parent = control.parent;
        if( x > parent.right - parent.Border.right - control.width ) x = parent.right - control.width - parent.Border.right;
        if( y > parent.bottom - parent.Border.bottom - control.height ) y = parent.bottom - control.height - parent.Border.bottom;
        if( x < parent.x + parent.Border.left ) x = parent.x + parent.Border.left;
        if( y < parent.y + parent.Border.top ) y = parent.y + parent.Border.top;
        this.to(x, y);
    };
    /**
     * Déplace en contraignant la position à rester À L'EXTÉRIEUR (ou sur le bord) d'une zone donnée du parent.
     * Optionnel selon le comportement voulu.
     */
    toOut(x, y){
        const control = this.control;
        const parent = control.parent;
        if( x > parent.right - control.width ) x = parent.right - control.width;
        if( y > parent.bottom - control.height ) y = parent.bottom - control.height;
        if( x < parent.x ) x = parent.x;
        if( y < parent.y ) y = parent.y;
        this.to(x, y);
    };
    /**
     * Recalcule la position absolue depuis la position `Inside` (appelé après
     * un déplacement/redimensionnement du parent). Maintient la cohérence des positions enfants.
     */
    parentMove(){
        const control = this.control;
        const parent = control.parent;
        if (parent === null) return;
        this.to(parent.x + parent.Border.left + control.Inside.x, parent.y + parent.Border.top + control.Inside.y);
    };

    /**
     * Simule un défilement du contenu enfant à l'intérieur d'un contrôle clipé.
     * - `stepV`, `stepH`: pas vertical et horizontal (positif ou négatif).
     * - Calcule les limites visibles (zone intérieure = taille - bordures) et
     *   «clamp» les pas pour ne jamais dépasser ces limites.
     * Terme: «clamp» = restreindre une valeur à un intervalle (min/max).
     */
    scroll(stepV = 0, stepH = 0){
        const control = this.control;
        if(!control.clip) return;
        if(control.children === null || control.children.length === 0) return;
        if(stepV === 0 && stepH === 0) return;
        
        let distTop = 0;
        let distBottom = 0;
        let distLeft = 0;
        let distRight = 0;

        for(let i = 0; i < control.children.length; i++){
            const ch = control.children[i];
            if( ch.Inside.y < distTop ) distTop = ch.Inside.y;
            if( ch.Inside.y + ch.height > distBottom ) distBottom = ch.Inside.y + ch.height;
            if( ch.Inside.x < distLeft ) distLeft = ch.Inside.x;
            if( ch.Inside.x + ch.width > distRight ) distRight = ch.Inside.x + ch.width;
        }
        
        const visibleHeight = control.height - control.Border.top - control.Border.bottom;
        const visibleWidth = control.width - control.Border.left - control.Border.right;
        // Blocages (déjà aux bords) — ne pas retourner pour laisser l'autre axe défiler
        if (stepV > 0 && distTop >= 0) stepV = 0; // bord haut atteint
        if (stepV < 0 && distBottom <= visibleHeight) stepV = 0; // bord bas atteint
        if (stepH > 0 && distLeft >= 0) stepH = 0; // bord gauche atteint
        if (stepH < 0 && distRight <= visibleWidth) stepH = 0; // bord droit atteint

        // Clamps pour ne pas dépasser les bords
        if (stepV > 0 && distTop + stepV > 0) stepV = -distTop; // limite au haut
        if (stepV < 0 && distBottom + stepV < visibleHeight) stepV = visibleHeight - distBottom; // limite au bas
        if (stepH > 0 && distLeft + stepH > 0) stepH = -distLeft; // limite à gauche
        if (stepH < 0 && distRight + stepH < visibleWidth) stepH = visibleWidth - distRight; // limite à droite

        for(let i = 0; i < control.children.length; i++){
            const ch = control.children[i];
            ch.Transformation.Move.to(ch.x + stepH, ch.y + stepV);
        }
    }
}
class MoveForm extends Move{
    constructor(control){
        super(control);
    }
    
    /**
     * Variante pour la Form (racine): calcule la position à partir de la souris
     * sans tenir compte d'un parent (coordonnées globales du canvas).
     */
    on(){
        let x = mouse.x - transformation.offsetX;
        let y = mouse.y - transformation.offsetY;
        this.to(x, y);
    };
    /**
     * Déplace la Form via son moteur de peinture (`control.paint.move`) et
     * réinitialise ses coordonnées relatives/absolues, puis met à jour les enfants.
     */
    to(x, y){
        const control = this.control;
        control.paint.move(x, y);
    	control.Inside.x = x;
    	control.Inside.y = y;
    	control.Absolute.x = 0;
    	control.Absolute.y = 0;
    /*	
        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Move.parentMove();
    */
    }
}
/**
 * Redimensionnement (Resize): ajuste largeur/hauteur d'un contrôle
 * en respectant des contraintes (tailles minimales, enfants, clipping).
 */
class Resize {
    #active = false;
    constructor(control){
        this.control = control;
        // active is managed via private field #active
    }
    /**
     * Indique si le redimensionnement est actif.
     */
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    /**
     * Gère le redimensionnement en temps réel selon les bords actifs:
     * - Calcule `left/top/right/bottom` en fonction de la souris et des contraintes.
     * - Contraintes: taille minimale (incluant bordures), respect des enfants (si `!canScale`), et bords du parent si non clipé.
     * - Si `canScale`, applique une MISE À L'ÉCHELLE plutôt qu'un simple resize.
     * Termes:
     * - «taille minimale» = on empêche la zone utile d'être trop petite (ex: < 2px).
     * - «mise à l'échelle» (scale) = multiplication proportionnelle des dimensions (et bordures) par un ratio.
     */
    on(){
        const control = this.control;
        let left = control.Absolute.x;
        let top = control.Absolute.y;
        let right = control.Absolute.x + control.width;
        let bottom = control.Absolute.y + control.height;

        let minsizeWidth = control.Border.left+control.Border.right+1 > transformation.border*2 ? control.Border.left+control.Border.right+1 : transformation.border*2;
        let minsizeHeight = control.Border.top+control.Border.bottom+1 > transformation.border*2 ? control.Border.top+control.Border.bottom+1 : transformation.border*2;
        if( transformation.left ){
            left = mouse.x - control.form.Inside.x;
            if( control.parent !== null && control.parent.clip === false /*&& !control.parent.IsInherit("Form")*/ && left < control.parent.x + control.parent.Border.left )left = control.parent.x + control.parent.Border.left;
            if( left > control.right - minsizeWidth )left = control.right - minsizeWidth;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let l = 0; l < control.children.length; l++)
                    if( left + control.children[l].Inside.x + control.children[l].width + control.Border.left + control.Border.right > right )
                        left = right - control.children[l].Inside.x - control.children[l].width - control.Border.left - control.Border.right;
        }
        if( transformation.top ){
            top = mouse.y - control.form.Inside.y;
            if( control.parent !== null && control.parent.clip === false /*&& !control.parent.IsInherit("Form")*/ && top < control.parent.y + control.parent.Border.top ) top = control.parent.y + control.parent.Border.top;
            if( top > control.bottom - minsizeHeight )top = control.bottom - minsizeHeight;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let t = 0; t < control.children.length; t++)
                    if( top + control.children[t].Inside.y + control.children[t].height + control.Border.top + control.Border.bottom > bottom )
                        top = bottom - control.children[t].Inside.y - control.children[t].height - control.Border.top - control.Border.bottom;
        }
        if( transformation.right ){
            right = mouse.x - control.form.Inside.x;
            if( control.parent !== null && control.parent.clip === false /*&& !control.parent.IsInherit("Form")*/ && right > control.parent.x + control.parent.width - control.parent.Border.right ) right =  control.parent.x + control.parent.width - control.parent.Border.right;
            if( right < control.Absolute.x + minsizeWidth )right = control.Absolute.x + minsizeWidth;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let r = 0; r < control.children.length; r++)
                    if( left + control.children[r].Inside.x + control.children[r].width + control.Border.left + control.Border.right > right )
                        right = left + control.children[r].Inside.x + control.children[r].width + control.Border.left + control.Border.right;
        }
        if( transformation.bottom ){
            bottom = mouse.y - control.form.Inside.y;
            if( control.parent !== null && control.parent.clip === false /*&& !control.parent.IsInherit("Form")*/ && bottom > control.parent.y + control.parent.height - control.parent.Border.bottom ) bottom = control.parent.y + control.parent.height - control.parent.Border.bottom;
            if( bottom < control.Absolute.y + minsizeHeight )bottom = control.Absolute.y + minsizeHeight;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let b = 0; b < control.children.length; b++)
                    if( top + control.children[b].Inside.y + control.children[b].height + control.Border.top + control.Border.bottom > bottom )
                        bottom = top + control.children[b].Inside.y + control.children[b].height + control.Border.top + control.Border.bottom;
        }
        if(control.clip === true){
            if( right - left -control.Border.left-control.Border.right < 2)
            {
                if( transformation.left )left = control.Absolute.x;
                if( transformation.right )right = control.Absolute.x + control.width;
            }
            if( bottom - top -control.Border.top-control.Border.bottom < 2)
            {
                if( transformation.top )top = control.Absolute.y;
                if( transformation.bottom )bottom = control.Absolute.y + control.height;
            }
        }
        if(control.canScale){
            let width = right - left;
            let height = bottom - top;
            let ratio_width = width / control.width;
            let ratio_height = height / control.height;

            let ratio_size = control.Transformation.Scale.minimumScale( {width:ratio_width, height:ratio_height} );
            if(transformation.left && ratio_size.width === 1)left = control.Absolute.x;
            if(transformation.top && ratio_size.height === 1)top = control.Absolute.y;
            if(transformation.left || transformation.top)
                control.Transformation.Scale.moveToScale(left, top);
            control.Transformation.Scale.to(ratio_size.width, ratio_size.height);
        }
        else{
            if(transformation.left || transformation.top)
                control.Transformation.Move.to(left, top);
            this.to(right - left, bottom - top);
        }
    }
    /**
     * Applique le nouveau `width/height` et notifie:
     * - si `clip === true`, ajuste la surface de clipping via `Draw.clipResize()`.
     * - propage un `parentResize()` aux enfants.
     */
    to(width, height=width){
        const control = this.control;
        control.width = width;
        control.height = height;

        if(control.clip === true){
            control.Draw.clipResize(control.width-control.Border.left-control.Border.right, control.height-control.Border.top-control.Border.bottom);
        }

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Resize.parentResize();
    }
    parentResize(){}
}

/** Variante pour la Form: redimensionne également le canvas associé. */
class ResizeForm extends Resize{
    constructor(control){
        super(control);
    }
    /**
     * Variante Form: calcule le redimensionnement dans le repère de la Form.
     * Peut basculer en mode «échelle» si `canScale`.
     */
    on(){
        const control = this.control;
        var left = control.Inside.x;
        var top = control.Inside.y;
        var right = control.Inside.x + control.width;
        var bottom = control.Inside.y + control.height;

        if( transformation.left )left = mouse.x;
        if( transformation.top )top = mouse.y;
        if( transformation.right )right = mouse.x;
        if( transformation.bottom )bottom = mouse.y;

        if(control.canScale){
            var width = right - left;
            var height = bottom - top;
            var ratio_width = width / control.width;
            var ratio_height = height / control.height;

            var ratio_size = control.Transformation.Scale.minimumScale( {width:ratio_width, height:ratio_height} );
            if(transformation.left && ratio_size.width == 1)left = control.Inside.x;
            if(transformation.top && ratio_size.height == 1)top = control.Inside.y;
            if(transformation.left || transformation.top)
                control.Transformation.Scale.moveToScale(left, top);
            control.Transformation.Scale.to(ratio_size.width, ratio_size.height);
        }
        else{
            if(transformation.left || transformation.top)
                control.Transformation.Move.to(left, top);
            this.to(right - left, bottom - top);
        }
    };
    /**
     * Redimensionne la Form et met à jour son canvas via `paint.resize`.
     */
    to(width, height){
        const control = this.control;
        control.paint.resize(width, height);

        control.width = width;
        control.height = height;

        if( control.children != null )
            for(var i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Resize.parentResize();
    };
}

/**
 * Mise à l'échelle (Scale): multiplie les dimensions et bordures,
 * propage l'échelle aux enfants et ajuste les positions Inside.
 */
class Scale {
    #active = false;
    constructor(control) {
        this.control = control;
        // active is managed via private field #active
    }
    /**
     * Indique si la mise à l'échelle est active.
     */
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    /**
     * Applique une mise à l'échelle `ratio_width/ratio_height` sur:
     * - `width/height` du contrôle
     * - bordures (`Border`)
     * - surface de clip si nécessaire
     * Propage l'échelle aux enfants via `parentScale`.
     */
    to(ratio_width, ratio_height){
        const control = this.control;
        control.width = control.width * ratio_width;
        control.height = control.height * ratio_height;

        control.Border.left = control.Border.left * ratio_width;
        control.Border.right = control.Border.right * ratio_width;
        control.Border.top = control.Border.top * ratio_height;
        control.Border.bottom = control.Border.bottom * ratio_height;

        if(control.clip === true)
            control.Draw.clipResize(control.width-control.Border.left-control.Border.right, control.height-control.Border.top-control.Border.bottom);

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Scale.parentScale(ratio_width, ratio_height);
    }
    /**
     * Déplace le contrôle dans le repère de l'échelle (recalcule `Inside` et `x/y`).
     */
    moveToScale(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.x-parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.y-parent.Border.top;
        control.x = x;
        control.y = y;
        control.Absolute.x = x;
        control.Absolute.y = y;
    }
    /**
     * Appelé depuis le parent pour propager l'échelle et repositionner l'enfant
     * en fonction du ratio appliqué.
     */
    parentScale(ratio_width, ratio_height){
        const control = this.control;
        const parent = control.parent;
        this.moveToScale(parent.x+parent.Border.left+(control.Inside.x*ratio_width), parent.y+parent.Border.top+(control.Inside.y*ratio_height) );
        this.to(ratio_width, ratio_height);
    }
    /**
     * Calcule le ratio minimal admissible pour éviter des tailles impossibles:
     * - si `clip === true`, empêche la zone intérieure de passer sous 2px.
     * - respecte les contraintes de redimensionnement (`canResize`).
     * Remarque: retourne potentiellement `width:1` ou `height:1` pour signifier «ne pas réduire».
     */
    minimumScale(ratio_size){
        const control = this.control;
        if(control.clip === true){
            if( (control.width-control.Border.left-control.Border.right) * ratio_size.width < 2)ratio_size.width = 1;
            if( (control.height-control.Border.top-control.Border.bottom) * ratio_size.height < 2)ratio_size.height = 1;
        }
        if(control.canResize && control.width * ratio_size.width < transformation.border*2)ratio_size.width = 1;
        else if(control.width * ratio_size.width < 2)ratio_size.width = 1;
        if(control.canResize && control.height * ratio_size.height < transformation.border*2)ratio_size.height = 1;
        else if(control.height * ratio_size.height < 2)ratio_size.height = 1;
        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                ratio_size = control.children[i].Transformation.Scale.minimumScale(ratio_size);
        return ratio_size;
    }

}
/** Variante pour la Form: redimensionne également le canvas associé. */
class ScaleForm extends Scale{
    constructor(control){
        super(control);
    }
    /**
     * Variante Form: ajuste également la taille du canvas via `paint.resize`.
     */
    to(ratio_width, ratio_height){
        const control = this.control;
        control.paint.resize(control.width*ratio_width, control.height*ratio_height);

        control.width = control.width * ratio_width;
        control.height = control.height * ratio_height;

        control.Border.left = control.Border.left * ratio_width;
        control.Border.right = control.Border.right * ratio_width;
        control.Border.top = control.Border.top * ratio_height;
        control.Border.bottom = control.Border.bottom * ratio_height;

        if( control.children != null )
            for(var i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Scale.parentScale(ratio_width, ratio_height);
    };

    moveToScale(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.x-parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.y-parent.Border.top;
        control.paint.move(x, y);
    };

}
/**
 * Point d'entrée des transformations pour un contrôle.
 * Décide entre redimensionner (bords actifs) ou déplacer.
 */
class Transformation {
    constructor(control) {
        this.control = control;
        this.Move;
        this.Resize;
        this.Scale;
    }
    /**
     * Point d'entrée: décide si l'utilisateur est en train de redimensionner (poignées actives)
     * ou de déplacer le contrôle.
     * - Si un bord est actif (`left/top/right/bottom`), on passe en mode resize.
     * - Sinon, si `canMove` est vrai, on prépare le déplacement (stocke l'offset souris).
     * - Sinon, on délègue au parent (bubbling) pour trouver un contrôle déplaçable.
     * Terme: «poignées de redimensionnement» = petits carrés/repères cliquables sur les bords.
     */
    on(){
        const control = this.control;
        if(  transformation.left || transformation.top || transformation.right || transformation.bottom ){
            transformation.control = control;
            transformation.resize = true;
        }
        else if( control.canMove ){
            transformation.control = control;
            transformation.offsetX = mouse.x - control.form.Inside.x - control.Absolute.x;
            transformation.offsetY = mouse.y - control.form.Inside.y - control.Absolute.y;
        }
        else if ( control.parent !== null )
            control.parent.Transformation.on();
    }
}

