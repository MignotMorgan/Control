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
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    on(){
        const control = this.control;
        let x = mouse.x - control.form.Inside.x - transformation.x;
        let y = mouse.y - control.form.Inside.y - transformation.y;

        const parent = control.parent;
        if( parent !== null && parent.clip === false){
                control.Transformation.Move.toIn(x, y);
        }
        else{
            this.to(x, y);
        }
    };
    to(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.x - parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.y - parent.Border.top;
        control.x = x;
        control.y = y;

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Move.parentMove();
    }
    toIn(x, y){
        const control = this.control;
        const parent = control.parent;
        if( x > parent.right - parent.Border.right - control.width ) x = parent.right - control.width - parent.Border.right;
        if( y > parent.bottom - parent.Border.bottom - control.height ) y = parent.bottom - control.height - parent.Border.bottom;
        if( x < parent.x + parent.Border.left ) x = parent.x + parent.Border.left;
        if( y < parent.y + parent.Border.top ) y = parent.y + parent.Border.top;
        this.to(x, y);
    };
    toOut(x, y){
        const control = this.control;
        const parent = control.parent;
        if( x > parent.right - control.width ) x = parent.right - control.width;
        if( y > parent.bottom - control.height ) y = parent.bottom - control.height;
        if( x < parent.x ) x = parent.x;
        if( y < parent.y ) y = parent.y;
        this.to(x, y);
    };
    parentMove(){
        const control = this.control;
        const parent = control.parent;
        this.to(parent.x + parent.Border.left + control.Inside.x, parent.y + parent.Border.top + control.Inside.y);
    };

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
    
    on(){
        let x = mouse.x - transformation.x;
        let y = mouse.y - transformation.y;
        this.to(x, y);
    };
    to(x, y){
        const control = this.control;
        control.paint.move(x, y);
    	control.Inside.x = x;
    	control.Inside.y = y;
    	
        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Transformation.Move.parentMove();
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
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    on(){
        const control = this.control;
        let left = control.x;
        let top = control.y;
        let right = control.x + control.width;
        let bottom = control.y + control.height;

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
            if( right < control.x + minsizeWidth )right = control.x + minsizeWidth;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let r = 0; r < control.children.length; r++)
                    if( left + control.children[r].Inside.x + control.children[r].width + control.Border.left + control.Border.right > right )
                        right = left + control.children[r].Inside.x + control.children[r].width + control.Border.left + control.Border.right;
        }
        if( transformation.bottom ){
            bottom = mouse.y - control.form.Inside.y;
            if( control.parent !== null && control.parent.clip === false /*&& !control.parent.IsInherit("Form")*/ && bottom > control.parent.y + control.parent.height - control.parent.Border.bottom ) bottom = control.parent.y + control.parent.height - control.parent.Border.bottom;
            if( bottom < control.y + minsizeHeight )bottom = control.y + minsizeHeight;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let b = 0; b < control.children.length; b++)
                    if( top + control.children[b].Inside.y + control.children[b].height + control.Border.top + control.Border.bottom > bottom )
                        bottom = top + control.children[b].Inside.y + control.children[b].height + control.Border.top + control.Border.bottom;
        }
        if(control.clip === true){
            if( right - left -control.Border.left-control.Border.right < 2)
            {
                if( transformation.left )left = control.x;
                if( transformation.right )right = control.x + control.width;
            }
            if( bottom - top -control.Border.top-control.Border.bottom < 2)
            {
                if( transformation.top )top = control.y;
                if( transformation.bottom )bottom = control.y + control.height;
            }
        }
        if(control.canScale){
            let width = right - left;
            let height = bottom - top;
            let ratio_width = width / control.width;
            let ratio_height = height / control.height;

            let ratio_size = control.Transformation.Scale.minimumScale( {width:ratio_width, height:ratio_height} );
            if(transformation.left && ratio_size.width === 1)left = control.x;
            if(transformation.top && ratio_size.height === 1)top = control.y;
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
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
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
    moveToScale(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.x-parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.y-parent.Border.top;
        control.x = x;
        control.y = y;
    }
    parentScale(ratio_width, ratio_height){
        const control = this.control;
        const parent = control.parent;
        this.moveToScale(parent.x+parent.Border.left+(control.Inside.x*ratio_width), parent.y+parent.Border.top+(control.Inside.y*ratio_height) );
        this.to(ratio_width, ratio_height);
    }
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
    on(){
        const control = this.control;
        if(  transformation.left || transformation.top || transformation.right || transformation.bottom ){
            transformation.control = control;
            transformation.resize = true;
        }
        else if( control.canMove ){
            transformation.control = control;
            transformation.x = mouse.x - control.form.Inside.x - control.x;
            transformation.y = mouse.y - control.form.Inside.y - control.y;
        }
        else if ( control.parent !== null )
            control.parent.Transformation.on();
    }
}

